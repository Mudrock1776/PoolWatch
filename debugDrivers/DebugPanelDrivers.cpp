#include "DebugPanelDrivers.h"
#include "esp32-hal-gpio.h"
#include "HardwareSerial.h"

debugPanel::debugPanel(){
}

void debugPanel::initializePins(){
  if(DEBUG){
    Serial.println("initializing pin");
  }
  pinMode(pumpStatusPin, OUTPUT);
  setStatus(true);
}

void debugPanel::setStatus(bool pumpStatus){
  if (pumpStatus){
    digitalWrite(pumpStatusPin, HIGH);
    if(DEBUG){
      Serial.println("writing High");
    }
  } else {
    digitalWrite(pumpStatusPin, LOW);
    if(DEBUG){
      Serial.println("writing Low");
    }
  }
}

debugPanel debugPanelDrivers = debugPanel();