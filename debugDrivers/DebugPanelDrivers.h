#ifndef DEGUB_PANEL_DRIVERS_H
#define DEGUB_PANEL_DRIVERS_H
#include <cstdint>

class debugPanel{
  private:
    static const uint8_t mcuStatusPin = 21;
    static const uint8_t pumpStatusPin = 5;
    static const uint8_t chlorineStatusPin = 17;
    static const uint8_t phosphateStatusPin = 16;
    static const uint8_t fiveVADCPin = 25;
    static const uint8_t twelveVADCPin = 39;
  public:
    debugPanel();
    void initializePins();
    void setStatus(bool mcuStatus, bool pumpStatus, bool chlorineStatus, bool phosphateStatus);
    bool get5RegStatus();
    bool get12RegStatus();
};

extern debugPanel debugPanelDrivers;
extern bool DEBUG;
#endif