#ifndef PII2CMASTER_H
#define PII2CMASTER_H

#include <Arduino.h>
#include <Wire.h>
#include <vector>

class PiI2CMaster {
public:
  // Constructor. chunkBytes defaults to 120 (safe vs ESP32 Wire buffer).
  PiI2CMaster(uint8_t  piAddr,
              int      sdaPin,
              int      sclPin,
              int      wakePin,
              uint32_t i2cHz,
              uint32_t bootTimeoutMs,
              uint32_t procTimeoutMs,
              uint16_t chunkBytes = 120);

  // Bring up I2C (does not wake the Pi).
  void begin();

  // Wake the Pi by pulsing its GPIO3 line low via our wakePin.
  void wakePulse(uint16_t lowMs = 200, bool useOpenDrainIfAvailable = true);

  // Poll until the Pi ACKs its I2C address, or timeout.
  bool waitForOnline();

  // Run the full transaction: (optional wake) → command 0x01 →
  // poll length (0x11) → chunked reads (0x12) → finalize (0xEE).
  // Returns payload string on success, or "ERR_*" on failure.
  String captureOnce(bool doWakeFirst = true);

private:
  // Config
  uint8_t  piAddr_;
  int      sdaPin_;
  int      sclPin_;
  int      wakePin_;
  uint32_t i2cHz_;
  uint32_t bootTimeoutMs_;
  uint32_t procTimeoutMs_;
  uint16_t chunkBytes_;

  // Helpers
  bool   i2cPing_(uint8_t addr);
  size_t i2cReadExact_(uint8_t addr, uint8_t* buf, size_t n);
  uint16_t readLengthBE_();                     // issues 0x11; returns 0 on failure/invalid
  bool  readPayloadChunked_(uint16_t totalLen, std::vector<uint8_t>& out); // uses 0x12
  void  tellPiDone_();                          // sends 0xEE

  // Commands (protocol)
  static constexpr uint8_t CMD_START   = 0x01;  // trigger capture/analyze
  static constexpr uint8_t CMD_LENGTH  = 0x11;  // request 2B big-endian length
  static constexpr uint8_t CMD_READ    = 0x12;  // request chunk (len_hi, len_lo, off_hi, off_lo)
  static constexpr uint8_t CMD_DONE    = 0xEE;  // done / allow shutdown
};

#endif
