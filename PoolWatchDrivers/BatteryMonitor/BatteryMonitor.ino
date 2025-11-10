#include "BatteryMonitor.h"

BatteryMonitor batteryMonitor(34);  

void setup() {
  Serial.begin(115200);
  batteryMonitor.setPin();
           
}
void loop() {
  float voltage = batteryMonitor.readVoltage();
  float percent = batteryMonitor.readPercent();
  float batteryPercent = percent * 100.0f; 
 
  Serial.printf("Battery: %.2f V\n", voltage);
  Serial.printf("Percent: %.2f\n", percent);  
  Serial.printf("Battery Percent: %3.0f%%\n\n", batteryPercent); //whole %

  delay(5000);
  }
