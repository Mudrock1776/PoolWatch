## Pump and Solenoid arduino drivers for PoolWatch ##

#### Installations ####
To install driver copy PumpSolenoidSequence.h and PumpSolenoidSequence.cpp into sketch folder and include "PumpSolenoidSequence.h" in your .ino file.

#### Setting GPIO Pins ####
To configure ESP32 GPIO pins for relays, use output-capable pins. In your .ino file, pass the selected pins to the class constructors.

Initialize the pins by using the function PumpSolenoidSequence.begin() on your Pump and Solenoid objects. The function PumpSolenoidSequence.begin() keeps each pin OFF initially using digitalWrite(...) and then sets it as an OUTPUT with pinModefrom the Arduino library.

#### PumpRelay ####
To run the water pump, use the function PumpSolenoidSequence.pumpRelay. This function turns the relay module connected to the pump on for 5 seconds and then turns it off. 

The delays set in the function can be adjusted to increase or decrease running time of pump. 

#### Solenoid Relay ####
To run the solenoid valves, use the function PumpSolenoidSequence.solenoidRelay. This function turns the relay module connected to a solenoid valve on for 1 second and then turns it off. 

The delays set in the function can be adjusted to increase or decrease running time of solenoid valves.  