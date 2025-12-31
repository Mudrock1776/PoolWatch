#include "DebugPanelDrivers.h"

bool DEBUG = true;
bool mcuStatus = false;
bool pumpStatus = false;
bool chlorineStatus = false;
bool phosphateStatus = false;
bool twelveVRegStatus = false;

void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }
  debugPanelDrivers.initializePins();
  twelveVRegStatus = debugPanelDrivers.get12RegStatus();
  if (DEBUG){
    if (twelveVRegStatus){
      Serial.println("12 Volt Reg on");
    } else {
      Serial.println("12 Volt Reg off");
    }
  }
}

void loop() {
  mcuStatus = true;
  pumpStatus = true;
  chlorineStatus = true;
  phosphateStatus = true;
  debugPanelDrivers.setStatus(mcuStatus, pumpStatus, chlorineStatus, phosphateStatus);
  delay(1000);
  mcuStatus = false;
  pumpStatus = false;
  chlorineStatus = false;
  phosphateStatus = false;
  debugPanelDrivers.setStatus(mcuStatus, pumpStatus, chlorineStatus, phosphateStatus);
  delay(1000);
}
