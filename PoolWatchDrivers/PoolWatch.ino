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
Relay pump(RELAY1PIN);
Relay solenoid1(RELAY2PIN);  
Relay solenoid2(RELAY3PIN); 
Relay stirrer(RELAY4PIN);    


//Relay On Timings 
unsigned long pumpMs = 5000;  // 5s
unsigned long solenoidMs = 2000;  
unsigned long stirrerMs = 3000;  
unsigned long phosphateWait = 6000; //wait time b/w phosphate reagent dispensing 
//Spacing Delays b/w operations
unsigned long pumpToSolenoidDelay = 1000;  // pause after pump ends for settling 
unsigned long solenoidToStirDelay = 500;   // pause after solenoid ends
unsigned long phosphateLoadWait = 45000;  // 45 pause b/w phosphate reagent loading

float statusOutput[5];

//chlorineParticulate Run 
void runChlorineParticulateSequence() {
  CuvvettesFull = false;
  //running pump
  pump.turnOnFor(pumpMs);
  while (pump.state() == HIGH) {
    pump.update();
  }
  if (DEBUG) {
    Serial.print("Waiting ");
  }
  delay(pumpToSolenoidDelay);
  //running solenoid 1 
  solenoid1.turnOnFor(solenoidMs);
  while (solenoid1.state() == HIGH) {
    solenoid1.update();
  }
  if (DEBUG) {
    Serial.print("Waiting ");
  }
  delay(solenoidToStirDelay);
  //running stirrer 
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
  CuvvettesFull = true; //end
}

//phosphate run
void runPhosphateSequence() {
  CuvvettesFull = false;
  // Pump on
  pump.turnOnFor(pumpMs);
  while (pump.state() == HIGH) {
    pump.update();
  }
  //wait between pump and first solenoid 
  if (DEBUG) {
    Serial.print("Waiting ");
    Serial.print(pumpToSolenoidDelay);
  }
  delay(pumpToSolenoidDelay);
  //3 cycles of wait then solenoid2 then stir
  for (int cycle = 0; cycle < 3; cycle++) {
    //wait to load reagents before this dose
    if (phosphateWait > 0) {
      if (DEBUG) {
      Serial.print("Waiting before cycle ");
      Serial.print(cycle + 1);
      Serial.println("...");
      }
      unsigned long startWait = millis();
      while (millis() - startWait < phosphateWait) {
        delay(10);  
      }
    }
    //run solenoid 2
    solenoid2.turnOnFor(solenoidMs);
    while (solenoid2.state() == HIGH) {
      solenoid2.update();
    }
    //run stirrer
    stirrer.turnOnFor(stirrerMs);
    while (stirrer.state() == HIGH) {
      stirrer.update();
    }
  }
  CuvvettesFull = true;
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
  tempSensor.begin();
  CuvvettesFull = false;
}

void loop() {
  float batteryCharge = batteryMonitor.readPercent();
  //bool pumpStatus = true; //If we have away to know this update this value;
  bool pumpStatus = (pump.state() == HIGH);   // relay HIGH = pump ON
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