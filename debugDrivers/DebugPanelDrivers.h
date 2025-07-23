#ifndef DEGUB_PANEL_DRIVERS_H
#define DEGUB_PANEL_DRIVERS_H
#include <cstdint>

class debugPanel{
  private:
    static const uint8_t pumpStatusPin = 21;
  public:
    debugPanel();
    void initializePins();
    void setStatus(bool pumpStatus);
};

extern debugPanel debugPanelDrivers;
extern bool DEBUG;
#endif