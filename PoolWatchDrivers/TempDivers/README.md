## Drivers for PoolWatch ##

#### Installations ####
To install these drivers simply copy TempSensorDrivers.h and TempSensorDrivers.cpp into your sketch folder and include "TempSensorDrivers.h" in your .ino file.

#### Initializing ####
To initialize the temperature sensor call the function tempSensor.begin(), which initializes the sensor.

#### Reading Temperature ####
To record the temperature run tempSensor.getTempF() or tempSensor.getTempC() to return the current temperature