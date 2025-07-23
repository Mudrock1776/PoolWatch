## Webserver arduino drivers for PoolWatch ##

#### Installations ####
To install these drivers simply copy DebugPanelDrivers.h and DebugPanelDrivers.cpp into your sketch folder and include "DebugPanelDrivers.h" in your .ino file.

#### Initializing ####
To initialize the panel call the function debugPanelDrivers.initializePins(), which initializes every system as working.

#### Updating Status ####
To Update the debug panel run the function debugPanelDrivers.setStatus(), which takes in:
- bool pumpStatus: the working status of the pump