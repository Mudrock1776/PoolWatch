#include <WiFi.h>
#include "PoolWatchWebDrivers.h"
#include "device_credentials.h" //Wifi Passwords saved 

const int RelayPin_1 = 4;
const int RelayPin_2 = 27; //was 34 but moved to 27 
const int RelayPin_3 = 33; //was 36 but moved to 33 
bool DEBUG = true;   


void setup() {
   
  if (DEBUG){
    Serial.begin(115200);
  }
  
  //Connect/register before sendStatus
  PoolWatchWebDrivers.connectWiFi((char*)WIFI_SSID, (char*)WIFI_PASSWORD);
  PoolWatchWebDrivers.establishDevice((char*)SERVER_HOST, (char*)SERVER_IP, SERVER_PORT, DEVICE_SERIAL);

  // Relay off intially
  pinMode(RelayPin_1, OUTPUT);
  pinMode(RelayPin_2, OUTPUT);
  pinMode(RelayPin_3, OUTPUT);
  digitalWrite(RelayPin_1, LOW);
  digitalWrite(RelayPin_2, LOW);
  digitalWrite(RelayPin_3, LOW);
  Serial.println("All relays OFF"); 
  delay(500);

  // Relay on for water pump
  digitalWrite(RelayPin_1, HIGH);
  Serial.println("Pump Relay ON");
  //float out1[5];
  //PoolWatchWebDrivers.sendStatus(0, true, false, false, out1);
  delay(5000); //On for ~5 sec 

  // Relay off for water pump
  digitalWrite(RelayPin_1, LOW);
  Serial.println("Pump Relay OFF");
  //float out2[5]; 
  //PoolWatchWebDrivers.sendStatus(0, false, false, false, out2);
  delay(2000); //Short delay

  // Relay on for solenoid valves
  digitalWrite(RelayPin_2, HIGH);
  digitalWrite(RelayPin_3, HIGH);
  Serial.println("Solenoid Valve1 Relay  ON");
  Serial.println("Solenoid Valve2 Relay  ON");
  delay(1000); //On for ~1 sec 


  // Relay off for solenoid valves
  digitalWrite(RelayPin_2, LOW);
  digitalWrite(RelayPin_3, LOW);
  Serial.println("Solenoid Valve1 Relay OFF");
  Serial.println("Solenoid Valve2 Relay OFF");

}

void loop() {}