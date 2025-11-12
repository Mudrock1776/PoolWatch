#include "PoolWatchWebDrivers.h"
#include "TempSensorDrivers.h"
#include "Relay.h"
#include "LEDDriver.h"
#include "DebugPanelDrivers.h"
#include "BatteryMonitor.h"



char *WIFI_SSID = ""; //Your wifi name
char *WIFI_PASSWORD = ""; //Your wifi password

char *SERVER_HOST = ""; //This would be the hostname of the website
char *SERVER_IP = ""; //This is needed for my tests with my home webserver
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
Relay pump(RELAY1PIN);
Relay solenoid1(RELAY2PIN);  
Relay solenoid2(RELAY3PIN); 
Relay stirrer(RELAY4PIN);    


//Relay On Timings 
unsigned long pumpMs = 5000;  // 5s
unsigned long solenoidMs = 2000;  
unsigned long stirrerMs = 5000; //5s
//wait time b/w phosphate reagent dispensing 
unsigned long phosphateWait = 120000; //2min 
unsigned long phosphateWait2 = 60000;//1min
//Spacing Delays b/w operations
unsigned long loadingDelay = 45000;  // 45 pause b/w reagent loading

float statusOutput[5];

void isCuvvettesFilled() {
  if (CuvvettesFull) return;  
  pump.turnOnFor(pumpMs);
  while (pump.state() == HIGH) {
    pump.update();
  }
  CuvvettesFull = true;
}


//chlorineParticulate Run 
void runChlorineSequence() {
  isCuvvettesFilled();
  //delay to load prefilled reagents
  if (loadingDelay > 0) {
    unsigned long startWait = millis();
    while (millis() - startWait < loadingDelay) { 
      delay(10); 
    }
  }
  solenoid1.turnOnFor(solenoidMs);
  while (solenoid1.state() == HIGH) {
    solenoid1.update();
  }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
}

//phosphate run
void runPhosphateSequence() {
  isCuvvettesFilled();
  if (loadingDelay > 0) {
    unsigned long startWait = millis();
    while (millis() - startWait < loadingDelay) { 
      delay(10); 
    }
  }
  //run solenoid 2 for Reagent 1
  solenoid2.turnOnFor(solenoidMs);
  while (solenoid2.state() == HIGH) {
    solenoid2.update();
  }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
  //Wait 2 min b/f adding next reagent 
  if (phosphateWait > 0) {
    unsigned long startWait = millis();
    while (millis() - startWait < phosphateWait) {
      delay(10);
    }
  }
  solenoid2.turnOnFor(solenoidMs);
  while (solenoid2.state() == HIGH) {
    solenoid2.update();
  }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
  if (phosphateWait2 > 0) {
    unsigned long startWait2 = millis();
    while (millis() - startWait2 < phosphateWait2) {
      delay(10);
    }
  }
}

void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }
  // Establish Connection to Web Server
  PoolWatchWebDrivers.connectWiFi(WIFI_SSID,WIFI_PASSWORD);
  PoolWatchWebDrivers.establishDevice(SERVER_HOST,SERVER_IP,SERVER_PORT,DEVICE_SERIAL);
  batteryMonitor.setPin();
  debugPanelDrivers.initializePins();
  pump.setPins(); 
  stirrer.setPins(); 
  solenoid1.setPins();
  solenoid2.setPins(); 
  tempSensor.begin();
  CuvvettesFull = false;
}

void loop() {
  float batteryCharge = batteryMonitor.readPercent();
  //bool pumpStatus = true; //If we have away to know this update this value;
  bool pumpStatus = (pump.state() == HIGH);   //pump ON
  bool fiveRegulator = debugPanelDrivers.get5RegStatus();
  bool twelveRegulator = debugPanelDrivers.get12RegStatus();

  PoolWatchWebDrivers.sendStatus(batteryCharge, true, false, true, statusOutput);
  if(statusOutput[0] != 0){
    if (statusOutput[1]){
      runChlorineSequence();
      //Run Chlorine Test
      CLCon = 0;
    }
    if (statusOutput[2]){
      runPhosphateSequence();
      //Run Phosphate Test
      PCon = 0;
    }
    if (statusOutput[3]){
      //Run Temperature Test
      tempF = tempSensor.getTempF();
    }
    if (statusOutput[4]){
      //Run Particulate Test
      isCuvvettesFilled(); 
      PartAmount = 0;
      PartSize = "small";
    }
    PoolWatchWebDrivers.sendReport(tempF, CLCon, PCon, PartAmount, PartSize);
  }
  delay(StatusDelay);
}