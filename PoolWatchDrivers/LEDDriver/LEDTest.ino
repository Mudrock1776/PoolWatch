#include "LEDDriver.h"

LEDDriver chlorineLED(CL_PIN);  
LEDDriver phosphateLED(P_PIN); 

uint32_t startTime = 0;
bool ledsOn = false;

void setup() {
  if (DEBUG)
  {
    Serial.begin(115200);
    delay(2000);
  }
  chlorineLED.begin();
  phosphateLED.begin();

  chlorineLED.on();
  phosphateLED.on();
  ledsOn = true;
  startTime = millis();  //track when LEDs turned on 
}

void loop() {
  if (ledsOn && (millis() - startTime >= 5000)) {
    chlorineLED.off();
    phosphateLED.off();
    ledsOn = false; 
  }
}
