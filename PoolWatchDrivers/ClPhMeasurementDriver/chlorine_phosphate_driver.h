#ifndef CHLORINE_PHOSPHATE_DRIVER_H
#define CHLORINE_PHOSPHATE_DRIVER_H
#include <Arduino.h>

const uint8_t photoPin_cl = 36;   // predefined pin for chlorine
const uint8_t photoPin_ph = 34;  // predefined pin for phosphate

class chlorine_phoshpate_driver 
{
	public:
		chlorine_phoshpate_driver(uint8_t Clpin);
    	void begin(); 
		void on();
    	void off(); 
  
    private:
		uint8_t _PDpin;
		
};
extern bool DEBUG;

#endif