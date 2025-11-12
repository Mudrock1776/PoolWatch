#ifndef esp32_I2C_H
#define esp32_I2C_H

#include <Arduino.h>
#include <Wire.h>
#include <vector>

struct CaptureParsed {
  bool   ok = false;
  int    count = 0;
  String s1, s2, s3;
  String raw;     // full payload
  String error;   // "ERR_*" if any
};

class PiI2CMaster {
public:
  PiI2CMaster(uint8_t  piAddr,
              int      sdaPin,
              int      sclPin,
              int      wakePin,
              uint32_t i2cHz,
              uint32_t bootTimeoutMs,
              uint32_t procTimeoutMs,
              uint16_t chunkBytes = 120);

  void begin();                                  // start I2C
  void wakePulse(uint16_t lowMs = 200, bool useOpenDrainIfAvailable = true);
  bool waitForOnline();                          // ping until ACK or timeout

  String        captureRaw(bool doWakeFirst = true);     // returns payload or "ERR_*"
  CaptureParsed captureParsed(bool doWakeFirst = true);  // parses COUNT/S1/S2/S3

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
  bool     i2cPing_(uint8_t addr);
  size_t   i2cReadExact_(uint8_t addr, uint8_t* buf, size_t n);
  uint16_t readLengthBE_();                                  // sends 0x11
  bool     readPayloadChunked_(uint16_t totalLen, std::vector<uint8_t>& out); // uses 0x12
  void     tellPiDone_();                                    // sends 0xEE
  static String getField_(const String& payload, const char* key);

  // Protocol bytes
  static constexpr uint8_t CMD_START  = 0x01;  // trigger capture/analyze
  static constexpr uint8_t CMD_LENGTH = 0x11;  // request 2B big-endian length
  static constexpr uint8_t CMD_READ   = 0x12;  // request chunk (len,offset)
  static constexpr uint8_t CMD_DONE   = 0xEE;  // done/allow shutdown
};

#endif
