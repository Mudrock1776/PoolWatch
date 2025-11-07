#ifndef PII2CMASTER_H
#define PII2CMASTER_H

#include <Arduino.h>
#include <Wire.h>
#include <vector>

class PiI2CMaster {
public:
    PiI2CMaster(uint8_t piAddr, int sdaPin, int sclPin, uint32_t i2cHz);

    void begin();                   // Setup I2C
    String captureAndRead();        // Runs the whole process, returns payload

private:
    uint8_t  piAddr;
    int      sdaPin;
    int      sclPin;
    uint32_t i2cHz;

    static const uint32_t CAPTURE_TIMEOUT_MS = 10000;

    size_t readExact(uint8_t addr, uint8_t* buf, size_t n);
};

#endif
