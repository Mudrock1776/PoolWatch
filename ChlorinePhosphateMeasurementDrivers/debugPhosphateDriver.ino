#define ADC_PIN 32
#define VREF 3.3
#define ADC_RES 4095.0  // 12-bit native
#define Rf 7230.0       // Ohms

#define OVERSAMPLE_BITS 4   // +4 bits = 16-bit effective resolution
#define OVERSAMPLE_COUNT (1 << (2 * OVERSAMPLE_BITS))

float darkVoltage = 0.0;
bool plotMode = false; // false = debug text, true = serial plotter

// --- Oversampled ADC read ---
uint32_t readOversampledADC() {
  uint32_t sum = 0;
  for (int i = 0; i < OVERSAMPLE_COUNT; i++) {
    sum += analogRead(ADC_PIN);
  }
  sum /= OVERSAMPLE_COUNT;
  return sum << OVERSAMPLE_BITS;
}

// --- Convert oversampled ADC to voltage ---
float oversampleToVoltage(uint32_t raw16) {
  return (raw16 / 65535.0) * VREF;
}

// --- Convert voltage to photocurrent ---
float voltageToPhotocurrent(float voltage) {
  return voltage / Rf;
}

// --- Dark current calibration ---
void calibrateDarkCurrent() {
  Serial.println("Calibrating dark current... Please cover photodiode!");
  delay(3000);

  float sum = 0.0;
  for (int i = 0; i < 50; i++) {
    uint32_t raw16 = readOversampledADC();
    sum += oversampleToVoltage(raw16);
    delay(20);
  }
  darkVoltage = sum / 50.0;

  if (!plotMode) {
    Serial.print("Dark baseline voltage = ");
    Serial.print(darkVoltage, 6);
    Serial.print(" V | Equivalent current = ");
    Serial.print(voltageToPhotocurrent(darkVoltage), 9);
    Serial.println(" A");
    Serial.println("Calibration complete!\n");
  }
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  delay(1000);

  Serial.println("\n--- DEBUG + PLOTTER SCRIPT STARTED ---");
  Serial.println("Commands:");
  Serial.println("  c = recalibrate dark current");
  Serial.println("  p = toggle Serial Plotter mode ON/OFF");
  Serial.println("---------------------------------------\n");

  calibrateDarkCurrent();
}

void loop() {
  // --- Handle serial commands ---
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'c' || cmd == 'C') {
      calibrateDarkCurrent();
    } else if (cmd == 'p' || cmd == 'P') {
      plotMode = !plotMode;
      if (!plotMode) {
        Serial.println("\nDEBUG mode active\n");
      } else {
        Serial.println("\nPLOTTER mode active (only numeric data)\n");
      }
    }
  }

  // --- Measurement ---
  uint32_t raw16 = readOversampledADC();
  float oversampledVoltage = oversampleToVoltage(raw16);

  float correctedVoltage = oversampledVoltage - darkVoltage;
  if (correctedVoltage < 0) correctedVoltage = 0;

  float photocurrent = voltageToPhotocurrent(correctedVoltage);

  // --- Output modes ---
  if (plotMode) {
    // Serial Plotter expects simple numbers, separated by spaces or tabs
    Serial.print(correctedVoltage, 6); // Voltage
    Serial.print("\t");
    Serial.println(photocurrent * 1e6, 3); // µA
  } else {
    // Debug output
    Serial.print("OVERSAMPLED Voltage = ");
    Serial.print(oversampledVoltage, 6);
    Serial.print(" V | Corrected = ");
    Serial.print(correctedVoltage, 6);
    Serial.print(" V | Photocurrent = ");
    Serial.print(photocurrent, 9);
    Serial.println(" A");
  }

  delay(200);
}
