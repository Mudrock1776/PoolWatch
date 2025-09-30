// Photocurrent reader for ESP-32
// Hardware: Photodiode + TIA (Rf = 7.23k) + LPF
// AREF tied to 3.3V, analogReference(EXTERNAL)
// Press 'c' in Serial Monitor to calibrate dark baseline

Make sure to calibrate the PD by pressing C in the serial monitor plot before collecting any measurements. 

By oversampling with 12-bits you can achieve 16-bit effective resolution for synchronous detection with the a modulated LED.

Input Variables:
ADC_PIN
VREF
ADC_RES
Rf

Output Variables:
darkVoltage
correctedVoltage
photocurrent

Each debug will test to see whether the hardware is actually working AND show a live plot of power vs. photocurrent
