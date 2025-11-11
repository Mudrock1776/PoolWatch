#ifndef CHLORINE_PHOSPHATE_DRIVER_H
#define CHLORINE_PHOSPHATE_DRIVER_H
#include <Arduino.h>

const uint8_t photoPin = 13;   // predefined pin for chlorine
const uint8_t P_PIN = 12;  // predefined pin for phosphate

class LEDDriver 
{
	public:
		LEDDriver(uint8_t LEDpin);
    	void begin(); 
		void on();
    	void off(); 
  
    private:
		uint8_t _ledPin;
		
};
extern bool DEBUG;

#endif