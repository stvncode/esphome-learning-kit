export interface GlossaryEntry {
  /** Term label (kept technical / language-neutral). */
  term: string
  /** Key into the glossary i18n dictionary for the definition. */
  defKey: string
}

/** ESPHome / IoT terms. Definitions are translated via glossary.i18n.ts. */
export const GLOSSARY: GlossaryEntry[] = [
  { term: "ESPHome", defKey: "def.esphome" },
  { term: "ESP32 / ESP32-C6", defKey: "def.esp32" },
  { term: "Board", defKey: "def.board" },
  { term: "Firmware", defKey: "def.firmware" },
  { term: "Flashing", defKey: "def.flashing" },
  { term: "GPIO", defKey: "def.gpio" },
  { term: "YAML", defKey: "def.yaml" },
  { term: "Component", defKey: "def.component" },
  { term: "binary_sensor", defKey: "def.binarySensor" },
  { term: "sensor", defKey: "def.sensor" },
  { term: "switch / light", defKey: "def.switchLight" },
  { term: "Automation", defKey: "def.automation" },
  { term: "Lambda", defKey: "def.lambda" },
  { term: "OTA", defKey: "def.ota" },
  { term: "API", defKey: "def.api" },
  { term: "Home Assistant", defKey: "def.homeAssistant" },
  { term: "I²C / SPI", defKey: "def.i2cSpi" },
  { term: "PWM", defKey: "def.pwm" },
  { term: "Pull-up / pull-down resistor", defKey: "def.pullResistor" },
  { term: "WiFi credentials", defKey: "def.wifiCreds" },
]
