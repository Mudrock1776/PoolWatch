#include "DebugPanelDrivers.h"
#include "esp32-hal-gpio.h"
#include "HardwareSerial.h"

debugPanel::debugPanel(){
}

void debugPanel::initializePins(){
  if(DEBUG){
    Serial.println("initializing pin");
  }
  pinMode(mcuStatusPin, OUTPUT);
  pinMode(pumpStatusPin, OUTPUT);
  pinMode(chlorineStatusPin, OUTPUT);
  pinMode(phosphateStatusPin, OUTPUT);
  digitalWrite(mcuStatusPin, LOW);
  digitalWrite(pumpStatusPin, LOW);
  digitalWrite(chlorineStatusPin, LOW);
  digitalWrite(phosphateStatusPin, LOW);
}

void debugPanel::setStatus(bool mcuStatus, bool pumpStatus, bool chlorineStatus, bool phosphateStatus){
  if (mcuStatus){
    digitalWrite(mcuStatusPin, HIGH);
    if(DEBUG){
      Serial.println("writing MCU High");
    }
  } else {
    digitalWrite(mcuStatusPin, LOW);
    if(DEBUG){
      Serial.println("writing MCU Low");
    }
  }
  if (pumpStatus){
    digitalWrite(pumpStatusPin, HIGH);
    if(DEBUG){
      Serial.println("writing PUMP High");
    }
  } else {
    digitalWrite(pumpStatusPin, LOW);
    if(DEBUG){
      Serial.println("writing PUMP Low");
    }
  }
  if (chlorineStatus){
    digitalWrite(chlorineStatusPin, HIGH);
    if(DEBUG){
      Serial.println("writing Chlorine High");
    }
  } else {
    digitalWrite(chlorineStatusPin, LOW);
    if(DEBUG){
      Serial.println("writing Chlorine Low");
    }
  }
  if (phosphateStatus){
    digitalWrite(phosphateStatusPin, HIGH);
    if(DEBUG){
      Serial.println("writing Phosphate High");
    }
  } else {
    digitalWrite(phosphateStatusPin, LOW);
    if(DEBUG){
      Serial.println("writing Phosphate Low");
    }
  }
}

bool debugPanel::get5RegStatus(){
  int fiveVReading = 0;
  fiveVReading = analogRead(fiveVADCPin);
  if (fiveVReading > 1000){
    return true;
  } else {
    return false;
  }
}

bool debugPanel::get12RegStatus(){
  int twelveVReading = 0;
  twelveVReading = analogRead(twelveVADCPin);
  if (twelveVReading > 1000){
    return true;
  } else {
    return false;
  }
}

debugPanel debugPanelDrivers = debugPanel();