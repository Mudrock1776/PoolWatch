#define ADC_PIN 32
#define VREF 3.3
#define ADC_RES 4095.0  // 12-bit native
#define Rf 7230.0       // Feedback resistor in ohms

#define OVERSAMPLE_BITS 4   // +4 bits = 16-bit effective resolution
#define OVERSAMPLE_COUNT (1 << (2 * OVERSAMPLE_BITS))

#define CALIBRATION_BUTTON 25  // GPIO for button (connect to GND to trigger)

float darkVoltage = 0.0;  // baseline voltage under dark conditions

// Oversampled ADC read
uint32_t readOversampledADC() {
  uint32_t sum = 0;
  for (int i = 0; i < OVERSAMPLE_COUNT; i++) {
    sum += analogRead(ADC_PIN);
  }
  sum /= OVERSAMPLE_COUNT;        // average
  return sum << OVERSAMPLE_BITS;  // scale up
}

// Convert ADC to voltage (16-bit scaled)
float readVoltage() {
  uint32_t raw16 = readOversampledADC();
  return (raw16 / 65535.0) * VREF;
}

// Convert voltage to photocurrent (A)
float readPhotocurrent(float voltage) {
  return voltage / Rf;
}

// Calibration routine (cover photodiode first)
void calibrateDarkCurrent() {
  Serial.println("Calibrating dark current... Please cover the photodiode.");
  delay(3000); // time to cover diode
  float sum = 0.0;
  for (int i = 0; i < 50; i++) {
    sum += readVoltage();
    delay(20);
  }
  darkVoltage = sum / 50.0;

  Serial.print("Dark current baseline voltage: ");
  Serial.println(darkVoltage, 6);
  Serial.print("Equivalent dark current: ");
  Serial.println(readPhotocurrent(darkVoltage), 9);
  Serial.println("Calibration complete!\n");
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  pinMode(CALIBRATION_BUTTON, INPUT_PULLUP); // button active LOW

  delay(1000);
  calibrateDarkCurrent(); // initial calibration
}

void loop() {
  // --- Check for serial calibration command ---
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'c' || cmd == 'C') {
      calibrateDarkCurrent();
    }
  }

  // --- Check for button press (active LOW) ---
  if (digitalRead(CALIBRATION_BUTTON) == LOW) {
    calibrateDarkCurrent();
    delay(1000); // debounce delay
  }

  // --- Regular measurement ---
  float voltage = readVoltage();
  float correctedVoltage = voltage - darkVoltage;
  if (correctedVoltage < 0) correctedVoltage = 0; // clamp

  float photocurrent = readPhotocurrent(correctedVoltage);

  Serial.print("Voltage (V): ");
  Serial.print(correctedVoltage, 6);
  Serial.print("   Photocurrent (A): ");
  Serial.println(photocurrent, 9);

  delay(500);
}
