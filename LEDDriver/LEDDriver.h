#ifndef LED_DRIVER_H
#define LED_DRIVER_H
#include <Arduino.h>

const uint8_t CL_PIN = 13;   // predefined pin for chlorine
const uint8_t P_PIN = 12;  // predefined pin for phosphate

class LEDDriver 
{
	public:
		LEDDriver(uint8_t LEDpin);
		void turnON(uint32_t duration);
    void update(); 
    void begin(); 
  
  private:
		uint8_t _ledPin;
		uint32_t onTime; //(ms)
    uint32_t Start; //(ms)
    bool isOn; 
		
};
extern bool DEBUG;

#endif