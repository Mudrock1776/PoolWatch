#include "TempSensorDrivers.h"

TemperatureSensor tempSensor(18);

void setup() {
  Serial.begin(115200);
  tempSensor.begin();
}

void loop() {
  float tempC = tempSensor.getTempC();
  float tempF = tempSensor.getTempF();

  Serial.print(tempC);
  Serial.println(" ºC");
  Serial.print(tempF);
  Serial.println(" ºF");

  delay(5000);
}
