#include "chlorine_phosphate_driver.h"

chlorine_phoshpate_driver::chlorine_phoshpate_driver(uint8_t Clpin, uint8_t Ppin){
  _pdClPin = Clpin; 
  _pdPPin = Ppin;
}

int readAvg(int photoPin) {
  static uint16_t s[SAMPLE_COUNT];
  for (int i=0;i<SAMPLE_COUNT;i++){
    int r = analogRead(photoPin);
    if (false) r = ADC_MAX - r;
    s[i]=r;
    delay(2);
  }
  // sort
  for (int i=1;i<SAMPLE_COUNT;i++){
    uint16_t k = s[i]; int j=i-1;
    while (j>=0 && s[j]>k) { s[j+1]=s[j]; j--; }
    s[j+1]=k;
  }
  long sum=0; int cnt=0;
  for (int i=DISCARD;i<SAMPLE_COUNT-DISCARD;i++){ sum+=s[i]; cnt++; }
  return cnt? (int)(sum/cnt) : 0;
}

void chlorine_phoshpate_driver::begin(){
  analogReadResolution(12);
  analogSetPinAttenuation(_pdClPin, ADC_11db);
  analogSetPinAttenuation(_pdPPin, ADC_11db);
  darkOffsetCl = readAvg(_pdClPin);
  darkOffsetP = readAvg(_pdPPin);
}

float chlorine_phoshpate_driver::ClConcentration(){
  int raw = readAvg(_pdClPin);
  int sampleCorr = raw - darkOffsetCl;
  if (sampleCorr < 0) sampleCorr = 0;
  float I0corr = max(EPSILON, referenceIntensity - (float)darkOffsetCl);
  float Isample_corr_f = (float)sampleCorr;
  float intensityRatio = 1.0f;
  float A = 0.0f;

  if (Isample_corr_f >= MIN_THRESH && I0corr > EPSILON) {
    intensityRatio = Isample_corr_f / I0corr;
    if (intensityRatio < EPSILON) intensityRatio = EPSILON;
    if (intensityRatio > 1.0f) intensityRatio = 1.0f;
    A = log10(1.0f / intensityRatio);
    if (A < 0) A = 0;
  } else {
    // insufficient signal
    intensityRatio = (I0corr>EPSILON) ? (Isample_corr_f / I0corr) : 1.0f;
    A = 0.0f;
  }
  float concentration = (A / (molarAbsorptivityCl * pathLength)) * molarMassCl * 1000.0f;
  return concentration; 
}

float chlorine_phoshpate_driver::PConcentration(){
  int raw = readAvg(_pdPPin);
  int sampleCorr = raw - darkOffsetP;
  if (sampleCorr < 0) sampleCorr = 0;
  float I0corr = max(EPSILON, referenceIntensity - (float)darkOffsetP);
  float Isample_corr_f = (float)sampleCorr;
  float intensityRatio = 1.0f;
  float A = 0.0f;

  if (Isample_corr_f >= MIN_THRESH && I0corr > EPSILON) {
    intensityRatio = Isample_corr_f / I0corr;
    if (intensityRatio < EPSILON) intensityRatio = EPSILON;
    if (intensityRatio > 1.0f) intensityRatio = 1.0f;
    A = log10(1.0f / intensityRatio);
    if (A < 0) A = 0;
  } else {
    // insufficient signal
    intensityRatio = (I0corr>EPSILON) ? (Isample_corr_f / I0corr) : 1.0f;
    A = 0.0f;
  }
   float concentration = (A / (molarAbsorptivityP * pathLength)) * molarMassP * 1000.0f;
}

