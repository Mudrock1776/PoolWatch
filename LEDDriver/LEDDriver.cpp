#include "LEDDriver.h"

bool DEBUG = true;

LEDDriver::LEDDriver(uint8_t LEDpin){
  _ledPin = LEDpin; 
}

void LEDDriver::begin(){
  pinMode(_ledPin, OUTPUT);
  digitalWrite(_ledPin, LOW);  //keep off initially 
  onTime = 0;
  Start  = 0;
  isOn = false; 
}

void LEDDriver::turnON(uint32_t duration) {
  if (!isOn) {
    isOn = true;
    Start = millis(); //save start time
    onTime = duration; //save length LED should stay on 
    digitalWrite(_ledPin, HIGH);
     if (DEBUG) {
      Serial.println("LED On");
     }
  }
}

void LEDDriver::update() {
  if (isOn && onTime > 0 && (millis()- Start >= onTime)) {
    isOn = false;
    digitalWrite(_ledPin, LOW);
    if (DEBUG) {
      Serial.println("LED Off");
     }
  }
}








