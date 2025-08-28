#ifndef PUMP_SOLENOID_SEQUENCE_H
#define PUMP_SOLENOID_SEQUENCE_H

class Pump
{
  public: 
    Pump(int pin); 
    void begin();
    void pumpRelay(); 
  private: 
    int pin_P; 
};

class Solenoid
{
  public: 
    Solenoid(int pin); 
    void begin();
    void solenoidRelay();  
  private: 
    int pin_S; 

};

extern bool DEBUG;
#endif



