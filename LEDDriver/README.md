## LED drivers for PoolWatch ##

#### Installations ####
To install driver copy LEDDriver.h and LEDDriver.cpp into sketch folder and include "LEDDriver.h" in your .ino file.

#### Setting GPIO Pins ####
Two GPIO pins are predefined in the .h library to be passed to the constructor which automatically maps to them. Using the begin() function allows the pins to be set as Output and LOW.

#### Turning LED ON/OFF ####

on() turns the LED on
off() turns the LED off 

The .ino file contains example of non-blocking code to turn LEDs on and then off after 5 seconds. When LEDs are turned on, the timer starts. Then after 5 seconds have passed,if
LEDs are on, they are turned off. 

