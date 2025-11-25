#ifndef TEMPERATURESENSOR_H
#define TEMPERATURESENSOR_H

#include <OneWire.h>
#include <DallasTemperature.h>

class TemperatureSensor {
public:
    TemperatureSensor(int pin);
    void begin();
    float getTempC();
    float getTempF();

private:
    OneWire oneWire;
    DallasTemperature sensors;
};

#endif
