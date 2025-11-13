#include "esp32_I2C.h"
#include <cstring> // strlen

// Singleton used by Wire callbacks
PiI2CSlaveCapture* PiI2CSlaveCapture::self_ = nullptr;

PiI2CSlaveCapture::PiI2CSlaveCapture(uint8_t addr,
                                     int sdaPin,
                                     int sclPin,
                                     int wakePin,
                                     uint32_t i2cHz,
                                     uint32_t captureTimeoutMs)
: addr_(addr),
  sdaPin_(sdaPin),
  sclPin_(sclPin),
  wakePin_(wakePin),
  i2cHz_(i2cHz),
  captureTimeoutMs_(captureTimeoutMs) {}

// Initialize ESP32 as I2C SLAVE at addr_
bool PiI2CSlaveCapture::begin() {
  self_ = this; // register singleton for callbacks

  // Register Wire callbacks *before* begin for safety
  Wire.onReceive(onReceiveThunk);
  Wire.onRequest(onRequestThunk);

  // ESP32-specific Wire.begin overload for SLAVE: (addr, SDA, SCL, freq)
  return Wire.begin(addr_, sdaPin_, sclPin_, i2cHz_);
}

// Wake Pi from halt by pulsing GPIO (wired to Pi GPIO3)
void PiI2CSlaveCapture::wakePi(uint16_t lowMs) {
  // Release first so Pi's pull-up holds line high
  pinMode(wakePin_, INPUT_PULLUP);
  delay(10);
  digitalWrite(wakePin_, LOW);    // pull Pi GPIO3 low to wake
  delay(lowMs);                   // ~150–200 ms reliable
  digitalWrite(wakePin_, HIGH);   // release
}

bool PiI2CMaster::i2cPing_(uint8_t addr) {
  Wire.beginTransmission(addr);
  return (Wire.endTransmission() == 0);
}

bool PiI2CMaster::waitForOnline() {
  uint32_t t0 = millis();
  while (millis() - t0 < bootTimeoutMs_) {
    if (i2cPing_(piAddr_)) return true;
    delay(200);
  }
  return false;
}

size_t PiI2CMaster::i2cReadExact_(uint8_t addr, uint8_t* buf, size_t n) {
  size_t got = 0;
  while (got < n) {
    size_t left  = n - got;
    size_t chunk = (left < chunkBytes_) ? left : chunkBytes_;
    size_t r = Wire.requestFrom((int)addr, (int)chunk, (int)true);
    for (size_t i = 0; i < r && got < n; ++i) buf[got++] = Wire.read();
    if (r == 0) break;
  }
  return got;
}

uint16_t PiI2CMaster::readLengthBE_() {
  Wire.beginTransmission(piAddr_);
  Wire.write(CMD_LENGTH);
  Wire.endTransmission();

  uint8_t len2[2] = {0,0};
  if (i2cReadExact_(piAddr_, len2, 2) != 2) return 0;

  uint16_t L = ((uint16_t)len2[0] << 8) | len2[1];
  if (L == 0 || L >= 4096) return 0; // sanity
  return L;
}

bool PiI2CMaster::readPayloadChunked_(uint16_t totalLen, std::vector<uint8_t>& out) {
  out.clear();
  out.reserve(totalLen);
  uint16_t offset = 0;

  while (offset < totalLen) {
    uint16_t left = totalLen - offset;
    uint16_t want = (left < chunkBytes_) ? left : chunkBytes_;

    Wire.beginTransmission(piAddr_);
    Wire.write(CMD_READ);
    Wire.write((uint8_t)(want   >> 8));
    Wire.write((uint8_t)(want   & 0xFF));
    Wire.write((uint8_t)(offset >> 8));
    Wire.write((uint8_t)(offset & 0xFF));
    Wire.endTransmission();

    size_t got = Wire.requestFrom((int)piAddr_, (int)want);
    if (got != want) {
      // Drain any bytes that did arrive (for debugging) then fail
      for (size_t i = 0; i < got; ++i) out.push_back(Wire.read());
      return false;
    }
    for (size_t i = 0; i < got; ++i) out.push_back(Wire.read());
    offset += want;
  }
  return (out.size() == totalLen);
}

void PiI2CMaster::tellPiDone_() {
  Wire.beginTransmission(piAddr_);
  Wire.write(CMD_DONE);
  Wire.endTransmission();
}

String PiI2CMaster::getField_(const String& payload, const char* key) {
  int k = payload.indexOf(key);
  if (k < 0) return String();
  int start = k + (int)strlen(key);
  int end = payload.indexOf(';', start);
  if (end < 0) end = payload.length();
  return payload.substring(start, end);
}

String PiI2CMaster::captureRaw(bool doWakeFirst) {
  if (doWakeFirst) {
    wakePulse(); // harmless if Pi already up
  }

  // Ensure I2C is initialized (for robustness)
  Wire.begin(sdaPin_, sclPin_, i2cHz_);

  // Wait for the Pi’s I2C slave to respond
  if (!waitForOnline()) {
    return String("ERR_PI_OFFLINE");
  }

  // Command: start capture/analyze
  Wire.beginTransmission(piAddr_);
  Wire.write(CMD_START);
  Wire.endTransmission();

  // Poll for length up to procTimeoutMs_
  uint16_t totalLen = 0;
  {
    uint32_t t0 = millis();
    while (millis() - t0 < procTimeoutMs_) {
      totalLen = readLengthBE_();
      if (totalLen) break;
      delay(100);
    }
  }
  if (!totalLen) return String("ERR_NO_LENGTH");

  // Read payload in chunks
  std::vector<uint8_t> buf;
  if (!readPayloadChunked_(totalLen, buf)) {
    return String("ERR_SHORT_READ");
  }

  // Tell Pi we’re done
  tellPiDone_();

  // Convert to String (CSV/text expected)
  String payload; payload.reserve(totalLen + 1);
  for (auto b : buf) payload += (char)b;
  return payload;
}

CaptureParsed PiI2CMaster::captureParsed(bool doWakeFirst) {
  CaptureParsed out;
  String payload = captureRaw(doWakeFirst);
  if (payload.startsWith("ERR_")) {
    out.ok = false;
    out.error = payload;
    return out;
  }
  out.raw   = payload;
  out.count = getField_(payload, "COUNT,").toInt();
  out.s1    = getField_(payload, "S1,");
  out.s2    = getField_(payload, "S2,");
  out.s3    = getField_(payload, "S3,");
  out.ok    = true;
  return out;
}
