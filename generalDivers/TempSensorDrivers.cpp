#include "TempSensorDrivers.h"

TemperatureSensor::TemperatureSensor(int pin) 
    : oneWire(pin), sensors(&oneWire) {
}

void TemperatureSensor::begin() {
    sensors.begin();
}

float TemperatureSensor::getTempC() {
    sensors.requestTemperatures();
    return sensors.getTempCByIndex(0);
}

float TemperatureSensor::getTempF() {
    sensors.requestTemperatures();
    return sensors.getTempFByIndex(0);
}
