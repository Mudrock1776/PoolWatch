#include "chlorine_phosphate_driver.h"
#include "LEDDriver.h"
bool DEBUG = true;

LEDDriver chlorineLED(CL_PIN);  
LEDDriver phosphateLED(P_PIN); 
chlorine_phoshpate_driver ConcentrationGetter(photoPin_cl, photoPin_ph);

void setup() {
  // put your setup code here, to run once:
  if (DEBUG)
  {
    Serial.begin(115200);
    delay(2000);
  }
  chlorineLED.begin();
  phosphateLED.begin();

  chlorineLED.off();
  phosphateLED.off();
  ConcentrationGetter.begin();
  delay(1000);
  chlorineLED.on();
  float CLCON = ConcentrationGetter.ClConcentration();
  if (DEBUG)
  {
    Serial.println(CLCON);
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(10000);
}
