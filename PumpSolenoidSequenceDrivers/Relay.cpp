#include "Relay.h"

bool DEBUG = true;

Relay::Relay(uint8_t relayNum) {
   relayPin = relayNum; 
}

//Configures GPIO pins 
void Relay::setPins(){
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  startTime = 0;
  duration = 0;
  onScheduled = false;
  relayState = LOW;
}

// Returns state of the relay (LOW or HIGH)
int Relay::state()
{
  return(relayState); 
}

void Relay::turnOff() {
  digitalWrite(relayPin, LOW);   
  relayState = LOW;
  onScheduled = false;

   if (DEBUG) {
    Serial.print("Relay on pin ");
    Serial.print(relayPin);
    Serial.println(" turned OFF");
  }
}

void Relay::turnOnFor(unsigned long ms) {
  if (ms == 0) {
    turnOff(); 
    return; 
  }

  digitalWrite(relayPin, HIGH);   //High-trigger 
  relayState  = HIGH;       

//Records how long to turn on 
  startTime    = millis();
  duration     = ms;
  onScheduled = true;

  if (DEBUG) {
    Serial.print("Relay on pin ");
    Serial.print(relayPin);
    Serial.print(" turned ON for ");
    Serial.print(ms);
    Serial.println(" ms");
  }
}

void Relay::update() {
  if (onScheduled && (millis() - startTime) >= duration) {
    turnOff();
  }
}

