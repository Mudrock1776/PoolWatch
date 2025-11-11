## Drivers for PoolWatch ##

#### Installations ####
To install these drivers simply copy esp32_I2C.h and esp32_I2C.cpp into your sketch folder and include "esp32_I2C.h" in your .ino file.

#### Initializing ####
To initialize the I2C call the function create an object of class PiI2CMaster, you can then call pi.begin() to initialize.

#### Reading Data ####
To get data from the pi call pi.captureAndRead() into a string. Note some parsing is required to get the pure data. See esp32_I2C_test.io for an example.