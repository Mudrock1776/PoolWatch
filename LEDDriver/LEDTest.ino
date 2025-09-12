#include "LEDDriver.h"

LEDDriver chlorineLED(CL_PIN);  
LEDDriver phosphateLED(P_PIN); 

uint32_t timer = 5000;  // how long LED should stay on

void setup() {
  if (DEBUG)
  {
    Serial.begin(115200);
    delay(2000);
  }
  chlorineLED.begin();
  phosphateLED.begin();

  chlorineLED.turnON(timer);
  phosphateLED.turnON(timer);
}

void loop() {
  chlorineLED.update();
  phosphateLED.update();
}
