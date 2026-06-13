import { parse } from "yaml"
import type { Node, Edge } from "@xyflow/react"
import { APOLLO_BOARD, APOLLO_PINS, apolloComponents } from "./apolloKit"

// ============================================================================
// TYPES
// ============================================================================

export interface ESPHomeConfig {
  esphome?: {
    name?: string
    friendly_name?: string
  }
  esp32?: {
    board?: string
    framework?: {
      type?: string
    }
  }
  wifi?: {
    ssid?: string
    password?: string
  }
  api?: Record<string, unknown>
  logger?: Record<string, unknown>
  i2c?: {
    sda?: string
    scl?: string
    scan?: boolean
  }
  binary_sensor?: Array<{
    platform: string
    pin?: string
    name?: string
    id?: string
    on_press?: unknown[]
    on_release?: unknown[]
    on_state?: unknown[]
  }>
  sensor?: Array<{
    platform: string
    temperature?: { name?: string; id?: string }
    humidity?: { name?: string; id?: string }
    update_interval?: string
  }>
  light?: Array<{
    platform: string
    name?: string
    id?: string
    variant?: string
    pin?: string
    num_leds?: number
    type?: string
    output?: string
    effects?: unknown[]
  }>
  output?: Array<{
    platform: string
    pin?: string
    id?: string
  }>
  [key: string]: unknown
}

export interface YamlLineMapping {
  lineStart: number
  lineEnd: number
  nodeId: string
  section: string
}

// ============================================================================
// FLOW → YAML (Generation)
// ============================================================================

export function flowToYaml(
  nodes: Node[],
  edges: Edge[],
  projectName: string = "apollo-kit"
): { yaml: string; mappings: YamlLineMapping[] } {
  const mappings: YamlLineMapping[] = []
  let currentLine = 1

  // Categorize nodes
  const buttonNodes = nodes.filter(n => n.type === "button")
  const pirNodes = nodes.filter(n => n.type === "pir")
  const aht20Nodes = nodes.filter(n => n.type === "aht20")
  const rgbledNodes = nodes.filter(n => n.type === "rgbled")
  const buzzerNodes = nodes.filter(n => n.type === "buzzer")
  const lightNodes = nodes.filter(n => n.type === "light")

  // Build YAML sections
  const sections: string[] = []

  // === ESPHome section ===
  const esphomeSection = `esphome:
  name: ${projectName.toLowerCase().replace(/\s+/g, "-")}
  friendly_name: ${projectName}

esp32:
  board: ${APOLLO_BOARD.name}
  framework:
    type: ${APOLLO_BOARD.framework}

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:

logger:
`
  sections.push(esphomeSection)
  currentLine += esphomeSection.split("\n").length

  // === I2C section (if AHT20 sensors present) ===
  if (aht20Nodes.length > 0) {
    const i2cSection = `i2c:
  sda: ${APOLLO_PINS.SDA}
  scl: ${APOLLO_PINS.SCL}
  scan: true
`
    sections.push(i2cSection)
    currentLine += i2cSection.split("\n").length
  }

  // === Binary Sensors (buttons, PIR) ===
  const binarySensorNodes = [...buttonNodes, ...pirNodes]
  if (binarySensorNodes.length > 0) {
    let binarySection = "binary_sensor:\n"
    currentLine++

    binarySensorNodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeId = `${node.type}_${index}`
      const pin = node.data.pin || (node.type === "pir" ? APOLLO_PINS.PIR : APOLLO_PINS.BUTTON)
      
      let nodeYaml = `  - platform: gpio
    pin: ${pin}
    name: "${node.data.label}"
    id: ${nodeId}
`
      
      // Find connected triggers and build automation
      const connectedTriggers = getConnectedNodes(node.id, edges, nodes, "trigger")
      connectedTriggers.forEach(trigger => {
        const triggerType = trigger.data.triggerType || "on_press"
        nodeYaml += `    ${triggerType}:\n`
        nodeYaml += `      then:\n`
        
        // Find actions connected to this trigger
        const actionsChain = buildActionChain(trigger.id, edges, nodes)
        actionsChain.forEach(actionYaml => {
          nodeYaml += actionYaml
        })
      })

      binarySection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "binary_sensor",
      })
    })

    sections.push(binarySection)
  }

  // === Sensors (AHT20) ===
  if (aht20Nodes.length > 0) {
    let sensorSection = "sensor:\n"
    currentLine++

    aht20Nodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeYaml = `  - platform: aht10
    temperature:
      name: "${node.data.label} Temperature"
      id: temp_${index}
    humidity:
      name: "${node.data.label} Humidity"
      id: humidity_${index}
    update_interval: 60s
`
      sensorSection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "sensor",
      })
    })

    sections.push(sensorSection)
  }

  // === Lights (RGB LEDs, basic lights) ===
  const allLightNodes = [...rgbledNodes, ...lightNodes]
  if (allLightNodes.length > 0) {
    let lightSection = "light:\n"
    currentLine++

    rgbledNodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeYaml = `  - platform: neopixelbus
    name: "${node.data.label}"
    id: rgbled_${index}
    variant: WS2812
    pin: ${node.data.pin || APOLLO_PINS.RGB_LED_DATA}
    num_leds: ${node.data.ledCount || 8}
    type: GRB
    effects:
      - random:
      - pulse:
      - strobe:
`
      lightSection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "light",
      })
    })

    lightNodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeYaml = `  - platform: binary
    name: "${node.data.label}"
    id: light_${index}
    output: output_light_${index}
`
      lightSection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "light",
      })
    })

    sections.push(lightSection)
  }

  // === Outputs (Buzzer, light outputs) ===
  const needsOutput = buzzerNodes.length > 0 || lightNodes.length > 0
  if (needsOutput) {
    let outputSection = "output:\n"
    currentLine++

    buzzerNodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeYaml = `  - platform: ledc
    pin: ${node.data.pin || APOLLO_PINS.BUZZER}
    id: buzzer_${index}
`
      outputSection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "output",
      })
    })

    lightNodes.forEach((node, index) => {
      const nodeStart = currentLine
      const nodeYaml = `  - platform: gpio
    pin: ${node.data.pin || "GPIO5"}
    id: output_light_${index}
`
      outputSection += nodeYaml
      currentLine += nodeYaml.split("\n").length - 1

      mappings.push({
        lineStart: nodeStart,
        lineEnd: currentLine - 1,
        nodeId: node.id,
        section: "output",
      })
    })

    sections.push(outputSection)
  }

  // === RTTTL (for buzzer tones) ===
  if (buzzerNodes.length > 0) {
    const rtttlSection = `rtttl:
  output: buzzer_0
`
    sections.push(rtttlSection)
  }

  return {
    yaml: sections.join("\n"),
    mappings,
  }
}

// ============================================================================
// YAML → FLOW (Parsing)
// ============================================================================

export function yamlToFlow(
  yamlContent: string
): { nodes: Node[]; edges: Edge[]; error?: string } {
  try {
    const config = parse(yamlContent) as ESPHomeConfig
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    let xOffset = 100
    let yOffset = 100
    const xGap = 200
    const yGap = 150

    // Parse binary_sensor (buttons, PIR, etc.)
    if (config.binary_sensor) {
      config.binary_sensor.forEach((sensor, index) => {
        const nodeType = sensor.pin?.includes("2") ? "pir" : "button"
        const component = apolloComponents.find(c => c.type === nodeType)
        
        const node: Node = {
          id: `${nodeType}-${Date.now()}-${index}`,
          type: nodeType,
          position: { x: xOffset, y: yOffset + index * yGap },
          data: {
            ...component?.defaultData,
            label: sensor.name || component?.label || "Sensor",
            pin: sensor.pin,
          },
        }
        nodes.push(node)

        // Parse automations (on_press, on_release, etc.)
        const automations = [
          { trigger: sensor.on_press, type: "on_press" },
          { trigger: sensor.on_release, type: "on_release" },
          { trigger: sensor.on_state, type: "on_state" },
        ]

        automations.forEach((auto, autoIndex) => {
          if (auto.trigger && Array.isArray(auto.trigger)) {
            // Create trigger node
            const triggerId = `trigger-${Date.now()}-${index}-${autoIndex}`
            const triggerNode: Node = {
              id: triggerId,
              type: "trigger",
              position: { x: xOffset + xGap, y: yOffset + index * yGap + autoIndex * 80 },
              data: {
                label: auto.type === "on_press" ? "When Pressed" : 
                       auto.type === "on_release" ? "When Released" : "On State",
                triggerType: auto.type,
                isActive: false,
              },
            }
            nodes.push(triggerNode)

            // Connect sensor to trigger
            edges.push({
              id: `edge-${node.id}-${triggerId}`,
              source: node.id,
              target: triggerId,
              animated: true,
            })

            // Parse actions in the automation
            parseAutomationActions(auto.trigger, triggerId, nodes, edges, xOffset + xGap * 2, yOffset + index * yGap + autoIndex * 80)
          }
        })
      })
      yOffset += config.binary_sensor.length * yGap + 50
    }

    // Parse sensors (AHT20, etc.)
    if (config.sensor) {
      config.sensor.forEach((sensor, index) => {
        if (sensor.platform === "aht10") {
          const node: Node = {
            id: `aht20-${Date.now()}-${index}`,
            type: "aht20",
            position: { x: xOffset, y: yOffset + index * yGap },
            data: {
              label: sensor.temperature?.name?.replace(" Temperature", "") || "Temp/Humidity",
              sclPin: config.i2c?.scl || APOLLO_PINS.SCL,
              sdaPin: config.i2c?.sda || APOLLO_PINS.SDA,
              temperature: 22.5,
              humidity: 45,
              isActive: false,
            },
          }
          nodes.push(node)
        }
      })
      yOffset += (config.sensor?.length || 0) * yGap + 50
    }

    // Parse lights
    if (config.light) {
      config.light.forEach((light, index) => {
        if (light.platform === "neopixelbus") {
          const node: Node = {
            id: `rgbled-${Date.now()}-${index}`,
            type: "rgbled",
            position: { x: xOffset + xGap * 3, y: 100 + index * yGap },
            data: {
              label: light.name || "RGB LEDs",
              pin: light.pin || APOLLO_PINS.RGB_LED_DATA,
              ledCount: light.num_leds || 8,
              isOn: false,
              color: { r: 255, g: 100, b: 50 },
              brightness: 100,
            },
          }
          nodes.push(node)
        } else if (light.platform === "binary") {
          const node: Node = {
            id: `light-${Date.now()}-${index}`,
            type: "light",
            position: { x: xOffset + xGap * 3, y: 100 + index * yGap },
            data: {
              label: light.name || "Light",
              pin: "GPIO5",
              isOn: false,
            },
          }
          nodes.push(node)
        }
      })
    }

    // Parse outputs (buzzer)
    if (config.output) {
      config.output.forEach((output, index) => {
        if (output.platform === "ledc" && output.id?.includes("buzzer")) {
          const node: Node = {
            id: `buzzer-${Date.now()}-${index}`,
            type: "buzzer",
            position: { x: xOffset + xGap * 3, y: yOffset + index * yGap },
            data: {
              label: "Buzzer",
              pin: output.pin || APOLLO_PINS.BUZZER,
              isOn: false,
              frequency: 1000,
            },
          }
          nodes.push(node)
        }
      })
    }

    return { nodes, edges }
  } catch (error) {
    return {
      nodes: [],
      edges: [],
      error: error instanceof Error ? error.message : "Failed to parse YAML",
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getConnectedNodes(
  sourceId: string,
  edges: Edge[],
  nodes: Node[],
  targetType?: string
): Node[] {
  const connectedIds = edges
    .filter(e => e.source === sourceId)
    .map(e => e.target)
  
  return nodes.filter(n => {
    const isConnected = connectedIds.includes(n.id)
    if (targetType) {
      return isConnected && n.type === targetType
    }
    return isConnected
  })
}

function buildActionChain(
  triggerId: string,
  edges: Edge[],
  nodes: Node[]
): string[] {
  const results: string[] = []
  const visited = new Set<string>()
  
  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const connectedEdges = edges.filter(e => e.source === nodeId)
    
    for (const edge of connectedEdges) {
      const targetNode = nodes.find(n => n.id === edge.target)
      if (!targetNode) continue
      
      if (targetNode.type === "action") {
        const actionType = targetNode.data.actionType || "toggle"
        // Find what the action targets
        const actionTargets = getConnectedNodes(targetNode.id, edges, nodes)
        const targetLight = actionTargets.find(t => t.type === "light" || t.type === "rgbled")
        const targetBuzzer = actionTargets.find(t => t.type === "buzzer")
        
        if (targetLight) {
          const lightId = targetLight.type === "rgbled" ? "rgbled_0" : "light_0"
          results.push(`        - light.${actionType}: ${lightId}\n`)
        }
        if (targetBuzzer) {
          if (actionType === "turn_on") {
            results.push(`        - rtttl.play: "beep:d=4,o=5,b=100:c"\n`)
          } else {
            results.push(`        - output.turn_off: buzzer_0\n`)
          }
        }
        
        traverse(targetNode.id)
      } else if (targetNode.type === "delay") {
        const duration = targetNode.data.duration || "1s"
        results.push(`        - delay: ${duration}\n`)
        traverse(targetNode.id)
      } else if (targetNode.type === "light" || targetNode.type === "rgbled") {
        // If directly connected to a light without action, default to toggle
        const lightId = targetNode.type === "rgbled" ? "rgbled_0" : "light_0"
        results.push(`        - light.toggle: ${lightId}\n`)
      } else if (targetNode.type === "buzzer") {
        results.push(`        - rtttl.play: "beep:d=4,o=5,b=100:c"\n`)
      }
    }
  }
  
  traverse(triggerId)
  return results
}

function parseAutomationActions(
  actions: unknown[],
  parentId: string,
  nodes: Node[],
  edges: Edge[],
  startX: number,
  startY: number
) {
  let currentX = startX
  let lastNodeId = parentId

  actions.forEach((action, index) => {
    if (typeof action === "object" && action !== null) {
      const actionObj = action as Record<string, unknown>
      
      // Check for then block
      if ("then" in actionObj && Array.isArray(actionObj.then)) {
        parseAutomationActions(actionObj.then, lastNodeId, nodes, edges, currentX, startY)
        return
      }

      // Check for delay
      if ("delay" in actionObj) {
        const delayId = `delay-${Date.now()}-${index}`
        const delayNode: Node = {
          id: delayId,
          type: "delay",
          position: { x: currentX, y: startY },
          data: {
            label: "Wait",
            duration: String(actionObj.delay),
            isActive: false,
          },
        }
        nodes.push(delayNode)
        edges.push({
          id: `edge-${lastNodeId}-${delayId}`,
          source: lastNodeId,
          target: delayId,
          animated: true,
        })
        lastNodeId = delayId
        currentX += 180
        return
      }

      // Check for light actions
      const lightActions = ["light.turn_on", "light.turn_off", "light.toggle"]
      for (const lightAction of lightActions) {
        if (lightAction in actionObj) {
          const actionType = lightAction.split(".")[1]
          const actionId = `action-${Date.now()}-${index}`
          const actionNode: Node = {
            id: actionId,
            type: "action",
            position: { x: currentX, y: startY },
            data: {
              label: actionType === "turn_on" ? "Turn On" : 
                     actionType === "turn_off" ? "Turn Off" : "Toggle",
              actionType,
              isActive: false,
            },
          }
          nodes.push(actionNode)
          edges.push({
            id: `edge-${lastNodeId}-${actionId}`,
            source: lastNodeId,
            target: actionId,
            animated: true,
          })
          lastNodeId = actionId
          currentX += 180
          return
        }
      }
    }
  })
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateYaml(yamlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    const config = parse(yamlContent) as ESPHomeConfig
    
    // Check required sections
    if (!config.esphome?.name) {
      errors.push("Missing esphome.name")
    }
    
    // Validate pins
    if (config.binary_sensor) {
      config.binary_sensor.forEach((sensor, i) => {
        if (!sensor.platform) {
          errors.push(`binary_sensor[${i}]: Missing platform`)
        }
        if (sensor.platform === "gpio" && !sensor.pin) {
          errors.push(`binary_sensor[${i}]: GPIO platform requires pin`)
        }
      })
    }
    
    if (config.light) {
      config.light.forEach((light, i) => {
        if (!light.platform) {
          errors.push(`light[${i}]: Missing platform`)
        }
        if (light.platform === "neopixelbus" && !light.pin) {
          errors.push(`light[${i}]: NeoPixel requires pin`)
        }
      })
    }
    
    return { valid: errors.length === 0, errors }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Invalid YAML syntax"],
    }
  }
}

// ============================================================================
// LINE MAPPING UTILITIES
// ============================================================================

export function getNodeIdForLine(
  lineNumber: number,
  mappings: YamlLineMapping[]
): string | null {
  const mapping = mappings.find(
    m => lineNumber >= m.lineStart && lineNumber <= m.lineEnd
  )
  return mapping?.nodeId ?? null
}

export function getLinesForNode(
  nodeId: string,
  mappings: YamlLineMapping[]
): { start: number; end: number } | null {
  const mapping = mappings.find(m => m.nodeId === nodeId)
  if (mapping) {
    return { start: mapping.lineStart, end: mapping.lineEnd }
  }
  return null
}
