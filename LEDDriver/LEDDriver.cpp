#include "LEDDriver.h"

bool DEBUG = true;

LEDDriver::LEDDriver(uint8_t LEDpin){
  _ledPin = LEDpin; 
}

void LEDDriver::begin(){
  pinMode(_ledPin, OUTPUT);
  digitalWrite(_ledPin, LOW);  //keep off initially 
}

void LEDDriver::on() {
  digitalWrite(_ledPin, HIGH);
  if (DEBUG) {
    Serial.println("LED On");
  }
}

void LEDDriver::off() {
  digitalWrite(_ledPin, LOW);
  if (DEBUG) {
    Serial.println("LED Off");
  }
}










