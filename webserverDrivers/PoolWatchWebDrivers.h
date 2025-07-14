#ifndef POOL_WATCH_WEB_DRIVERS_H
#define POOL_WATCH_WEB_DRIVERS_H

// private char *ssid;
// private char *password;
// private char *host;
// private int port;
// private int serialNumber;

class webserver{
  private:
    char *ssid;
    char *password;
    char *IP;
    char *host;
    int port;
    int serialNumber;
  public:
    webserver();
    void connectWiFi(char *wifi_ssid, char *wifi_password);
    void establishDevice(char *server_hostname, char *server_ip, int server_port, int device_serialNumber);
    void sendReport(float tempature, float ClCon, float PCon, float particulateAmount, String particulateSize);
    void sendStatus(float battery, bool pumpStatus, bool fiveRegulator, bool twelveRegulator, float *output);
};

extern webserver PoolWatchWebDrivers;
extern bool DEBUG;

#endif