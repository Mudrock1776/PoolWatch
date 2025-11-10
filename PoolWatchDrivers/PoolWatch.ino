#include "PoolWatchWebDrivers.h"
#include <TimerOne.h>

char *WIFI_SSID = "hughes"; //Your wifi name
char *WIFI_PASSWORD = "dolfan13"; //Your wifi password

char *SERVER_HOST = "192.168.1.69"; //This would be the hostname of the website
char *SERVER_IP = "192.168.1.69"; //This is needed for my tests with my home webserver
int SERVER_PORT = 8080;
int DEVICE_SERIAL = 2;
bool DEBUG = true;

float statusOutput[5];
unsigned long int SAMPLE_RATE = 86400000; //24 hours
unsigned long int STATUS_RATE = 30000000;


void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }
  // Establish Connection to Web Server
  PoolWatchWebDrivers.connectWiFi(WIFI_SSID,WIFI_PASSWORD);
  PoolWatchWebDrivers.establishDevice(SERVER_HOST,SERVER_IP,SERVER_PORT,DEVICE_SERIAL);

  // Set Up Automatic Status Updates
  Timer1.initialize(STATUS_RATE);
  Timer1.attachInterrupt(statusUpdate);


}

void statusUpdate() {
  PoolWatchWebDrivers.sendStatus(1, true, true, true, statusOutput);
  if(statusOutput[0] != 0){
    Serial.println("Update Sample Rate");
    Serial.println(statusOutput[0]);
    if (statusOutput[1]){
      Serial.println("Run Chlorine Test");
    }
    if (statusOutput[2]){
      Serial.println("Run Phosphate Test");
    }
    if (statusOutput[3]){
      Serial.println("Run Tempature Test");
    }
    if (statusOutput[4]){
      Serial.println("Run Particulate Test");
    }
  }
}

void loop() {

  delay(10000);
}
