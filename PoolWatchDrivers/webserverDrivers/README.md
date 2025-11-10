## Webserver arduino drivers for PoolWatch ##

#### Installations ####
To install these drivers simply copy PoolWatchWebDrivers.h and PoolWatchWebDrivers.cpp into your sketch folder and include "PoolWatchWebDrivers.h" in your .ino file.

#### Connecting to the Server ####
To connect to a server, we must first connect to a wifi source using the function PoolWatchWebDrivers.connectWiFi, which takes in a char* wifi_ssid, and a char* wifi_password, which is the name of a local wifi source, and its password.

Once connected you then need to establish the device using PoolWatchWebDrivers.establishDevice, which takes in:
- char *server_hostname: The hostname of the webserver
- char *server_ip: The IP address of the server (Typically the hostname can be used here too)
- int server_port: The Port of the server (Typically 80 or 8080)
- int device_serialNumber: The serial number of the device

This function will see if the device exists within the database, and if it does not it will register the device. Once this function is complete the device will now be linked to the webserver.

#### Sending a Status Update ####
To send a status update use the function PoolWatchWebDrivers.sendStatus, which takes in:
- float battery: The battery percentage as a float
- bool pumpStatus: the working status of the pump
- bool fiveRegulator: the working status of the 5V regulator
- bool twelveRegulator: the working status of the 12V regulator
- float *output: a float array of length 5

Due to how ESP32 handles memory, dynamically allocated arrays will end up being memory leaks, so I used a static array for the output. In my recconmendation create 1 output array for status updates and reuse it for every call of this function and the function will reset the array. The output array will look like the following:
- output[0]: New sample rate in hours
- output[1]: If a chlorine test should be run
- output[2]: If a phosphate test should be run
- output[3]: If a tempature test should be run
- output[4]: If a particulate test should be run

If there are no updates needed the output will be 0 in output[0], if there are any updates needed the output will be whatever the samplerate is in output[0] regardless of if the sample rate has been changed. In positions 1-4 anything that is not 0 will beconsiderd true, meaning that that test needs to be ran. This was structured as an array to limit calls to the webserver.

#### Sending a Report ####
To send a report use the function PoolWatchWebDrivers.sendReport, which takes in:
- float tempature: tempature of the pool
- float ClCon: chlorine concentration of the pool
- float PCon: phosphate concentration of the pool
- float particulateAmount: particulate amount in the pool
- String particulateSize: particulate size in the pool

If only sending one test use a negative number for the rest of the tests. The webserver supports empty values but the drivers do not.