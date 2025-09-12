#ifndef RELAY_H
#define RELAY_H

#include <Arduino.h>

//Change to GPIO pins to be used with relays 
#define RELAY1PIN 4    
#define RELAY2PIN 26   
#define RELAY3PIN 27   
#define RELAY4PIN 18   //formerly 33

class Relay {
 public:
  Relay(uint8_t relayNum); 
  void setPins(); 
  void turnOnFor(uint32_t ms);   
  void turnOff();   
  void update();                           
  int  state();   
 private:
  int relayPin;
  int relayState;
  bool onScheduled; //checks if relay on timed run
  unsigned long startTime;
  unsigned long duration;
};

extern bool DEBUG;
#endif

