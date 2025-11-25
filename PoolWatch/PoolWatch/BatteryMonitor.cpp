#include "BatteryMonitor.h"
#include "esp_adc_cal.h"


const float R1 = 768000.0f;
const float R2 = 196000.0f;   
const float DIVIDER = (R1 + R2) / R2;

BatteryMonitor::BatteryMonitor(int pinNumber) {
  pin = pinNumber;
}

void BatteryMonitor::setPin() {
  analogReadResolution(12);
  analogSetPinAttenuation(pin, ADC_11db);
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

  float BatteryMonitor::readPercent() {
  float vbat = readVoltage();
  if (vbat >= 16.00) return 1.00;   
  else if (vbat >= 15.80) return 0.95;
  else if (vbat >= 15.60) return 0.90;
  else if (vbat >= 15.40) return 0.85;
  else if (vbat >= 15.20) return 0.80;
  else if (vbat >= 15.00) return 0.70;
  else if (vbat >= 14.80) return 0.60;
  else if (vbat >= 14.40) return 0.50;
  else if (vbat >= 14.00) return 0.40;
  else if (vbat >= 13.60) return 0.30;
  else if (vbat >= 13.20) return 0.20;
  else if (vbat >= 12.60) return 0.10;
  else if (vbat >= 12.00) return 0.05;   
  else return 0.0;                      

}

