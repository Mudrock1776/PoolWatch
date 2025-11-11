#include "PiI2CMaster.h"

// ======= USER CONFIG (matches your original) =======
static const uint8_t  PI_ADDR         = 0x13;     // Pi "slave" I2C address
static const int      SDA_PIN         = 22;       // ESP32 SDA  -> Pi GPIO2
static const int      SCL_PIN         = 23;       // ESP32 SCL  -> Pi GPIO3
static const int      WAKE_PIN        = 15;       // ESP32 GPIO15 tied to Pi GPIO3 (wake)
static const uint32_t I2C_HZ          = 100000;   // 100 kHz = safest
static const uint32_t BOOT_TIMEOUT_MS = 45000;    // Pi boot/ACK window
static const uint32_t PROC_TIMEOUT_MS = 30000;    // payload ready window
static const uint16_t CHUNK_BYTES     = 120;      // robust vs Wire buffers
// ===================================================

// Make a client with the above config
PiI2CMaster pi(PI_ADDR, SDA_PIN, SCL_PIN, WAKE_PIN,
               I2C_HZ, BOOT_TIMEOUT_MS, PROC_TIMEOUT_MS, CHUNK_BYTES);

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\nESP32 one-shot: wake Pi → I2C capture");

  // Bring up I2C
  pi.begin();

  // Full transaction: wake + capture + read + finalize
  String payload = pi.captureOnce(/*doWakeFirst=*/true);

  if (payload.startsWith("ERR_")) {
    Serial.print("Error: ");
    Serial.println(payload);
    Serial.println("Sleeping (error).");
    esp_deep_sleep_start();
  }

  Serial.println("---- Payload start ----");
  Serial.println(payload);
  Serial.println("---- Payload end ----");

  // Parse COUNT
  int cpos = payload.indexOf("COUNT,");
  int sc   = payload.indexOf(';', cpos);
  if (cpos >= 0 && sc > cpos) {
    int count = payload.substring(cpos + 6, sc).toInt();
    Serial.printf("Particles detected: %d\n", count);
  }

  Serial.println("Done.");
}

void loop() {
  // never reached
}
