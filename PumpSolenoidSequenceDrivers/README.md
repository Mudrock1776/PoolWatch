## Relay drivers for PoolWatch ##

#### Installations ####
To install driver copy relayTest.h and Relay.cpp into sketch folder and include "Relay.h" in your .ino file.

#### Setting GPIO Pins ####
To configure ESP32 GPIO pins for relays, use output-capable pins. Four channels are predefined for this project in the .h file and each channel number maps 
to a predefined ESP32 GPIO pin. Change as needed. The relay number to be used for component is passed to the constructor which automatically maps relay number to predefined pins, 
sets the pin to LOW to prevent accidental turn on during boot/reset, and configures the pin as an OUTPUT with pinMode().

#### Relay ####
Relays used are Normally Open (NO) and active-HIGH trigger. Writing HIGH turns the relay ON and writing LOW turns the relay OFF.
Each pump, solenoid, or stirrer used in the project has its own dedicated relay. Non-blocking functions are used to allow for multitasking. 

turnOnFor(unsigned long ms) turns the relay on for the specified time given in milliseconds. 

turnOff() function immediately turns the relay off. 

update() function checks whether the relay’s ON duration has expired. It is called inside the loop() to keep timing accurate.

state() function returns the current state of the relay pin (HIGH = ON, LOW = OFF).
