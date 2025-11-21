#ifndef CHLORINE_PHOSPHATE_DRIVER_H
#define CHLORINE_PHOSPHATE_DRIVER_H
#include <Arduino.h>

const uint8_t photoPin_cl = 36;   // predefined pin for chlorine
const uint8_t photoPin_ph = 34;  // predefined pin for phosphate
const float molarAbsorptivityCl = 22000.0f;  // ε in L·mol⁻¹·cm⁻¹
const float pathLength = 1.0f;             // optical path in cm
const float molarMassCl = 147.20f;           // g/mol
const float molarAbsorptivityP = 12140.0f;  // ε in L·mol⁻¹·cm⁻¹
const float molarMassP = 115.03f;           // g/mol
const int SAMPLE_COUNT = 32;
const int DISCARD = 3;
const int MIN_THRESH = 8;
const float EPSILON = 1e-6f;
const float baseLineCL = 5; // sig(0) - DK
const float baseLineP = 5; // sig(0) - DK

const int ADC_BITS = 12;
const int ADC_MAX = (1 << ADC_BITS) - 1;

class chlorine_phoshpate_driver 
{
	public:
		chlorine_phoshpate_driver(uint8_t Clpin, uint8_t Ppin);
    void begin(); 
		float ClConcentration();
		float PConcentration();
		void setDKCL();
		void setDKP();
	private:
		uint8_t _pdPPin;
		uint8_t _pdClPin;
		int darkOffsetP = 0;
		int darkOffsetCl = 0;
		float referenceIntensity = 4095.0f;
	
};
extern bool DEBUG;


#endif


