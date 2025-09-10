#include "Relay.h"

bool DEBUG = true;

//Constructor
//Sets pin as output at the same time 
//keeps pin in off mode intially 
Relay::Relay(int relayNum) {
  if (relayNum == 1) relayPin = RELAY1PIN;
  if (relayNum == 2) relayPin = RELAY2PIN;
  if (relayNum == 3) relayPin = RELAY3PIN;
  if (relayNum == 4) relayPin = RELAY4PIN;

//Sets a GPIO pin to LOW
//to prevent short turn on during reset and power up sequence
  digitalWrite(relayPin, LOW);
  pinMode(relayPin, OUTPUT);
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
