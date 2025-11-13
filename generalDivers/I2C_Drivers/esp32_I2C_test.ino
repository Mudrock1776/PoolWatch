#include "esp32_I2C.h"

// ================= USER CONFIG =================
static const uint8_t  ESP_I2C_ADDR    = 0x13;     // ESP32 I2C SLAVE address (Pi writes here)
static const int      SDA_PIN         = 23;       // ESP32 SDA  -> Pi GPIO2 (pin 3)
static const int      SCL_PIN         = 22;       // ESP32 SCL  -> Pi GPIO3 (pin 5)
static const int      WAKE_PIN        = 15;       // ESP32 WAKE -> Pi GPIO3 (same pin 5)
static const uint32_t I2C_HZ          = 100000;   // 100 kHz (Pi default)
static const uint32_t CAPTURE_TIMEOUT = 120000;   // 2 minutes

// LED: HIGH when program starts / capture in progress,
// LOW after Pi shutdown pulse is sent
static const int      LED_PIN         = 19;        // change to whatever GPIO your LED is on
// =================================================

// Create the slave-capture object
PiI2CSlaveCapture slave(ESP_I2C_ADDR, SDA_PIN, SCL_PIN, WAKE_PIN, I2C_HZ, CAPTURE_TIMEOUT);

void setup() {
  Serial.begin(115200);
  delay(200);

  // LED on at program start
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);   // LED = 1 while we run / wait on Pi

  Serial.println();
  Serial.println("=== ESP32 I2C SLAVE CAPTURE (Pi master on /dev/i2c-1) ===");

  if (!slave.begin()) {
    Serial.println("[ESP] I2C slave init FAILED");
    // Leave LED on as an error indicator
    return;
  } else {
    Serial.print("[ESP] I2C slave init OK, addr 0x");
    Serial.println(ESP_I2C_ADDR, HEX);
  }

  // Single-shot: wake Pi, then wait for it to write the payload
  Serial.println("[ESP] Waking Pi...");
  CaptureParsed res = slave.captureOnce(/*wakeLowMs=*/500);

  if (!res.ok) {
    Serial.print("[ESP] Capture error: ");
    Serial.println(res.error);
    // In error case, we *don't* try to shut the Pi down since
    // we never got a full payload. LED stays on to indicate trouble.
  } else {
    Serial.println("[ESP] Capture OK!");
    Serial.print("  Count = "); Serial.println(res.count);
    Serial.print("  S1    = "); Serial.println(res.s1);
    Serial.print("  S2    = "); Serial.println(res.s2);
    Serial.print("  S3    = "); Serial.println(res.s3);

    Serial.println("---- Raw payload ----");
    Serial.println(res.raw);

    // We have successfully received all information from the Pi.
    // Now send a second pulse on WAKE_PIN to request Pi shutdown.
    Serial.println("[ESP] Requesting Pi shutdown via second pulse...");
    slave.shutdownPi(/*lowMs=*/500);

    // After requesting Pi shutdown, turn LED off
    digitalWrite(LED_PIN, LOW);  // LED = 0 after Pi is turned off (requested)
    Serial.println("Particulate Capture Completed");
  }

  // Optionally: deep sleep here if this is a one-shot device
  // esp_deep_sleep_start();
}

void loop() {
}
