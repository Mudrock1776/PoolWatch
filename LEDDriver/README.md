## LED drivers for PoolWatch ##

#### Installations ####
To install driver copy LEDDriver.h and LEDDriver.cpp into sketch folder and include "LEDDriver.h" in your .ino file.

#### Setting GPIO Pins ####
Two GPIO pins are predefined in the .h library to be passed to the constructor which automatically maps to them. Using the begin() function allows the pins to be set as Output and LOW.

#### Turning LED ON/OFF ####

turnOn(uint32_t duration ms) turns the LED on for the specified time given in milliseconds adn then turns it off. 

update() function checks whether the LED’s ON duration has expired. It is called inside the loop() to keep timing accurate.


