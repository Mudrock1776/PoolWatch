#include "esp32_I2C.h"

// Configure your pins & Pi address here
PiI2CMaster pi(0x13, 22, 23, 100000);

void setup() {
  Serial.begin(115200);
  delay(300);

  Serial.println("\nESP32 one-shot I2C master");
  pi.begin();

  String payload = pi.captureAndRead();
  Serial.print("Payload: ");
  Serial.println(payload);

  // Parse COUNT field
  int cpos = payload.indexOf("COUNT,");
  int sc = payload.indexOf(';', cpos);

  if (cpos >= 0 && sc > cpos) {
    int count = payload.substring(cpos + 6, sc).toInt();
    Serial.printf("Particles detected: %d\n", count);
  }

  Serial.println("Done");
}

void loop() {
  // Never runs
}
