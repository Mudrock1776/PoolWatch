## Webserver arduino drivers for PoolWatch ##

#### Installations ####
To install these drivers simply copy DebugPanelDrivers.h and DebugPanelDrivers.cpp into your sketch folder and include "DebugPanelDrivers.h" in your .ino file.

#### Initializing ####
To initialize the panel call the function debugPanelDrivers.initializePins(), which initializes every system as working.

#### Updating Status ####
To Update the debug panel run the function debugPanelDrivers.setStatus(), which takes in:
- bool mcuStatus: the working status of the MCU
- bool pumpStatus: the working status of the pump
- bool chlorineStatus: the working status of the Chlorine Sensor
- bool phosphateStatus: the working status of the Phosphate Sensor

#### Finding Regulator Status ####
To obtain the stuatus of a regulator run the function debugPanelDrivers.get12RegStatus() for the twelve volt regulator and debugPanelDrivers.get5RegStatus() for the five volt regulator. Please note that there is not function for the 3V3 Regulator as the MCU would be off if that failed.