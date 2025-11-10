#include "PoolWatchWebDrivers.h"
#include "TempSensorDrivers.h"
#include "Relay.h"
#include "LEDDriver.h"
#include "DebugPanelDrivers.h"
#include "BatteryMonitor.h"

char *WIFI_SSID = ""; //Your wifi name
char *WIFI_PASSWORD = ""; //Your wifi password

char *SERVER_HOST = "device.necrass"; //This would be the hostname of the website
char *SERVER_IP = "poolswatch.com"; //This is needed for my tests with my home webserver
int SERVER_PORT = 80;
int DEVICE_SERIAL = 1;
unsigned long int StatusDelay = 100000;
bool DEBUG = true;
bool CuvvettesFull;
float tempF = 0;
float CLCon = 0;
float PCon = 0;
int PartAmount = 0;
String PartSize = "small";
BatteryMonitor batteryMonitor(34);
TemperatureSensor tempSensor(33);

float statusOutput[5];

void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }
  // Establish Connection to Web Server
  PoolWatchWebDrivers.connectWiFi(WIFI_SSID,WIFI_PASSWORD);
  PoolWatchWebDrivers.establishDevice(SERVER_HOST,SERVER_IP,SERVER_PORT,DEVICE_SERIAL);
  batteryMonitor.setPin();
  debugPanelDrivers.initializePins();
  tempSensor.begin();
  CuvvettesFull = false;
}

void loop() {
  float batteryCharge = batteryMonitor.readPercent();
  bool pumpStatus = true; //If we have away to know this update this value;
  bool fiveRegulator = debugPanelDrivers.get5RegStatus();
  bool twelveRegulator = debugPanelDrivers.get12RegStatus();

  PoolWatchWebDrivers.sendStatus(batteryCharge, true, false, true, statusOutput);
  if(statusOutput[0] != 0){
    if (statusOutput[1]){
      //Run Chlorine Test
      CLCon = 0;
    }
    if (statusOutput[2]){
      //Run Phosphate Test
      PCon = 0;
    }
    if (statusOutput[3]){
      //Run Temperature Test
      tempF = tempSensor.getTempF();
    }
    if (statusOutput[4]){
      //Run Particulate Test
      PartAmount = 0;
      PartSize = "small";
    }
    PoolWatchWebDrivers.sendReport(tempF, CLCon, PCon, PartAmount, PartSize);
  }
  delay(StatusDelay);
}