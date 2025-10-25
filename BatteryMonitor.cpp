#include "BatteryMonitor.h"
#include "esp_adc_cal.h"


const float R1 = 768000.0f;
const float R2 = 232000.0f;   // might need to change to 196k
const float DIVIDER = (R1 + R2) / R2;

BatteryMonitor::BatteryMonitor(int pinNumber) {
  pin = pinNumber;
}

void BatteryMonitor::setPin() {
  analogReadResolution(12);
  analogSetPinAttenuation(pin, ADC_11db);
  delay(100);
}

float BatteryMonitor::readVoltage() {
  const int N = 10;
  int sum = 0;
  for (int i = 0; i < N; i++) {
    sum += analogReadMilliVolts(pin);
    delay(2);
  }

  float pin_mV = (float)sum / N;
  return (pin_mV / 1000.0f) * DIVIDER;
}

int BatteryMonitor::readPercent() {
  float vbat = readVoltage();

  if (vbat >= 16.0) return 100;
  else if (vbat >= 15.9) return 90;
  else if (vbat >= 15.6) return 80;
  else if (vbat >= 15.3) return 70;
  else if (vbat >= 15.0) return 60;
  else if (vbat >= 14.6) return 50;
  else if (vbat >= 14.2) return 40;
  else if (vbat >= 13.8) return 30;
  else if (vbat >= 13.4) return 20;
  else if (vbat >= 12.8) return 10;
  else if (vbat >= 12.0) return 5;
  else return 0;
}
