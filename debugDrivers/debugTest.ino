#include "DebugPanelDrivers.h"

bool DEBUG = true;
bool pumpStatus = false;

void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }
  debugPanelDrivers.initializePins();
}

void loop() {
  pumpStatus = true;
  debugPanelDrivers.setStatus(pumpStatus);
  delay(1000);
  pumpStatus = false;
  debugPanelDrivers.setStatus(pumpStatus);
  delay(1000);
}
