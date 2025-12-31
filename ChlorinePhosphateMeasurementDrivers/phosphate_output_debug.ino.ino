// === ESP32 Beer–Lambert Concentration Measurement (with Debug Mode) ===
// Reads photocurrent from a PIN photodiode and calculates
// absorbance (0–1 range) and concentration (mol/L).
// Optional debug mode prints detailed info for troubleshooting.

#define DEBUG true   // Set to true for detailed debug output, false for clean mode

const int photoPin = 36;           // Analog input pin for photodiode
const float referenceIntensity = 4095.0;  // Reference I0 (blank measurement)
const float molarAbsorptivity = 12160.0;  // ε value (L·mol⁻¹·cm⁻¹)
const float pathLength = 1.0;             // Path length in cm
const int minSignalThreshold = 10;        // ADC counts below this = "no signal"

const float ADC_RESOLUTION = 4095.0;
const float V_REF = 3.3;                 // ADC reference voltage for ESP32

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);  // 12-bit ADC (0–4095)
  Serial.println("=== Beer–Lambert Concentration Measurement ===");
  delay(1000);

  if (DEBUG) {
    Serial.println("[DEBUG] System initialized.");
    Serial.printf("[DEBUG] Reference Intensity (I0): %.1f\n", referenceIntensity);
    Serial.printf("[DEBUG] Molar Absorptivity (ε): %.1f\n", molarAbsorptivity);
    Serial.printf("[DEBUG] Path Length (l): %.2f cm\n", pathLength);
    Serial.printf("[DEBUG] Min Signal Threshold: %d\n", minSignalThreshold);
    Serial.println("==========================================");
  }
}

void loop() {
  int adcValue = analogRead(photoPin);
  float voltage = (adcValue / ADC_RESOLUTION) * V_REF;

  if (DEBUG) {
    Serial.printf("[DEBUG] Raw ADC: %d  |  Voltage: %.3f V\n", adcValue, voltage);
  }

  float absorbance = 0.0;
  float concentration = 0.0;

  if (adcValue > minSignalThreshold) {
    float intensityRatio = (float)adcValue / referenceIntensity;
    if (intensityRatio > 1.0) intensityRatio = 1.0; // Cap ratio to avoid negative absorbance
    if (intensityRatio < 0.001) intensityRatio = 0.001; // Avoid log(0)
    
    // Beer-Lambert: A = log10(I0 / I)
    absorbance = log10(1.0 / intensityRatio);

    // Clamp absorbance to 0–1 range
    if (absorbance < 0.0) absorbance = 0.0;
    if (absorbance > 1.0) absorbance = 1.0;

    // Concentration: c = A / (ε * l)
    concentration = absorbance / (molarAbsorptivity * pathLength);

    if (DEBUG) {
      Serial.printf("[DEBUG] Intensity Ratio (I/I0): %.4f\n", intensityRatio);
      Serial.printf("[DEBUG] Absorbance (A): %.4f\n", absorbance);
      Serial.printf("[DEBUG] Concentration (mol/L): %.8f\n", concentration);
    }
  } else {
    // No valid signal
    absorbance = 0.0;
    concentration = 0.0;
    if (DEBUG) Serial.println("[DEBUG] Below threshold — no signal detected.");
  }

  // Print main results (clean output)
  Serial.println("======================================");
  Serial.printf("ADC: %d\n", adcValue);
  Serial.printf("Absorbance: %.3f\n", absorbance);
  Serial.printf("Concentration: %.8f mol/L\n", concentration);
  Serial.println("======================================\n");

  delay(1000);
}
