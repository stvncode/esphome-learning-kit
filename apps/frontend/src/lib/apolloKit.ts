import type { LucideIcon } from "lucide-react"
import {
  CircleDot,
  Activity,
  Thermometer,
  Sparkles,
  Volume2,
  Zap,
  Power,
  Clock,
} from "lucide-react"

// Apollo Starter Kit Pin Mapping (ESP32-C6)
export const APOLLO_PINS = {
  // I2C Bus
  SCL: "GPIO0",
  SDA: "GPIO1",
  
  // Digital I/O
  BUTTON: "GPIO6",
  PIR: "GPIO2",
  
  // LED/Buzzer
  RGB_LED_DATA: "GPIO7",
  BUZZER: "GPIO14",
  
  // Additional (from pin mapping)
  IO3: "GPIO3",
  IO18: "GPIO18",
} as const

// Board configuration
export const APOLLO_BOARD = {
  name: "esp32-c6-devkitc-1",
  platform: "esp32",
  variant: "esp32c6",
  framework: "arduino",
} as const

// Component category types
export type ComponentCategory = "input" | "sensor" | "trigger" | "action" | "timing" | "output"

// Apollo component interface
export interface ApolloComponent {
  id: string
  type: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  category: ComponentCategory
  pins?: Record<string, string>
  pin?: string
  defaultData: Record<string, unknown>
  yamlPlatform: string
  yamlSection: string
}

// Apollo Kit Components
export const apolloComponents: ApolloComponent[] = [
  // === INPUTS ===
  {
    id: "button",
    type: "button",
    label: "Button",
    description: "Physical push button",
    icon: CircleDot,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    category: "input",
    pin: APOLLO_PINS.BUTTON,
    defaultData: { 
      label: "Button", 
      pin: APOLLO_PINS.BUTTON,
      isActive: false,
    },
    yamlPlatform: "gpio",
    yamlSection: "binary_sensor",
  },
  {
    id: "pir",
    type: "pir",
    label: "PIR Motion",
    description: "Passive infrared motion sensor",
    icon: Activity,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    category: "input",
    pin: APOLLO_PINS.PIR,
    defaultData: { 
      label: "Motion Sensor", 
      pin: APOLLO_PINS.PIR,
      isActive: false,
      motionDetected: false,
    },
    yamlPlatform: "gpio",
    yamlSection: "binary_sensor",
  },

  // === SENSORS ===
  {
    id: "aht20",
    type: "aht20",
    label: "AHT20",
    description: "Temperature & humidity sensor (I2C)",
    icon: Thermometer,
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
    category: "sensor",
    pins: {
      scl: APOLLO_PINS.SCL,
      sda: APOLLO_PINS.SDA,
    },
    defaultData: { 
      label: "Temp/Humidity", 
      sclPin: APOLLO_PINS.SCL,
      sdaPin: APOLLO_PINS.SDA,
      temperature: 22.5,
      humidity: 45,
      isActive: false,
    },
    yamlPlatform: "aht10", // AHT20 uses aht10 platform in ESPHome
    yamlSection: "sensor",
  },

  // === TRIGGERS ===
  {
    id: "on_press",
    type: "trigger",
    label: "When Pressed",
    description: "Triggered when button is pressed",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    category: "trigger",
    defaultData: { 
      label: "When Pressed", 
      triggerType: "on_press",
      isActive: false,
    },
    yamlPlatform: "automation",
    yamlSection: "on_press",
  },
  {
    id: "on_release",
    type: "trigger",
    label: "When Released",
    description: "Triggered when button is released",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    category: "trigger",
    defaultData: { 
      label: "When Released", 
      triggerType: "on_release",
      isActive: false,
    },
    yamlPlatform: "automation",
    yamlSection: "on_release",
  },
  {
    id: "on_state",
    type: "trigger",
    label: "On State Change",
    description: "Triggered when sensor state changes",
    icon: Zap,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    category: "trigger",
    defaultData: { 
      label: "On State", 
      triggerType: "on_state",
      isActive: false,
    },
    yamlPlatform: "automation",
    yamlSection: "on_state",
  },

  // === ACTIONS ===
  {
    id: "turn_on",
    type: "action",
    label: "Turn On",
    description: "Turn on a light or switch",
    icon: Power,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    category: "action",
    defaultData: { 
      label: "Turn On", 
      actionType: "turn_on",
      isActive: false,
    },
    yamlPlatform: "action",
    yamlSection: "light.turn_on",
  },
  {
    id: "turn_off",
    type: "action",
    label: "Turn Off",
    description: "Turn off a light or switch",
    icon: Power,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    category: "action",
    defaultData: { 
      label: "Turn Off", 
      actionType: "turn_off",
      isActive: false,
    },
    yamlPlatform: "action",
    yamlSection: "light.turn_off",
  },
  {
    id: "toggle",
    type: "action",
    label: "Toggle",
    description: "Toggle a light or switch",
    icon: Power,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    category: "action",
    defaultData: { 
      label: "Toggle", 
      actionType: "toggle",
      isActive: false,
    },
    yamlPlatform: "action",
    yamlSection: "light.toggle",
  },

  // === TIMING ===
  {
    id: "delay_1s",
    type: "delay",
    label: "Wait 1s",
    description: "Wait for 1 second",
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    category: "timing",
    defaultData: { 
      label: "Wait", 
      duration: "1s",
      isActive: false,
    },
    yamlPlatform: "delay",
    yamlSection: "delay",
  },
  {
    id: "delay_5s",
    type: "delay",
    label: "Wait 5s",
    description: "Wait for 5 seconds",
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    category: "timing",
    defaultData: { 
      label: "Wait", 
      duration: "5s",
      isActive: false,
    },
    yamlPlatform: "delay",
    yamlSection: "delay",
  },

  // === OUTPUTS ===
  {
    id: "rgbled",
    type: "rgbled",
    label: "RGB LEDs",
    description: "Addressable RGB LED strip",
    icon: Sparkles,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    category: "output",
    pin: APOLLO_PINS.RGB_LED_DATA,
    defaultData: { 
      label: "RGB LEDs", 
      pin: APOLLO_PINS.RGB_LED_DATA,
      ledCount: 8,
      isOn: false,
      color: { r: 255, g: 100, b: 50 },
      brightness: 100,
    },
    yamlPlatform: "neopixelbus",
    yamlSection: "light",
  },
  {
    id: "buzzer",
    type: "buzzer",
    label: "Buzzer",
    description: "PWM buzzer for audio feedback",
    icon: Volume2,
    color: "text-rose-400",
    bgColor: "bg-rose-500/20",
    category: "output",
    pin: APOLLO_PINS.BUZZER,
    defaultData: { 
      label: "Buzzer", 
      pin: APOLLO_PINS.BUZZER,
      isOn: false,
      frequency: 1000,
    },
    yamlPlatform: "ledc",
    yamlSection: "output",
  },
]

// Get components by category
export function getComponentsByCategory(category: ComponentCategory): ApolloComponent[] {
  return apolloComponents.filter(c => c.category === category)
}

// Get component by ID
export function getComponentById(id: string): ApolloComponent | undefined {
  return apolloComponents.find(c => c.id === id)
}

// Category labels for UI
export const categoryLabels: Record<ComponentCategory, string> = {
  input: "Inputs",
  sensor: "Sensors",
  trigger: "Triggers",
  action: "Actions",
  timing: "Timing",
  output: "Outputs",
}

// Category order for display
export const categoryOrder: ComponentCategory[] = [
  "input",
  "sensor", 
  "trigger",
  "action",
  "timing",
  "output",
]
