#ifndef CHLORINE_PHOSPHATE_DRIVER_H
#define CHLORINE_PHOSPHATE_DRIVER_H
#include <Arduino.h>

const uint8_t photoPin_cl = 36;   // predefined pin for chlorine
const uint8_t photoPin_ph = 34;  // predefined pin for phosphate

class chlorine_phoshpate_driver 
{
	public:
		chlorine_phoshpate_driver(uint8_t Clpin, uint8_t Ppin);
    	void begin(); 
		void on();
    	void off();
		float ClConcentration();
		float PConcentration();
  
    private:
		uint8_t _PDClpin;
		uint8_t _PDPpin;
		
};
extern bool DEBUG;


#endif

