#ifndef PII2CSLAVECAPTURE_H
#define PII2CSLAVECAPTURE_H

#include <Arduino.h>
#include <Wire.h>

// Parsed result container
struct CaptureParsed {
  bool   ok   = false;
  int    count = 0;
  String s1, s2, s3;
  String raw;     // full payload (numeric payload from Pi)
  String error;   // "ERR_*" if any
};

class PiI2CSlaveCapture {
public:
  // addr = ESP32's I2C slave address the Pi will write to
  PiI2CSlaveCapture(uint8_t addr,
                    int sdaPin,
                    int sclPin,
                    int wakePin,
                    uint32_t i2cHz,
                    uint32_t captureTimeoutMs);

  // Initialize I2C in slave mode and register callbacks
  // Returns true if slave init succeeded
  bool begin();

  // Wake Pi from halt via GPIO3 (shared SCL on Pi side).
  // Call only when Pi is OFF.
  void wakePi(uint16_t lowMs = 500);

  // Request Pi shutdown via another low pulse on GPIO3.
  // Call after you've received the payload and are done with the Pi.
  void shutdownPi(uint16_t lowMs = 500);

  // Block until a payload arrives from Pi, or timeout.
  CaptureParsed waitForCapture();

  // Convenience: wake → waitForCapture()
  CaptureParsed captureOnce(uint16_t wakeLowMs = 500);

  // Access last raw payload (empty if none)
  String lastRaw() const;

  // Clear any latched payload/flag
  void clearPayload();

private:
  // Wire callbacks must be static; forward to instance via singleton
  static void onReceiveThunk(int numBytes);
  static void onRequestThunk();

  // Instance handlers
  void onReceive_(int numBytes);
  void onRequest_();

  // Parsing helpers
  static String getField_(const String& payload, const char* key);
  static CaptureParsed parse_(const String& payload);

  // Singleton used by thunks
  static PiI2CSlaveCapture* self_;

  // Config
  uint8_t  addr_;
  int      sdaPin_;
  int      sclPin_;
  int      wakePin_;
  uint32_t i2cHz_;
  uint32_t captureTimeoutMs_;

  // State shared with ISR
  volatile bool havePayload_ = false;
  String        payload_;
};

#endif // PII2CSLAVECAPTURE_H
