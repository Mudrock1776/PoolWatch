#include "chlorine_phosphate_driver.h"

bool DEBUG = true;

chlorine_phosphate_driver::chlorine_phosphate_driver(uint8_t Clpin){
  _pdPin = Clpin; 
}

void chlorine_phosphate_driver::begin(){
  pinMode(_pdPin, OUTPUT);
  digitalWrite(_pdPin, LOW);  //keep off initially 
}

void chlorine_phosphate_driver::on() {
  digitalWrite(_ledPin, HIGH);
  if (DEBUG) {
    Serial.println("PD On");
  }
}

void chlorine_phosphate_driver::off() {
  digitalWrite(_pdPin, LOW);
  if (DEBUG) {
    Serial.println("PD Off");
  }
}