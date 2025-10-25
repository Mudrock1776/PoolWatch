## Battery Monitor driver for PoolWatch ##

#### Installations ####
To install driver copy BatteryMonitor.h and BatteryMonitor.cpp into sketch folder and include "BatteryMonitor.h" in your .ino file.

#### ADC Calibration  ####
The driver averages 10 samples for stable readings and each reading includes a 2 ms delay between samples. 
Each sample uses analogReadMilliVolts(), which automatically applies factory set eFuse calibration. This allows for 
accurate mV conversion without requiring manual calibration or voltage reference corrections.
The ADC reading in millivolts is converted to volts and multiplied by the resistor divider ratio to get the true battery voltage.
Vbat = (pin_mV / 1000) * ((R1 + R2) / R2).

#### Reading Battery Voltage and Percent ####
Modify the thresholds in readPercent() for other battery chemistries. This is for a Lithium ion battery pack with nominal voltage of 14.2V
and max voltage to be kept around 16V for most stable long life of battery. Adjust R1 and R2 to match your hardware voltage divider. 
The voltage seen at the ADC pin should be kept below 3.3 V for safe ADC readings. 