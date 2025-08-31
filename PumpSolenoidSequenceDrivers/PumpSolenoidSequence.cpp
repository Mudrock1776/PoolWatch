#include "PumpSolenoidSequence.h"
#include <Arduino.h> 

//Constructors 
Pump::Pump(int pin)
{
  pin_P = pin; 
}//end of pump constructor

Solenoid::Solenoid(int pin)
{
  pin_S = pin; 
}//end of solenoid constructor


//GPIO Pin Configuration Functions  
void Pump::begin()
{
  digitalWrite(pin_P, LOW); //keep pump off initially
  pinMode(pin_P, OUTPUT); 
}//end of pump GPIO pin configuration 

void Solenoid::begin()
{
  digitalWrite(pin_S, LOW); //keep solenoid off initially
  pinMode(pin_S, OUTPUT);
}//end of solenoid GPIO pin configuration 


//Relay Functions 
void Pump::pumpRelay()
{
  digitalWrite(pin_P, HIGH); //Turn pump on ~5sec
  if (DEBUG)
  {
    Serial.println("Pump Relay ON");
  }
  delay(5000);
  digitalWrite(pin_P, LOW); //Turn pump off
   if (DEBUG)
  {
    Serial.println("Pump Relay OFF");
  }
 }//end of pumpRelay function 

void Solenoid::solenoidRelay()
{
  digitalWrite(pin_S, HIGH); //Turn on solenoid for ~1sec
  if (DEBUG)
  {
    Serial.println("Solenoid Relay ON");
  }
  delay(1000); 
  digitalWrite(pin_S, LOW); //Turn solenoid off
  if (DEBUG)
  {
    Serial.println("Solenoid Relay OFF");
  } 
}












