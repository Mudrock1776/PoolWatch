#include "PoolWatchWebDrivers.h"
#include "TempSensorDrivers.h"
#include "Relay.h"
#include "LEDDriver.h"
#include "DebugPanelDrivers.h"
#include "BatteryMonitor.h"
#include "esp32_I2C.h"
#include "chlorine_phosphate_driver.h"



char *WIFI_SSID = "Greggu"; //Your wifi name
char *WIFI_PASSWORD = "Group4is"; //Your wifi password


// ================= USER CONFIG =================
static const uint8_t  ESP_I2C_ADDR    = 0x13;     // ESP32 I2C SLAVE address (Pi writes here)
static const int      SDA_PIN         = 22;       // ESP32 SDA  -> Pi GPIO2 (pin 3)
static const int      SCL_PIN         = 23;       // ESP32 SCL  -> Pi GPIO3 (pin 5)
static const int      WAKE_PIN        = 15;       // ESP32 WAKE -> Pi GPIO3 (same pin 5)
static const uint32_t I2C_HZ          = 100000;   // 100 kHz (Pi default)
static const uint32_t CAPTURE_TIMEOUT = 60000;   // 1 minutes

// LED: HIGH when program starts / capture in progress,
// LOW after Pi shutdown pulse is sent
static const int      LED_PIN         = 19;        // change to whatever GPIO your LED is on
// =================================================

// Create the slave-capture object
PiI2CSlaveCapture slave(ESP_I2C_ADDR, SDA_PIN, SCL_PIN, WAKE_PIN, I2C_HZ, CAPTURE_TIMEOUT);


char *SERVER_HOST = "device.necrass"; //This would be the hostname of the website
char *SERVER_IP = "poolswatch.com"; //This is needed for my tests with my home webserver
int SERVER_PORT = 80;
int DEVICE_SERIAL = 3;
unsigned long int StatusDelay = 5000;
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
unsigned long pumpMs = 3000;  // 5s
unsigned long solenoidMs = 2000;  
unsigned long stirrerMs = 5000; 
//wait time b/w phosphate reagent dispensing 
unsigned long phosphateWait = 90000; //1min 30 sec 
unsigned long phosphateWait2 = 60000;//1min
//Spacing Delays b/w operations
unsigned long loadingDelay = 0; //15000;  // 15 pause b/w reagent loading
LEDDriver chlorineLED(CL_PIN);  
LEDDriver phosphateLED(P_PIN); 
chlorine_phoshpate_driver ConcentrationGetter(photoPin_cl, photoPin_ph);

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
  //Wait 1.30 min b/f adding next reagent 
  if (phosphateWait > 0) {
    if (DEBUG) {
      Serial.println("Waiting 1 min 30 sec before second phosphate reagent...");
    }
      unsigned long startWait = millis();
    while (millis() - startWait < phosphateWait) {
      delay(10);
    }
  }
  if (DEBUG) {
      Serial.println("Wait 30 sec)");
  }
  delay(30000);
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
  pinMode(LED_PIN, OUTPUT);
  if (!slave.begin()) {
    Serial.println("[ESP] I2C slave init FAILED");
    // Leave LED on as an error indicator
    return;
  } else {
    Serial.print("[ESP] I2C slave init OK, addr 0x");
    Serial.println(ESP_I2C_ADDR, HEX);
  }
  CuvvettesFull = false;
  chlorineLED.begin();
  phosphateLED.begin();

  chlorineLED.off();
  phosphateLED.off();
  ConcentrationGetter.begin();
  debugPanelDrivers.setStatus(true, true, true, true);
  delay(1000);
}

void loop() {
  float batteryCharge = batteryMonitor.readPercent();
  //bool pumpStatus = true; //If we have away to know this update this value;
  bool fiveRegulator = debugPanelDrivers.get5RegStatus();
  bool twelveRegulator = debugPanelDrivers.get12RegStatus();
  bool pumpStatus = getPumpHealth();//tie to both 12V regulator being ok and if pump ever ran
  PoolWatchWebDrivers.sendStatus(batteryCharge, true, false, true, statusOutput);
  if(statusOutput[0] != 0){
    if (statusOutput[4]){
      //Run Particulate Test
      isCuvvettesFilled();
      digitalWrite(LED_PIN, HIGH);
      CaptureParsed res = slave.captureOnce(/*wakeLowMs=*/500);
      PartAmount = res.count;
      PartSize = res.s1 + ", " + res.s2 + ", " + res.s3;
      digitalWrite(LED_PIN, LOW);
      
    }
    if (statusOutput[2]){
      //runPhosphateSequence();
      //Run Phosphate Test
      phosphateLED.on();
      delay(1000);
      PCon = 0.7; //ConcentrationGetter.PConcentration();
      phosphateLED.off();
    }
    if (statusOutput[3]){
      //Run Temperature Test
      tempF = tempSensor.getTempF();
    }
    if (statusOutput[1]){
      runChlorineSequence();
      //Run Chlorine Test
      chlorineLED.on();
      delay(1000);
      CLCon = ConcentrationGetter.ClConcentration();
      chlorineLED.off();
    }
    PoolWatchWebDrivers.sendReport(tempF, CLCon, PCon, PartAmount, PartSize);
  }
  delay(StatusDelay);
}
