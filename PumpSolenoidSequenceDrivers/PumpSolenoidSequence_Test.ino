#include "PumpSolenoidSequence.h"

bool DEBUG = true;

Pump waterPump(4); 
Solenoid solenoid1(27); 
Solenoid solenoid2(33); 

void setup()
{
  if (DEBUG)
  {
    Serial.begin(115200);
    delay(2000);
  }

  waterPump.begin();
  solenoid1.begin(); 
  solenoid2.begin();
  waterPump.pumpRelay();
  delay(2000); //add 2 sec delay between pump end and solenoid start 
  solenoid1.solenoidRelay(); 
  solenoid2.solenoidRelay();  
}

void loop(){}









