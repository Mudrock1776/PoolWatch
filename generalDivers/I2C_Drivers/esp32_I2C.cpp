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

  // Pull low to wake (Pi monitors GPIO3 a.k.a SCL on header)
  pinMode(wakePin_, OUTPUT);
  digitalWrite(wakePin_, LOW);
  delay(lowMs);

  // Release back to Hi-Z (with pull-up)
  pinMode(wakePin_, INPUT_PULLUP);
}

// Request Pi shutdown by pulsing the same pin low again
void PiI2CSlaveCapture::shutdownPi(uint16_t lowMs) {
  // Same pulse pattern; when Pi is ON and gpio-shutdown overlay is active,
  // this falling edge requests a shutdown.
wakePi(lowMs);
}

// Block until Pi has written one payload or timeout
CaptureParsed PiI2CSlaveCapture::waitForCapture() {
  unsigned long t0 = millis();
  while (!havePayload_ && (millis() - t0 < captureTimeoutMs_)) {
    delay(50); // allow callbacks to run
  }

  if (!havePayload_) {
    CaptureParsed err;
    err.ok    = false;
    err.error = "ERR_TIMEOUT";
    return err;
  }

  noInterrupts();
  String copy = payload_;
  havePayload_ = false;
  interrupts();

  return parse_(copy);
}

// Convenience helper: wake then wait
CaptureParsed PiI2CSlaveCapture::captureOnce(uint16_t wakeLowMs) {
  wakePi(wakeLowMs);
  return waitForCapture();
}

String PiI2CSlaveCapture::lastRaw() const {
  return payload_;
}

void PiI2CSlaveCapture::clearPayload() {
  noInterrupts();
  payload_    = "";
  havePayload_ = false;
  interrupts();
}

// ---------- Wire callback plumbing ----------

void PiI2CSlaveCapture::onReceiveThunk(int numBytes) {
  if (self_) self_->onReceive_(numBytes);
}

void PiI2CSlaveCapture::onRequestThunk() {
  if (self_) self_->onRequest_();
}

// Called each time the Pi (master) writes to this slave
void PiI2CSlaveCapture::onReceive_(int /*numBytes*/) {
  // Read everything for this transaction into payload_
  payload_ = "";
  while (Wire.available()) {
    payload_ += char(Wire.read());
  }
  havePayload_ = true;
}

// Not used currently (Pi isn't reading from ESP32)
void PiI2CSlaveCapture::onRequest_() {
  // If later you want Pi to read from ESP32, use Wire.write() here.
}

// ---------- Parsing helpers ----------

String PiI2CSlaveCapture::getField_(const String& payload, const char* key) {
  int k = payload.indexOf(key);
  if (k < 0) return String();
  int start = k + int(strlen(key));
  int end   = payload.indexOf(';', start);
  if (end < 0) end = payload.length();
  return payload.substring(start, end);
}

CaptureParsed PiI2CSlaveCapture::parse_(const String& payload) {
  CaptureParsed out;
  out.raw = payload;

  // Numeric payload from Pi: COUNT,int;S1,num;S2,num;S3,num;
  String countStr = getField_(payload, "COUNT,");
  if (!countStr.length()) {
    out.ok    = false;
    out.error = "ERR_BAD_PAYLOAD";
    return out;
  }

  out.count = countStr.toInt();

  // Extract numeric percentages as strings
  String s1NumStr = getField_(payload, "S1,");
  String s2NumStr = getField_(payload, "S2,");
  String s3NumStr = getField_(payload, "S3,");

  // Convert to floats and reformat to 2 decimal places
  float p1 = s1NumStr.toFloat();
  float p2 = s2NumStr.toFloat();
  float p3 = s3NumStr.toFloat();

  String p1Fmt = String(p1, 2);
  String p2Fmt = String(p2, 2);
  String p3Fmt = String(p3, 2);

  // Reconstruct descriptive strings on the ESP32
  out.s1 = "Percentage of Particles <63 microns: " +
           p1Fmt + "% (Likely Pollen or Algae)";

  out.s2 = "Percentage of Particles 63–125 microns: " +
           p2Fmt + "% (Likely Fine Sands)";

  out.s3 = "Percentage of Particles >125 microns: " +
           p3Fmt + "% (Likely Coarse Sands)";

  out.ok = true;
  return out;
}
