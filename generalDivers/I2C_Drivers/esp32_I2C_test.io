#include "esp32_I2C.h"

// ===== USER CONFIG (matches your sketch) =====
static const uint8_t  PI_ADDR           = 0x13;     // Pi "slave" I2C address
static const int      SDA_PIN           = 22;       // ESP32 SDA  -> Pi GPIO2 (pin 3)
static const int      SCL_PIN           = 23;       // ESP32 SCL  -> Pi GPIO3 (pin 5)
static const int      WAKE_PIN          = 15;       // ESP32 GPIO15 -> Pi GPIO3 (wake)
static const uint32_t I2C_HZ            = 100000;   // 100 kHz safest
static const uint32_t BOOT_TIMEOUT_MS   = 45000;    // Pi boot/ACK window
static const uint32_t PROC_TIMEOUT_MS   = 30000;    // payload ready window
static const uint16_t CHUNK_BYTES       = 120;      // robust vs Wire buffers
// =============================================

// Make the client object
PiI2CMaster pi(PI_ADDR, SDA_PIN, SCL_PIN, WAKE_PIN,
               I2C_HZ, BOOT_TIMEOUT_MS, PROC_TIMEOUT_MS, CHUNK_BYTES);

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\nESP32 one-shot: wake Pi → I2C capture → parse → deep sleep");

  // Bring up I2C hardware
  pi.begin();

  // Full transaction and parsed output
  CaptureParsed r = pi.captureParsed(/*doWakeFirst=*/true);

  if (!r.ok) {
    Serial.print("Error: ");
    Serial.println(r.error);
    Serial.println("Sleeping (error).");
    esp_deep_sleep_start();
  }

  Serial.println("---- Raw payload ----");
  Serial.println(r.raw);
  Serial.println("---- Parsed ----");
  Serial.printf("p_count: %d\n", r.count);
  Serial.println(r.s1);
  Serial.println(r.s2);
  Serial.println(r.s3);

  Serial.println("Done. Deep sleeping now.");
  esp_deep_sleep_start();
}

void loop() {
  // never reached
}
