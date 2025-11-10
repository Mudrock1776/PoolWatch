#include "PoolWatchWebDrivers.h"

char *WIFI_SSID = ""; //Your wifi name
char *WIFI_PASSWORD = ""; //Your wifi password

char *SERVER_HOST = "192.168.1.69"; //This would be the hostname of the website
char *SERVER_IP = "192.168.1.69"; //This is needed for my tests with my home webserver
int SERVER_PORT = 8080;
int DEVICE_SERIAL = 2;
bool DEBUG = true;

void setup() {
  if (DEBUG){
    Serial.begin(115200);
  }

  PoolWatchWebDrivers.connectWiFi(WIFI_SSID,WIFI_PASSWORD);
  PoolWatchWebDrivers.establishDevice(SERVER_HOST,SERVER_IP,SERVER_PORT,DEVICE_SERIAL);
  float statusOutput[5];
  PoolWatchWebDrivers.sendStatus(0.5, true, false, true, statusOutput);
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
  PoolWatchWebDrivers.sendReport(90, .5, .5, .5, "small");
}

void loop() {
  delay(10000);
}
