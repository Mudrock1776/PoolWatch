#include "Relay.h"

//Timings to change based on needs 
unsigned long pumpMs = 5000;  // 5s
unsigned long solenoidMs = 2000;  // 2s
unsigned long stirrerMs = 3000;  // 3s

//Setting pins 
Relay pump(1);
Relay stirrer(2);
Relay solenoid1(3);
Relay solenoid2(4);

bool pumpStarted = false;
bool stirStarted = false;
bool solenoidsStarted = false;

void setup() {

  if (DEBUG)
  {
    Serial.begin(115200);
    delay(2000);
  }

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
