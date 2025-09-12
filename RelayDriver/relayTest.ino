#include "Relay.h"

//Timings to change based on needs 
unsigned long pumpMs = 5000;  // 5s
unsigned long solenoidMs = 2000;  // 2s
unsigned long stirrerMs = 3000;  // 3s

//Setting pins 
Relay pump(RELAY1PIN);
Relay stirrer(RELAY2PIN);
Relay solenoid1(RELAY3PIN);
Relay solenoid2(RELAY4PIN);

bool pumpStarted = false;
bool stirStarted = false;
bool solenoidsStarted = false;

void setup() {

  if (DEBUG)
  {
    Serial.begin(115200);
    delay(200);
  }
  pump.setPins(); 
  stirrer.setPins(); 
  solenoid1.setPins();
  solenoid2.setPins(); 

  //turn on pump first 
  pump.turnOnFor(pumpMs);
  pumpStarted = true;

}

void loop() {
  pump.update();
  solenoid1.update();
  solenoid2.update();
  stirrer.update();

// start both solenoids together after pump finishes
  if (!solenoidsStarted && pumpStarted && pump.state() == LOW) {
    solenoid1.turnOnFor(solenoidMs);
    solenoid2.turnOnFor(solenoidMs);
    solenoidsStarted = true;
  }

  // start stirrer after solenoids finish
  if (!stirStarted && solenoidsStarted &&
      solenoid1.state() == LOW && solenoid2.state() == LOW) {
    stirrer.turnOnFor(stirrerMs);
    stirStarted = true;
  }

/*
  // reset flags to allow another cycle
  if (stirStarted && stirrer.state() == LOW) {
    pumpStarted = false;
    solenoidsStarted = false;
    stirStarted = false;
    pump.turnOnFor(pumpMs); 
    pumpStarted = true;
  if (DEBUG) {
  Serial.println("Pump started");
  }
  */
}
