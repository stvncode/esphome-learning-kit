export interface GlossaryEntry {
  term: string
  definition: string
}

/** Plain-language definitions of ESPHome / IoT jargon for newcomers. */
export const GLOSSARY: GlossaryEntry[] = [
  { term: "ESPHome", definition: "A system that turns a simple YAML config into firmware for ESP32/ESP8266 chips, so you can build smart devices without writing C++." },
  { term: "ESP32 / ESP32-C6", definition: "A small, cheap microcontroller with built-in WiFi and Bluetooth — the 'brain' of your smart device." },
  { term: "Board", definition: "The specific dev board variant you're using (e.g. esp32-c6-devkitc-1). It tells ESPHome which chip and pin layout you have." },
  { term: "Firmware", definition: "The compiled program that runs directly on the chip. ESPHome builds it from your YAML." },
  { term: "Flashing", definition: "Writing firmware onto the device — done by the real ESPHome tool over USB the first time, then wirelessly after." },
  { term: "GPIO", definition: "General-Purpose Input/Output — a numbered pin on the board you wire components to (e.g. GPIO5). Some are input-only." },
  { term: "YAML", definition: "The human-friendly text format ESPHome configs are written in. Indentation matters; tabs are not allowed." },
  { term: "Component", definition: "A reusable building block in ESPHome (a sensor, light, switch, etc.) that you declare in YAML." },
  { term: "binary_sensor", definition: "A component for on/off inputs like a button or motion sensor — it reports true or false." },
  { term: "sensor", definition: "A component that reports a numeric value, like temperature or humidity." },
  { term: "switch / light", definition: "Output components you can turn on and off (a relay, an LED, an RGB strip)." },
  { term: "Automation", definition: "A rule that reacts to something (a trigger) by doing an action — e.g. 'when the button is pressed, turn on the light'." },
  { term: "Lambda", definition: "A snippet of C++ you can embed in YAML for custom logic ESPHome doesn't cover out of the box." },
  { term: "OTA", definition: "Over-the-Air updates — pushing new firmware to a device over WiFi instead of a USB cable." },
  { term: "API", definition: "The native ESPHome connection that lets Home Assistant discover and control the device on your local network." },
  { term: "Home Assistant", definition: "A popular open-source smart-home hub. ESPHome devices show up there automatically as entities you can control and automate." },
  { term: "I²C / SPI", definition: "Two common wiring protocols for connecting chips like sensors and displays using just a few shared pins." },
  { term: "PWM", definition: "Pulse-Width Modulation — rapidly switching a pin on/off to fake an analog value, used for LED brightness or motor speed." },
  { term: "Pull-up / pull-down resistor", definition: "A way to give an input pin a stable default value (high or low) so it doesn't 'float' and read randomly." },
  { term: "WiFi credentials", definition: "The network name (SSID) and password your device uses to join your WiFi so it can be reached and updated." },
]
