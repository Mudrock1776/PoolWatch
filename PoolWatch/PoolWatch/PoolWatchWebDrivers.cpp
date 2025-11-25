#include <WiFi.h>
#include "PoolWatchWebDrivers.h"

webserver::webserver(){
}

String readResponse(NetworkClient *client){
  String message = "";
  unsigned long timeout = millis();
  while (client->available() == 0){
    if (millis() - timeout > 5000){
      client->stop();
      return "";
    }
  }

  while (client->available()){
    String line = client->readStringUntil('\n');
    message = message + line +"\r\n";
  }
  return message;
}

String pullData(String message, String Data){
  String Value = "";
  String subString = "";
  for(int i=0; i<message.length(); i++){
    subString = message.substring(i,i+Data.length());
    if (subString.compareTo(Data) == 0){
      int n = i + Data.length();
      while (message[n] != '\n' && message[n] != ',' && message[n] != '}'){
        Value += message[n];
        n += 1;
      }
      return Value;
    }
  }
}

void webserver::connectWiFi(char *wifi_ssid, char *wifi_password){
  ssid = wifi_ssid;
  password = wifi_password;

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    if (DEBUG){
      Serial.println("Connecting...");
    }
    delay(500);
  }

}

void webserver::establishDevice(char *server_hostname, char *server_ip, int server_port, int device_serialNumber){
  host = server_hostname;
  port = server_port;
  IP = server_ip;
  serialNumber = device_serialNumber;
  NetworkClient client;
  if (!client.connect(IP, port)) {
    return;
  }
  String body = "{\"serialNumber\": " + String(serialNumber) +String("}");
  String msg = "POST /device/exists HTTP/1.1\r\nHost: "+String(host)+":"+port+"\r\nContent-Type: application/json\r\nContent-Length: "+body.length()+"\r\nConnection: close\r\n\r\n" + body;
  
  if (DEBUG){
    Serial.println(msg);
  }
  client.print(msg);
  String returnedMsg = readResponse(&client);
  client.stop();
  if (DEBUG){
    Serial.println(returnedMsg);
  }
  String answer = pullData(returnedMsg,"\"answer\":");
  
  
  if (answer == "false"){
    if (!client.connect(IP, port)) {
      return;
    }
    body = "{\"serialNumber\": "+ String(serialNumber) +", \"battery\": 1, \"pumpStatus\": true, \"fiveRegulator\": true, \"twelveRegulator\": true, \"sampleRate\": 24}";
    msg = "POST /device/create HTTP/1.1\r\nHost: "+String(host)+":"+port+"\r\nContent-Type: application/json\r\nContent-Length: "+body.length()+"\r\nConnection: close\r\n\r\n" + body;
    if (DEBUG){
      Serial.println(msg);
    }
    client.print(msg);
    String returnedMsg2 = readResponse(&client);
    client.stop();
    if (DEBUG){
      Serial.println(returnedMsg2);
    }
  }
  // WiFi.disconnect();
  // WiFi.mode(WIFI_OFF);
}

void webserver::sendReport(float tempature, float ClCon, float PCon, float particulateAmount, String particulateSize){
  // WiFi.begin(ssid, password);

  // while (WiFi.status() != WL_CONNECTED) {
  //   if (DEBUG){
  //     Serial.println("Connecting...");
  //   }
  //   delay(500);
  // }
  NetworkClient client;

  if (!client.connect(IP, port)) {
    // WiFi.disconnect();
    // WiFi.mode(WIFI_OFF);
    return;
  }
  String body = "{\"serialNumber\": "+ String(serialNumber) +", \"report\": {\"tempature\": "+ String(tempature) +", \"ClCon\": "+ String(ClCon) +", \"PCon\": "+ String(PCon) +", \"particulateAmount\": "+ String(particulateAmount) +", \"particulateSize\": \""+ particulateSize +"\"}}";
  String msg = "POST /report/add HTTP/1.1\r\nHost: "+String(host)+":"+port+"\r\nContent-Type: application/json\r\nContent-Length: "+body.length()+"\r\nConnection: close\r\n\r\n" + body;
  if (DEBUG){
    Serial.println(msg);
  }
  client.print(msg);
  String returnedMsg = readResponse(&client);
  client.stop();
  if (DEBUG){
    Serial.println(returnedMsg);
  }
  // WiFi.disconnect();
  // WiFi.mode(WIFI_OFF);
}

int webserver::sendStatus(float battery, bool pumpStatus, bool fiveRegulator, bool twelveRegulator){
  // WiFi.begin(ssid, password);

  // while (WiFi.status() != WL_CONNECTED) {
  //   if (DEBUG){
  //     Serial.println("Connecting...");
  //   }
  //   delay(500);
  // }
  NetworkClient client;
  String pumpStatusString;
  String fiveRegulatorString;
  String twelveRegulatorString;
  int outcode = 0;
  if (pumpStatus){
    pumpStatusString = "true";
  } else {
    pumpStatusString = "false";
  }
  if (fiveRegulator){
    fiveRegulatorString = "true";
  } else {
    fiveRegulatorString = "false";
  }
  if (twelveRegulator){
    twelveRegulatorString = "true";
  } else {
    twelveRegulatorString = "false";
  }
  if (!client.connect(IP, port)) {
    // WiFi.disconnect();
    // WiFi.mode(WIFI_OFF);
    return 0;
  }
  String body = "{\"serialNumber\": "+ String(serialNumber) +", \"battery\": " + String(battery) + ", \"pumpStatus\": " + pumpStatusString + ", \"fiveRegulator\": " + fiveRegulatorString + ", \"twelveRegulator\": " + twelveRegulatorString + "}";
  String msg = "POST /status/update HTTP/1.1\r\nHost: "+String(host)+":"+port+"\r\nContent-Type: application/json\r\nContent-Length: "+body.length()+"\r\nConnection: close\r\n\r\n" + body;
  if (DEBUG){
    Serial.println(msg);
  }
  client.print(msg);
  String returnedMsg = readResponse(&client);
  // client.stop();
  // WiFi.disconnect();
  // WiFi.mode(WIFI_OFF);
  if (DEBUG){
    Serial.println(returnedMsg);
  }
  String needUpdate = pullData(returnedMsg,"\"needUpdate\":");
  if (DEBUG){
    Serial.println(needUpdate);
  }
  if (needUpdate == "true"){
    String testChlorine = pullData(returnedMsg, "\"testChlorine\":");
    if (DEBUG){
      Serial.println(testChlorine);
    }
    String testPhosphate = pullData(returnedMsg, "\"testPhosphate\":");
    if (DEBUG){
      Serial.println(testPhosphate);
    }
    String testTempature = pullData(returnedMsg, "\"testTempature\":");
    if (DEBUG){
      Serial.println(testTempature);
    }
    String testParticulate = pullData(returnedMsg, "\"testParticulate\":");
    if (DEBUG){
      Serial.println(testParticulate);
    }
    String fillWater = pullData(returnedMsg, "\"fillWater\":");
    if (testChlorine == "true"){
      outcode += 1;
    }
    if (testPhosphate == "true"){
      outcode += 2;
    }
    if (testTempature == "true"){
      outcode += 4;
    }
    if (testParticulate == "true"){
      outcode += 8;
    }
    if (fillWater == "true"){
      outcode += 16;
    }
  }
  return outcode;
}


webserver PoolWatchWebDrivers = webserver();