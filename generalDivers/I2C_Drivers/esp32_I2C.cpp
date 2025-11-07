#include "esp32_I2C.h"

PiI2CMaster::PiI2CMaster(uint8_t piAddr, int sdaPin, int sclPin, uint32_t i2cHz)
    : piAddr(piAddr), sdaPin(sdaPin), sclPin(sclPin), i2cHz(i2cHz) {}

void PiI2CMaster::begin() {
    Wire.begin(sdaPin, sclPin, i2cHz);
}

size_t PiI2CMaster::readExact(uint8_t addr, uint8_t* buf, size_t n) {
    size_t got = 0;
    while (got < n) {
        size_t chunk = min((size_t)128, n - got);
        size_t r = Wire.requestFrom((int)addr, (int)chunk, (int)true);

        for (size_t i = 0; i < r && got < n; ++i)
            buf[got++] = Wire.read();

        if (r == 0) break;
    }
    return got;
}

String PiI2CMaster::captureAndRead() {
    // Tell Pi to capture (0x01)
    Wire.beginTransmission(piAddr);
    Wire.write(0x01);
    Wire.endTransmission();

    // Poll for 2-byte length
    uint16_t L = 0;
    uint32_t start = millis();

    while (millis() - start < CAPTURE_TIMEOUT_MS) {
        Wire.beginTransmission(piAddr);
        Wire.write(0x10); // nudge
        Wire.endTransmission();

        uint8_t len2[2] = {0,0};
        size_t g = readExact(piAddr, len2, 2);

        if (g == 2) {
            L = ((uint16_t)len2[0] << 8) | len2[1];
            if (L > 0 && L < 4096) break;
        }
        delay(50);
    }

    if (L == 0)
        return String("ERR_TIMEOUT");

    // Read payload
    std::vector<uint8_t> buf(L);
    size_t got = readExact(piAddr, buf.data(), L);

    if (got != L)
        return String("ERR_SHORT_READ");

    String payload;
    payload.reserve(L+1);
    for (size_t i = 0; i < L; i++)
        payload += (char)buf[i];

    return payload;
}
