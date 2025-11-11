#include "PiI2CMaster.h"

PiI2CMaster::PiI2CMaster(uint8_t  piAddr,
                         int      sdaPin,
                         int      sclPin,
                         int      wakePin,
                         uint32_t i2cHz,
                         uint32_t bootTimeoutMs,
                         uint32_t procTimeoutMs,
                         uint16_t chunkBytes)
: piAddr_(piAddr),
  sdaPin_(sdaPin),
  sclPin_(sclPin),
  wakePin_(wakePin),
  i2cHz_(i2cHz),
  bootTimeoutMs_(bootTimeoutMs),
  procTimeoutMs_(procTimeoutMs),
  chunkBytes_(chunkBytes) {}

void PiI2CMaster::begin() {
  Wire.begin(sdaPin_, sclPin_, i2cHz_);
}

void PiI2CMaster::wakePulse(uint16_t lowMs, bool useOpenDrainIfAvailable) {
#if defined(OUTPUT_OPEN_DRAIN)
  if (useOpenDrainIfAvailable) {
    pinMode(wakePin_, OUTPUT_OPEN_DRAIN);
    digitalWrite(wakePin_, HIGH); // release (OD = Hi-Z)
  } else {
    pinMode(wakePin_, OUTPUT);
    digitalWrite(wakePin_, HIGH);
  }
#else
  (void)useOpenDrainIfAvailable;
  pinMode(wakePin_, OUTPUT);
  digitalWrite(wakePin_, HIGH);   // idle (Pi pulls up)
#endif
  delay(10);
  digitalWrite(wakePin_, LOW);    // pull Pi GPIO3 low to wake
  delay(lowMs);                   // ~150–200 ms is reliable
  digitalWrite(wakePin_, HIGH);   // release
}

bool PiI2CMaster::i2cPing_(uint8_t addr) {
  Wire.beginTransmission(addr);
  uint8_t e = Wire.endTransmission();
  return (e == 0); // 0 = ACK
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
    size_t chunk = min((size_t)chunkBytes_, n - got);
    size_t r = Wire.requestFrom((int)addr, (int)chunk, (int)true);
    for (size_t i = 0; i < r && got < n; ++i) {
      buf[got++] = Wire.read();
    }
    if (r == 0) break; // no data / NACK
  }
  return got;
}

uint16_t PiI2CMaster::readLengthBE_() {
  // Ask for length
  Wire.beginTransmission(piAddr_);
  Wire.write(CMD_LENGTH);
  Wire.endTransmission();

  uint8_t len2[2] = {0,0};
  size_t r = i2cReadExact_(piAddr_, len2, 2);
  if (r != 2) return 0;

  uint16_t L = ((uint16_t)len2[0] << 8) | len2[1];
  if (L == 0 || L >= 4096) return 0; // sanity
  return L;
}

bool PiI2CMaster::readPayloadChunked_(uint16_t totalLen, std::vector<uint8_t>& out) {
  out.clear();
  out.reserve(totalLen);
  uint16_t offset = 0;

  while (offset < totalLen) {
    uint16_t want = (uint16_t)min<uint32_t>(chunkBytes_, (uint32_t)totalLen - offset);

    Wire.beginTransmission(piAddr_);
    Wire.write(CMD_READ);
    Wire.write((uint8_t)(want   >> 8));
    Wire.write((uint8_t)(want   & 0xFF));
    Wire.write((uint8_t)(offset >> 8));
    Wire.write((uint8_t)(offset & 0xFF));
    Wire.endTransmission();

    size_t got = Wire.requestFrom((int)piAddr_, (int)want);
    if (got != want) {
      // partial read → fail
      for (size_t i = 0; i < got; ++i) out.push_back(Wire.read()); // drain what arrived
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

String PiI2CMaster::captureOnce(bool doWakeFirst) {
  if (doWakeFirst) {
    wakePulse();  // harmless if Pi is already running
  }

  // Ensure I2C is up (user should have called begin(), but be tolerant)
  // (No-op if already begun with same pins/frequency.)
  Wire.begin(sdaPin_, sclPin_, i2cHz_);

  // Wait for Pi’s I2C slave to respond
  if (!waitForOnline()) {
    return String("ERR_PI_OFFLINE");
  }

  // Send start/capture command
  Wire.beginTransmission(piAddr_);
  Wire.write(CMD_START);
  Wire.endTransmission();

  // Poll for length until proc timeout
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

  // Read payload
  std::vector<uint8_t> buf;
  if (!readPayloadChunked_(totalLen, buf)) {
    return String("ERR_SHORT_READ");
  }

  // Tell Pi we’re done
  tellPiDone_();

  // Convert to String (CSV/text expected by your Pi side)
  String payload;
  payload.reserve(totalLen + 1);
  for (auto b : buf) payload += (char)b;
  return payload;
}
