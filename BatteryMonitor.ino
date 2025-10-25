#include "BatteryMonitor.h"

BatteryMonitor batteryMonitor(34);  // ADC pin

void setup() {
  Serial.begin(115200);
  batteryMonitor.setPin();         
}

void loop() {
  float voltage = batteryMonitor.readVoltage();
  int percent = batteryMonitor.readPercent();

  Serial.printf("Battery: %.2f V\n", voltage);
  Serial.printf("Percent: %3d%%\n\n", percent);

  delay(5000);
}
