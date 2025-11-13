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
bool pumpEverRan = false; // has pump ever run since boot/reset
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
unsigned long stirrerMs = 5000; 
//wait time b/w phosphate reagent dispensing 
unsigned long phosphateWait = 120000; //2min 
unsigned long phosphateWait2 = 60000;//1min
//Spacing Delays b/w operations
unsigned long loadingDelay = 15000;  // 15 pause b/w reagent loading

float statusOutput[5];

void isCuvvettesFilled() {
  if (CuvvettesFull) return;
  pumpEverRan = true;   //pump ran
  if (DEBUG) {
    Serial.println("Pump ON (fill cuvettes)");
  }
  pump.turnOnFor(pumpMs);
  while (pump.state() == HIGH) {
    pump.update();
  }
  if (DEBUG) {
    Serial.println("Pump OFF");
  }
  CuvvettesFull = true;
}


//chlorineParticulate Run 
void runChlorineSequence() {
  if (DEBUG) {
    Serial.println("=== Running Chlorine Sequence ===");
  }
  isCuvvettesFilled();
  //delay to load prefilled reagents
  if (loadingDelay > 0) {
    if (DEBUG) {
    Serial.println("Loading delay before chlorine reagent...");
  }
    unsigned long startWait = millis();
    while (millis() - startWait < loadingDelay) { 
      delay(10); 
    }
  }
  if (DEBUG) {
    Serial.println("Solenoid 1 ON for chlorine reagents");
  }
  solenoid1.turnOnFor(solenoidMs);
  while (solenoid1.state() == HIGH) {
    solenoid1.update();
  }
  if (DEBUG) {
    Serial.println("Solenoid 1 OFF");
  }
  if (DEBUG) {
    Serial.println("Stirrer ON");
  }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
  if (DEBUG) {
  Serial.println("Stirrer OFF");
  Serial.println("=== Chlorine Sequence Done ===");
  }
}

//phosphate run
void runPhosphateSequence() {
  if (DEBUG) {
    Serial.println("=== Running Phosphate Sequence ===");
  }
  isCuvvettesFilled();
  if (loadingDelay > 0) {
    if (DEBUG) {
      Serial.println("Loading delay before first phosphate reagent...");
  }
    unsigned long startWait = millis();
    while (millis() - startWait < loadingDelay) { 
      delay(10); 
    }
  }
    if (DEBUG) {
      Serial.println("Solenoid 2 ON (phosphate reagent 1)");
    }
  //run solenoid 2 for Reagent 1
  solenoid2.turnOnFor(solenoidMs);
  while (solenoid2.state() == HIGH) {
    solenoid2.update();
  }
    if (DEBUG) {
      Serial.println("Solenoid 2 OFF");
      Serial.println("Stirrer ON");
    }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
    if (DEBUG) {
      Serial.println("Stirrer OFF");
    }
  //Wait 2 min b/f adding next reagent 
  if (phosphateWait > 0) {
    if (DEBUG) {
      Serial.println("Waiting 2 min before second phosphate reagent...");
    }
      unsigned long startWait = millis();
    while (millis() - startWait < phosphateWait) {
      delay(10);
    }
  }
    if (DEBUG) {
      Serial.println("Solenoid 2 ON (phosphate reagent 2)");
    }
  solenoid2.turnOnFor(solenoidMs);
  while (solenoid2.state() == HIGH) {
    solenoid2.update();
  }
    if (DEBUG) {
      Serial.println("Solenoid 2 OFF");
      Serial.println("Stirrer ON for second mix");
    }
  stirrer.turnOnFor(stirrerMs);
  while (stirrer.state() == HIGH) {
    stirrer.update();
  }
    if (DEBUG) {
      Serial.println("Stirrer OFF");
    }
  if (phosphateWait2 > 0) {
    if (DEBUG) {
      Serial.println("Final wait after phosphate sequence...");
    }
    unsigned long startWait2 = millis();
    while (millis() - startWait2 < phosphateWait2) {
      delay(10);
    }
  }
  if (DEBUG) {
      Serial.println("=== Phosphate Sequence Done ===");
  }
}

bool getPumpHealth() {
    return pumpEverRan && debugPanelDrivers.get12RegStatus();
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
  bool fiveRegulator = debugPanelDrivers.get5RegStatus();
  bool twelveRegulator = debugPanelDrivers.get12RegStatus();
  bool pumpStatus = getPumpHealth();//tie to both 12V regulator being ok and if pump ever ran

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