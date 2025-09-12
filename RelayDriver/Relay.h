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
  uint8_t relayPin;
  int relayState;
  bool onScheduled; //checks if relay on timed run
  uint32_t startTime;
  uint32_t duration;
};

extern bool DEBUG;
#endif
