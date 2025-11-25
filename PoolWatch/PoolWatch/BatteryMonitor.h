#ifndef BATTERY_MONITOR_H
#define BATTERY_MONITOR_H

#include <Arduino.h>

class BatteryMonitor {
public:
  BatteryMonitor(int pinNumber);
  void setPin();           
  float readVoltage();
  float readPercent();

private:
  int pin;
};

#endif
