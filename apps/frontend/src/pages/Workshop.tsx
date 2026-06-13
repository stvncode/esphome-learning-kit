import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Cpu,
  Download,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Eye,
  Code2,
  SplitSquareHorizontal,
  FileCode,
  Keyboard,
  Play,
  Square,
  Plus,
  ArrowLeft,
  Package,
  Clock as ClockIcon,
  Activity,
  Thermometer,
  CircleDot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FlowCanvas } from "@/components/flow"
import {
  apolloComponents,
  categoryLabels,
  type ApolloComponent,
  type ComponentCategory
} from "@/lib/apolloKit"
import { 
  flowToYaml, 
  yamlToFlow, 
  validateYaml,
  getNodeIdForLine,
  getLinesForNode,
  type YamlLineMapping 
} from "@/lib/yamlSync"
import type { Node, Edge } from "@xyflow/react"
import { toast } from "sonner"

// View mode type
type ViewMode = "visual" | "split" | "yaml"

interface SavedProject {
  name: string
  description?: string
  kitType: "starter" | "custom"
  tags?: string[]
  nodes: Node[]
  edges: Edge[]
  yaml: string
  createdAt: string
  lastModified: string
  thumbnail?: string
}

// Project templates
interface ProjectTemplate {
  id: string
  name: string
  description: string
  kitType: "starter" | "custom"
  nodes: Node[]
  edges: Edge[]
  icon: React.ElementType
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "motion-light",
    name: "Motion-Activated Light",
    description: "Turn on RGB LEDs when motion is detected",
    kitType: "starter",
    icon: Activity,
    nodes: [
      {
        id: "pir-1",
        type: "pir",
        position: { x: 100, y: 100 },
        data: { label: "Motion Sensor", pin: "GPIO2", isActive: false, motionDetected: false },
      },
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 300, y: 100 },
        data: { label: "When Motion", triggerType: "on_press", isActive: false },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 500, y: 100 },
        data: { label: "Turn On", actionType: "turn_on", isActive: false },
      },
      {
        id: "rgbled-1",
        type: "rgbled",
        position: { x: 700, y: 100 },
        data: {
          label: "RGB LEDs",
          pin: "GPIO7",
          ledCount: 8,
          isOn: false,
          color: { r: 255, g: 100, b: 50 },
          brightness: 100,
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "pir-1", target: "trigger-1" },
      { id: "e2-3", source: "trigger-1", target: "action-1" },
      { id: "e3-4", source: "action-1", target: "rgbled-1" },
    ],
  },
  {
    id: "temp-monitor",
    name: "Temperature Monitor",
    description: "Monitor temperature and control buzzer alerts",
    kitType: "starter",
    icon: Thermometer,
    nodes: [
      {
        id: "aht20-1",
        type: "aht20",
        position: { x: 100, y: 100 },
        data: {
          label: "Temp/Humidity",
          sclPin: "GPIO0",
          sdaPin: "GPIO1",
          temperature: 22.5,
          humidity: 45,
          isActive: false,
        },
      },
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 300, y: 100 },
        data: { label: "On State", triggerType: "on_state", isActive: false },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 500, y: 100 },
        data: { label: "Turn On", actionType: "turn_on", isActive: false },
      },
      {
        id: "buzzer-1",
        type: "buzzer",
        position: { x: 700, y: 100 },
        data: { label: "Buzzer", pin: "GPIO14", isOn: false, frequency: 1000 },
      },
    ],
    edges: [
      { id: "e1-2", source: "aht20-1", target: "trigger-1" },
      { id: "e2-3", source: "trigger-1", target: "action-1" },
      { id: "e3-4", source: "action-1", target: "buzzer-1" },
    ],
  },
  {
    id: "button-toggle",
    name: "Button Toggle Light",
    description: "Simple button to toggle RGB LEDs on and off",
    kitType: "starter",
    icon: CircleDot,
    nodes: [
      {
        id: "button-1",
        type: "button",
        position: { x: 100, y: 100 },
        data: { label: "Button", pin: "GPIO6", isActive: false },
      },
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 300, y: 100 },
        data: { label: "When Pressed", triggerType: "on_press", isActive: false },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 500, y: 100 },
        data: { label: "Toggle", actionType: "toggle", isActive: false },
      },
      {
        id: "rgbled-1",
        type: "rgbled",
        position: { x: 700, y: 100 },
        data: {
          label: "RGB LEDs",
          pin: "GPIO7",
          ledCount: 8,
          isOn: false,
          color: { r: 100, g: 150, b: 255 },
          brightness: 100,
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "button-1", target: "trigger-1" },
      { id: "e2-3", source: "trigger-1", target: "action-1" },
      { id: "e3-4", source: "action-1", target: "rgbled-1" },
    ],
  },
  {
    id: "delayed-alarm",
    name: "Delayed Alarm",
    description: "Button triggers buzzer after a delay",
    kitType: "starter",
    icon: ClockIcon,
    nodes: [
      {
        id: "button-1",
        type: "button",
        position: { x: 100, y: 100 },
        data: { label: "Alarm Button", pin: "GPIO6", isActive: false },
      },
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 300, y: 100 },
        data: { label: "When Pressed", triggerType: "on_press", isActive: false },
      },
      {
        id: "delay-1",
        type: "delay",
        position: { x: 500, y: 100 },
        data: { label: "Wait 5s", duration: "5s", isActive: false },
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 700, y: 100 },
        data: { label: "Turn On", actionType: "turn_on", isActive: false },
      },
      {
        id: "buzzer-1",
        type: "buzzer",
        position: { x: 900, y: 100 },
        data: { label: "Alarm", pin: "GPIO14", isOn: false, frequency: 2000 },
      },
    ],
    edges: [
      { id: "e1-2", source: "button-1", target: "trigger-1" },
      { id: "e2-3", source: "trigger-1", target: "delay-1" },
      { id: "e3-4", source: "delay-1", target: "action-1" },
      { id: "e4-5", source: "action-1", target: "buzzer-1" },
    ],
  },
]

export function Workshop() {
  // State
  const [showProjectSelection, setShowProjectSelection] = useState(true)
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [yaml, setYaml] = useState("")
  const [yamlMappings, setYamlMappings] = useState<YamlLineMapping[]>([])
  const [projectName, setProjectName] = useState("My Apollo Project")
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("workshop-view-mode")
    return (saved as ViewMode) || "split"
  })
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    const saved = localStorage.getItem("workshop-projects")
    return saved ? JSON.parse(saved) : []
  })
  const [copied, setCopied] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredYamlLines, setHoveredYamlLines] = useState<{ start: number; end: number } | null>(null)
  const [yamlError, setYamlError] = useState<string | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [paletteTab, setPaletteTab] = useState<"components" | "actions">("components")
  const [componentSearch, setComponentSearch] = useState("")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectTags, setNewProjectTags] = useState<string[]>([])
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [projectFilter, setProjectFilter] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [edgePopoverOpen, setEdgePopoverOpen] = useState(false)
  const [connectionSource, setConnectionSource] = useState<{ nodeId: string; handleId?: string } | null>(null)
  const [automationMenuOpen, setAutomationMenuOpen] = useState(false)

  // Sync source tracking to prevent circular updates
  const syncSourceRef = useRef<"flow" | "yaml" | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate thumbnail from nodes
  const generateThumbnail = useCallback((projectNodes: Node[]): string => {
    // Create a simple visual representation
    const types = projectNodes.map(n => n.type).filter((t): t is string => !!t)
    const typeCount = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return JSON.stringify(typeCount)
  }, [])

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("workshop-view-mode", viewMode)
  }, [viewMode])

  // Track unsaved changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges, yaml])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentProject || !hasUnsavedChanges || !nodes.length) return

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        const thumbnail = generateThumbnail(nodes)
        const project: SavedProject = {
          name: projectName,
          description: currentProject?.description,
          kitType: currentProject?.kitType || "starter",
          tags: currentProject?.tags || [],
          nodes,
          edges,
          yaml,
          createdAt: currentProject?.createdAt || new Date().toISOString(),
          lastModified: new Date().toISOString(),
          thumbnail,
        }
        const updated = [...savedProjects.filter((p) => p.name !== projectName), project]
        setSavedProjects(updated)
        setCurrentProject(project)
        setHasUnsavedChanges(false)
        localStorage.setItem("workshop-projects", JSON.stringify(updated))
        toast.info("Auto-saved", { duration: 1000 })
      }
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [currentProject, hasUnsavedChanges, nodes, edges, yaml, projectName, savedProjects, generateThumbnail])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            saveProject()
            break
          case "e":
            e.preventDefault()
            downloadYaml()
            break
          case "r":
            e.preventDefault()
            if (!isSimulating && nodes.length > 0) {
              runSimulation()
            } else if (isSimulating) {
              stopSimulation()
            }
            break
          case "1":
            e.preventDefault()
            setViewMode("visual")
            break
          case "2":
            e.preventDefault()
            setViewMode("split")
            break
          case "3":
            e.preventDefault()
            setViewMode("yaml")
            break
          case "/":
            e.preventDefault()
            setShowKeyboardShortcuts(true)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSimulating, nodes.length])

  // Sync flow → yaml (debounced)
  const syncFlowToYaml = useCallback(() => {
    if (syncSourceRef.current === "yaml") {
      syncSourceRef.current = null
      return
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncSourceRef.current = "flow"
      const { yaml: newYaml, mappings } = flowToYaml(nodes, edges, projectName)
      setYaml(newYaml)
      setYamlMappings(mappings)
      setYamlError(null)
    }, 300)
  }, [nodes, edges, projectName])

  // Sync yaml → flow (debounced)
  const syncYamlToFlow = useCallback((newYaml: string) => {
    if (syncSourceRef.current === "flow") {
      syncSourceRef.current = null
      return
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      const validation = validateYaml(newYaml)
      if (!validation.valid) {
        setYamlError(validation.errors.join(", "))
        return
      }

      syncSourceRef.current = "yaml"
      const { nodes: newNodes, edges: newEdges, error } = yamlToFlow(newYaml)
      
      if (error) {
        setYamlError(error)
        return
      }

      setNodes(newNodes)
      setEdges(newEdges)
      setYamlError(null)
    }, 500)
  }, [])

  // Trigger flow → yaml sync when flow changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      syncFlowToYaml()
    }
  }, [nodes, edges, syncFlowToYaml])

  // Handle YAML text changes
  const handleYamlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newYaml = e.target.value
    setYaml(newYaml)
    syncYamlToFlow(newYaml)
  }, [syncYamlToFlow])

  // Add node from component palette
  const handleAddNode = useCallback((component: ApolloComponent) => {
    const newNode: Node = {
      id: `${component.id}-${Date.now()}`,
      type: component.type,
      position: {
        x: 150 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      },
      data: { ...component.defaultData },
    }
    setNodes((prev) => [...prev, newNode])
  }, [])

  // Handle edge click
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setEdgePopoverOpen(true)
  }, [])

  // Add automation to edge
  const addAutomationToEdge = useCallback((automationType: string) => {
    if (!selectedEdge) return

    const updatedEdges = edges.map(e => {
      if (e.id === selectedEdge.id) {
        return {
          ...e,
          data: {
            ...e.data,
            automation: automationType
          },
          label: automationType,
          animated: true,
        }
      }
      return e
    })

    setEdges(updatedEdges)
    setEdgePopoverOpen(false)
    toast.success(`Added ${automationType} automation`)
  }, [selectedEdge, edges])

  // Handle connection start (when clicking a handle)
  const handleConnectStart = useCallback((_event: MouseEvent | TouchEvent, params: { nodeId: string | null; handleId: string | null; handleType: string | null }) => {
    if (params.nodeId) {
      setConnectionSource({ nodeId: params.nodeId, handleId: params.handleId || undefined })
      setAutomationMenuOpen(true)
    }
  }, [])

  // Create automation node and connect it
  const createAutomationNode = useCallback((automationData: { id: string; type: string; label: string }) => {
    if (!connectionSource) return

    const sourceNode = nodes.find(n => n.id === connectionSource.nodeId)
    if (!sourceNode) return

    // Create the automation node
    const newNode: Node = {
      id: `${automationData.id}-${Date.now()}`,
      type: automationData.type,
      position: {
        x: sourceNode.position.x + 250,
        y: sourceNode.position.y,
      },
      data: { label: automationData.label, isActive: false },
    }

    // Create the connection edge
    const newEdge: Edge = {
      id: `${connectionSource.nodeId}-${newNode.id}`,
      source: connectionSource.nodeId,
      target: newNode.id,
      animated: true,
    }

    setNodes(prev => [...prev, newNode])
    setEdges(prev => [...prev, newEdge])
    setAutomationMenuOpen(false)
    setConnectionSource(null)

    toast.success(`Added ${automationData.label}`)
  }, [connectionSource, nodes])

  // Reset canvas
  const resetCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setYaml("")
    setYamlMappings([])
    setYamlError(null)
  }, [])

  // Copy YAML to clipboard
  const copyYaml = useCallback(() => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    toast.success("YAML copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }, [yaml])

  // Download YAML file
  const downloadYaml = useCallback(() => {
    const blob = new Blob([yaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}.yaml`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("YAML downloaded!")
  }, [yaml, projectName])

  // Save project
  const saveProject = useCallback(() => {
    const thumbnail = generateThumbnail(nodes)
    const project: SavedProject = {
      name: projectName,
      description: currentProject?.description,
      kitType: currentProject?.kitType || "starter",
      tags: currentProject?.tags || [],
      nodes,
      edges,
      yaml,
      createdAt: currentProject?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      thumbnail,
    }
    const updated = [...savedProjects.filter((p) => p.name !== projectName), project]
    setSavedProjects(updated)
    setCurrentProject(project)
    setHasUnsavedChanges(false)
    localStorage.setItem("workshop-projects", JSON.stringify(updated))
    toast.success("Project saved!")
  }, [projectName, nodes, edges, yaml, savedProjects, currentProject, generateThumbnail])

  // Create new project
  const createNewProject = useCallback((name: string, kitType: "starter" | "custom", description?: string, tags?: string[]) => {
    const project: SavedProject = {
      name,
      description,
      kitType,
      tags: tags || [],
      nodes: [],
      edges: [],
      yaml: "",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    setCurrentProject(project)
    setProjectName(name)
    setNodes([])
    setEdges([])
    setYaml("")
    setShowProjectSelection(false)
    setShowNewProjectDialog(false)
    setNewProjectName("")
    setNewProjectDescription("")
    setNewProjectTags([])
    toast.success(`Created "${name}"`)
  }, [])

  // Create project from template
  const createFromTemplate = useCallback((template: ProjectTemplate) => {
    const project: SavedProject = {
      name: template.name,
      description: template.description,
      kitType: template.kitType,
      nodes: template.nodes,
      edges: template.edges,
      yaml: "",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    setCurrentProject(project)
    setProjectName(template.name)
    setNodes(template.nodes)
    setEdges(template.edges)
    setShowProjectSelection(false)
    toast.success(`Created "${template.name}" from template`)
  }, [])

  // Duplicate project
  const duplicateProject = useCallback((project: SavedProject) => {
    const duplicatedName = `${project.name} (Copy)`
    const duplicated: SavedProject = {
      ...project,
      name: duplicatedName,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    const updated = [...savedProjects, duplicated]
    setSavedProjects(updated)
    localStorage.setItem("workshop-projects", JSON.stringify(updated))
    toast.success(`Duplicated "${project.name}"`)
  }, [savedProjects])

  // Load project
  const loadProject = useCallback((project: SavedProject) => {
    setCurrentProject(project)
    setProjectName(project.name)
    setNodes(project.nodes)
    setEdges(project.edges)
    setYaml(project.yaml)
    setLoadDialogOpen(false)
    setShowProjectSelection(false)
    toast.success(`Loaded "${project.name}"`)
  }, [])

  // Return to project selection
  const returnToProjectSelection = useCallback(() => {
    setShowProjectSelection(true)
    setCurrentProject(null)
  }, [])

  // Delete project
  const deleteProject = useCallback((name: string) => {
    const updated = savedProjects.filter((p) => p.name !== name)
    setSavedProjects(updated)
    localStorage.setItem("workshop-projects", JSON.stringify(updated))
    toast.success("Project deleted")
  }, [savedProjects])

  // Get connected nodes from a source node
  const getConnectedNodes = useCallback(
    (sourceId: string): string[] => {
      return edges
        .filter((e) => e.source === sourceId)
        .map((e) => e.target)
    },
    [edges]
  )

  // Run simulation - traverse the flow graph
  const runSimulation = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("Add some nodes first!")
      return
    }

    // Find input nodes (button, pir, aht20)
    const inputNodes = nodes.filter((n) =>
      n.type === "button" || n.type === "pir" || n.type === "aht20"
    )
    if (inputNodes.length === 0) {
      toast.error("Add an input node (Button, PIR, AHT20) to start simulation")
      return
    }

    setIsSimulating(true)
    toast.info("Starting simulation...")

    // Build a traversal queue
    const visited = new Set<string>()
    const queue: { nodeId: string; delay: number }[] = []

    // Start from input nodes
    inputNodes.forEach((node) => {
      queue.push({ nodeId: node.id, delay: 0 })
    })

    // Process queue and schedule activations
    let currentDelay = 0
    const processQueue = () => {
      const toProcess = [...queue]
      queue.length = 0

      toProcess.forEach(({ nodeId, delay }) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)

        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return

        // Calculate delay for this node
        let nodeDelay = delay
        if (node.type === "delay") {
          const duration = String(node.data.duration || "1s")
          const seconds = parseInt(duration) || 1
          nodeDelay += seconds * 1000
        }

        // Schedule this node's activation
        setTimeout(() => {
          // Update node data for visual feedback
          setNodes((prev) =>
            prev.map((n) => {
              if (n.id === nodeId) {
                if (n.type === "button" || n.type === "pir")
                  return { ...n, data: { ...n.data, isActive: true } }
                if (n.type === "aht20")
                  return { ...n, data: { ...n.data, isActive: true } }
                if (n.type === "light" || n.type === "rgbled")
                  return { ...n, data: { ...n.data, isOn: true } }
                if (n.type === "buzzer")
                  return { ...n, data: { ...n.data, isOn: true } }
                if (n.type === "delay" || n.type === "trigger" || n.type === "action")
                  return { ...n, data: { ...n.data, isActive: true } }
              }
              return n
            })
          )

          // Queue connected nodes
          const connected = getConnectedNodes(nodeId)
          connected.forEach((targetId) => {
            if (!visited.has(targetId)) {
              queue.push({ nodeId: targetId, delay: 0 })
            }
          })

          // Process next batch
          if (queue.length > 0) {
            processQueue()
          }
        }, delay + currentDelay)

        currentDelay += 500 // Stagger activations
      })
    }

    processQueue()

    // End simulation after all nodes processed
    const totalDuration = nodes.length * 600 + 1000
    setTimeout(() => {
      setIsSimulating(false)
      // Reset node states
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isActive: false,
            isOn: n.type === "light" || n.type === "rgbled" || n.type === "buzzer" ? false : n.data.isOn,
          },
        }))
      )
      toast.success("Simulation complete!")
    }, totalDuration)
  }, [nodes, getConnectedNodes])

  const stopSimulation = useCallback(() => {
    setIsSimulating(false)
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isActive: false,
          isOn: n.type === "light" || n.type === "rgbled" || n.type === "buzzer" ? false : n.data.isOn,
        },
      }))
    )
    toast.info("Simulation stopped")
  }, [])

  // Export project as JSON
  const exportProjectAsJson = useCallback(() => {
    if (!currentProject) return

    const exportData = {
      ...currentProject,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    }
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Project exported as JSON!")
  }, [currentProject, projectName])

  // Export as template
  const exportAsTemplate = useCallback(() => {
    if (!currentProject) return

    const template = {
      name: projectName,
      description: currentProject.description || "",
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      type: "template"
    }
    const jsonString = JSON.stringify(template, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-template.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exported as template!")
  }, [currentProject, projectName, nodes, edges])

  // Import project from JSON
  const importProjectFromJson = useCallback(() => {
    try {
      const imported = JSON.parse(importJson) as SavedProject
      if (!imported.name || !imported.nodes || !imported.edges) {
        toast.error("Invalid project format")
        return
      }

      // Create a new project with imported data
      const newName = `${imported.name} (Imported)`
      const project: SavedProject = {
        ...imported,
        name: newName,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }

      const updated = [...savedProjects, project]
      setSavedProjects(updated)
      localStorage.setItem("workshop-projects", JSON.stringify(updated))
      setShowImportDialog(false)
      setImportJson("")
      toast.success(`Imported "${newName}"`)
    } catch (error) {
      toast.error("Failed to parse JSON")
    }
  }, [importJson, savedProjects])


  // Add tag to project
  const addTag = useCallback((tag: string) => {
    if (!tag.trim()) return
    setNewProjectTags(prev => [...new Set([...prev, tag.trim()])])
  }, [])

  const removeTag = useCallback((tag: string) => {
    setNewProjectTags(prev => prev.filter(t => t !== tag))
  }, [])

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    savedProjects.forEach(p => {
      p.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [savedProjects])

  // Handle YAML line hover for highlighting
  const handleYamlLineHover = useCallback((lineNumber: number | null) => {
    if (lineNumber !== null) {
      const nodeId = getNodeIdForLine(lineNumber, yamlMappings)
      setHoveredNodeId(nodeId)
      if (nodeId) {
        const lines = getLinesForNode(nodeId, yamlMappings)
        setHoveredYamlLines(lines)
      }
    } else {
      setHoveredNodeId(null)
      setHoveredYamlLines(null)
    }
  }, [yamlMappings])

  // Group components by category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<ComponentCategory, ApolloComponent[]> = {
      input: [],
      sensor: [],
      trigger: [],
      action: [],
      timing: [],
      output: [],
    }
    apolloComponents.forEach((comp) => {
      grouped[comp.category].push(comp)
    })
    return grouped
  }, [])

  // Separate components into hardware and actions
  const hardwareComponents = useMemo(() => {
    return ["input", "sensor", "output"] as ComponentCategory[]
  }, [])

  const actionComponents = useMemo(() => {
    return ["trigger", "action", "timing"] as ComponentCategory[]
  }, [])

  // Filter components by search
  const filteredComponentsByCategory = useMemo(() => {
    if (!componentSearch.trim()) return componentsByCategory

    const searchLower = componentSearch.toLowerCase()
    const filtered: Record<ComponentCategory, ApolloComponent[]> = {
      input: [],
      sensor: [],
      trigger: [],
      action: [],
      timing: [],
      output: [],
    }

    Object.entries(componentsByCategory).forEach(([category, components]) => {
      filtered[category as ComponentCategory] = components.filter((comp) =>
        comp.label.toLowerCase().includes(searchLower) ||
        comp.description.toLowerCase().includes(searchLower) ||
        (comp.pin && comp.pin.toLowerCase().includes(searchLower))
      )
    })

    return filtered
  }, [componentsByCategory, componentSearch])


  // Filter projects by search and tags
  const filteredProjects = useMemo(() => {
    let filtered = savedProjects

    // Filter by search
    if (projectFilter.trim()) {
      const searchLower = projectFilter.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        p.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return filtered.sort((a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  }, [savedProjects, projectFilter, selectedTags])

  // Display projects (limited or all)
  const displayedProjects = useMemo(() => {
    return showAllProjects ? filteredProjects : filteredProjects.slice(0, 10)
  }, [filteredProjects, showAllProjects])

  // YAML lines for rendering with hover support
  const yamlLines = useMemo(() => {
    return yaml.split("\n").map((content, index) => ({
      number: index + 1,
      content,
    }))
  }, [yaml])

  // Project Selection Screen
  if (showProjectSelection) {
    return (
      <div className="flex h-[calc(100svh-4rem)] flex-col p-6">
        <div className="mx-auto max-w-5xl w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Workshop</h1>
                  <p className="text-sm text-muted-foreground">
                    Create and manage your ESPHome projects
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportDialog(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Import Project
              </Button>
            </div>
          </div>

          {/* Create New Project */}
          <Card className="mb-6 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Project
              </CardTitle>
              <CardDescription>
                Start a new ESPHome configuration project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Quick Start Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const name = `Apollo Project ${savedProjects.length + 1}`
                    createNewProject(name, "starter")
                  }}
                  className="cursor-pointer group"
                >
                  <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Quick Start</h3>
                          <p className="text-xs text-muted-foreground">
                            Empty Apollo Starter Kit project
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Blank Canvas
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Custom Name Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewProjectDialog(true)}
                  className="cursor-pointer group"
                >
                  <Card className="h-full border-2 border-border/20 hover:border-border transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 group-hover:bg-muted transition-colors">
                          <Cpu className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Custom Name</h3>
                          <p className="text-xs text-muted-foreground">
                            Create with a custom name and description
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Apollo Kit
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Project Templates */}
          <Card className="mb-6 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Templates
              </CardTitle>
              <CardDescription>
                Start with a pre-built project template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {PROJECT_TEMPLATES.map((template) => {
                  const TemplateIcon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => createFromTemplate(template)}
                      className="cursor-pointer"
                    >
                      <Card className="border-border/50 hover:border-border transition-colors">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                              <TemplateIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Recent Projects
                </CardTitle>
              </div>
              <CardDescription>
                {savedProjects.length === 0
                  ? "No projects yet. Create one to get started!"
                  : `${filteredProjects.length} of ${savedProjects.length} project${savedProjects.length !== 1 ? "s" : ""}`}
              </CardDescription>
              {savedProjects.length > 0 && (
                <div className="space-y-3 mt-4">
                  {/* Search */}
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="h-9"
                  />
                  {/* Tag Filter */}
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedTags(prev =>
                              prev.includes(tag)
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                            )
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => setSelectedTags([])}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {savedProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No projects yet</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No projects match your filters</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {displayedProjects.map((project) => (
                      <motion.div
                        key={project.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="shrink-0 w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center border border-border/50">
                          {project.thumbnail ? (
                            <div className="text-[10px] text-center text-muted-foreground font-mono">
                              {Object.entries(JSON.parse(project.thumbnail) as Record<string, number>).slice(0, 3).map(([type, count], i) => (
                                <div key={i}>{type.slice(0, 3)}: {count}</div>
                              ))}
                            </div>
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{project.name}</h3>
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] px-1.5 py-0"
                            >
                              {project.kitType === "starter" ? "Apollo Kit" : "Custom"}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {new Date(project.lastModified).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{project.nodes.length} nodes</span>
                            <span>•</span>
                            <span>{project.edges.length} connections</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateProject(project)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProject(project.name)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                          <Button size="sm" onClick={() => loadProject(project)}>
                            Open
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredProjects.length > 10 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllProjects(!showAllProjects)}
                      >
                        {showAllProjects ? "Show Less" : `Show All (${filteredProjects.length - 10} more)`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Give your project a name and optional description
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Apollo Project"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="What does this project do?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (optional)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
                {newProjectTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newProjectTags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewProjectDialog(false)
                  setNewProjectName("")
                  setNewProjectDescription("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newProjectName.trim()) {
                    createNewProject(
                      newProjectName.trim(),
                      "starter",
                      newProjectDescription.trim() || undefined,
                      newProjectTags.length > 0 ? newProjectTags : undefined
                    )
                  } else {
                    toast.error("Please enter a project name")
                  }
                }}
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Project Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Project</DialogTitle>
              <DialogDescription>
                Paste your project JSON below to import it
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project JSON</label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='{"name": "My Project", ...}'
                  className="w-full h-64 p-3 rounded-md border border-border bg-background font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false)
                  setImportJson("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={importProjectFromJson}
                disabled={!importJson.trim()}
              >
                Import Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Main Editor View
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-[calc(100svh-4rem)] flex-col p-6">
        {/* Action Bar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={returnToProjectSelection}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to projects</TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="visual" className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Visual</span>
                </TabsTrigger>
                <TabsTrigger value="split" className="gap-2">
                  <SplitSquareHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Split</span>
                </TabsTrigger>
                <TabsTrigger value="yaml" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="hidden sm:inline">YAML</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-6 w-px bg-border" />
          </div>

          {/* Actions */}
          {isSimulating ? (
              <Button size="sm" variant="destructive" onClick={stopSimulation}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={runSimulation}
                disabled={nodes.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                Simulate
              </Button>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={resetCanvas} disabled={isSimulating}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear canvas</TooltipContent>
            </Tooltip>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Load
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Project</DialogTitle>
                  <DialogDescription>Select a saved project to load</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  {savedProjects.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No saved projects yet
                    </p>
                  ) : (
                    savedProjects.map((project) => (
                      <div
                        key={project.name}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()} •{" "}
                            {project.nodes.length} nodes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProject(project.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                          <Button size="sm" onClick={() => loadProject(project)}>
                            Load
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={saveProject}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyYaml}>
                  {copied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy YAML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadYaml}>
                  <FileCode className="mr-2 h-4 w-4" />
                  Download YAML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportProjectAsJson}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsTemplate}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Export as Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowKeyboardShortcuts(true)}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard shortcuts (⌘/)</TooltipContent>
            </Tooltip>
        </div>

        {/* Main Content: palette + (diagram | diagram+yaml) with equal split widths */}
        <div className="flex flex-1 gap-4 overflow-hidden min-w-0">
          {/* Component Palette (visible in visual and split modes) */}
          <AnimatePresence>
            {viewMode !== "yaml" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-56 shrink-0"
              >
                <Card className="h-full border-border/50 bg-card/50 flex flex-col">
                  <CardHeader className="pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Apollo Kit</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Click to add to canvas
                    </CardDescription>
                  </CardHeader>

                  {/* Search */}
                  <div className="px-6 pb-3 shrink-0">
                    <Input
                      type="text"
                      placeholder="Search components..."
                      value={componentSearch}
                      onChange={(e) => setComponentSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <Tabs
                    value={paletteTab}
                    onValueChange={(v) => setPaletteTab(v as "components" | "actions")}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <div className="px-6 pb-3 shrink-0">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="components" className="text-xs">
                          Components
                        </TabsTrigger>
                        <TabsTrigger value="actions" className="text-xs">
                          Automations
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="components" className="flex-1 overflow-y-auto m-0 px-6 pb-6">
                      <div className="space-y-4">
                        {hardwareComponents.every(
                          (cat) => filteredComponentsByCategory[cat].length === 0
                        ) && componentSearch.trim() ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No components found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          hardwareComponents.map((category) => {
                            const components = filteredComponentsByCategory[category]
                            if (components.length === 0) return null

                            return (
                            <div key={category}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {categoryLabels[category]}
                              </p>
                              <div className="space-y-1.5">
                                {components.map((comp) => {
                                  const Icon = comp.icon
                                  return (
                                    <motion.button
                                      key={comp.id}
                                      onClick={() => handleAddNode(comp)}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2 text-left transition-colors hover:border-border hover:bg-muted/40"
                                    >
                                      <div
                                        className={cn(
                                          "flex h-7 w-7 items-center justify-center rounded-md",
                                          comp.bgColor
                                        )}
                                      >
                                        <Icon className={cn("h-3.5 w-3.5", comp.color)} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium block truncate">
                                          {comp.label}
                                        </span>
                                        {comp.pin && (
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            {comp.pin}
                                          </span>
                                        )}
                                      </div>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                  )}
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="flex-1 overflow-y-auto m-0 px-6 pb-6">
                      <div className="space-y-4">
                        {actionComponents.every(
                          (cat) => filteredComponentsByCategory[cat].length === 0
                        ) && componentSearch.trim() ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No actions found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          actionComponents.map((category) => {
                            const components = filteredComponentsByCategory[category]
                            if (components.length === 0) return null

                            return (
                            <div key={category}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {categoryLabels[category]}
                              </p>
                              <div className="space-y-1.5">
                                {components.map((comp) => {
                                  const Icon = comp.icon
                                  return (
                                    <motion.button
                                      key={comp.id}
                                      onClick={() => handleAddNode(comp)}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2 text-left transition-colors hover:border-border hover:bg-muted/40"
                                    >
                                      <div
                                        className={cn(
                                          "flex h-7 w-7 items-center justify-center rounded-md",
                                          comp.bgColor
                                        )}
                                      >
                                        <Icon className={cn("h-3.5 w-3.5", comp.color)} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium block truncate">
                                          {comp.label}
                                        </span>
                                        {comp.pin && (
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            {comp.pin}
                                          </span>
                                        )}
                                      </div>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                  )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wrapper: diagram (wider) and YAML (narrower) with gap between */}
          <div className="flex flex-1 min-w-0 gap-4">
          {/* Flow Canvas (visible in visual and split modes) */}
          <AnimatePresence>
            {viewMode !== "yaml" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "min-w-0",
                  viewMode === "split" ? "flex-[2] shrink-0" : "flex-1"
                )}
              >
                <FlowCanvas
                  nodes={nodes.map(n => ({
                    ...n,
                    selected: n.id === hoveredNodeId,
                  }))}
                  edges={edges}
                  onNodesChange={setNodes}
                  onEdgesChange={setEdges}
                  onConnectStart={handleConnectStart}
                  onEdgeClick={handleEdgeClick}
                  disableDefaultConnection={true}
                  showControls
                  showMinimap={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* YAML Editor (visible in yaml and split modes) */}
          <AnimatePresence>
            {viewMode !== "visual" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "min-w-0",
                  viewMode === "yaml" ? "flex-1" : "flex-[1] shrink-0"
                )}
              >
                <Card className="h-full border-border/50 bg-card/50 flex flex-col">
                  <CardHeader className="pb-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">ESPHome YAML</CardTitle>
                      </div>
                      {yamlError && (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{yamlError}</span>
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {viewMode === "split" 
                        ? "Hover over lines to highlight nodes" 
                        : "Edit configuration directly"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                      <div className="relative font-mono text-sm">
                        {viewMode === "split" ? (
                          // Interactive line-by-line view for split mode
                          <div className="p-4">
                            {yamlLines.map((line) => {
                              const isHighlighted = hoveredYamlLines 
                                && line.number >= hoveredYamlLines.start 
                                && line.number <= hoveredYamlLines.end

                              return (
                                <div
                                  key={line.number}
                                  onMouseEnter={() => handleYamlLineHover(line.number)}
                                  onMouseLeave={() => handleYamlLineHover(null)}
                                  className={cn(
                                    "flex h-6 leading-6 rounded transition-colors cursor-default",
                                    isHighlighted && "bg-indigo-500/10"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mr-4 inline-block w-8 text-right select-none transition-colors",
                                      isHighlighted ? "text-indigo-400" : "text-muted-foreground/50"
                                    )}
                                  >
                                    {line.number}
                                  </span>
                                  <span
                                    className={cn(
                                      "transition-colors whitespace-pre",
                                      isHighlighted ? "text-foreground" : "text-muted-foreground"
                                    )}
                                  >
                                    {line.content}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          // Editable textarea for yaml-only mode (scrolls horizontally for long lines)
                          <div className="h-full min-h-[500px] overflow-auto">
                            <textarea
                              value={yaml}
                              onChange={handleYamlChange}
                              wrap="off"
                              className={cn(
                                "block w-full min-w-full min-h-[500px] p-4 bg-transparent resize-none focus:outline-none",
                                "text-sm font-mono leading-6 whitespace-pre overflow-x-auto",
                                yamlError && "text-red-300"
                              )}
                              spellCheck={false}
                              placeholder="# Start by adding components, or paste existing YAML here..."
                              style={{ minWidth: "max(100%, 80ch)" }}
                            />
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Workshop</Badge>
                <Badge variant="outline" className="text-xs">Apollo Kit</Badge>
              </div>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-6 w-48 border-none bg-transparent p-0 text-sm font-semibold focus-visible:ring-0"
              />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{nodes.length} nodes</span>
              <span>{edges.length} connections</span>
              <span>{yaml.split("\n").length} lines</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">⌘S</kbd>
            <span>Save</span>
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">⌘1/2/3</kbd>
            <span>Switch view</span>
          </div>
        </div>

        {/* Edge Automation Dialog */}
        <Dialog open={edgePopoverOpen} onOpenChange={setEdgePopoverOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Automation</DialogTitle>
              <DialogDescription>
                Choose an automation type for this connection
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {[
                { id: "on_press", label: "When Pressed", description: "Trigger when button is pressed" },
                { id: "on_release", label: "When Released", description: "Trigger when button is released" },
                { id: "on_state", label: "On State Change", description: "Trigger when state changes" },
                { id: "on_value", label: "On Value", description: "Trigger on specific value" },
                { id: "then", label: "Then (Action)", description: "Execute an action" },
                { id: "delay", label: "Delay", description: "Wait before next action" },
              ].map((automation) => (
                <Button
                  key={automation.id}
                  variant="outline"
                  className="h-auto justify-start text-left p-4"
                  onClick={() => addAutomationToEdge(automation.label)}
                >
                  <div>
                    <div className="font-medium">{automation.label}</div>
                    <div className="text-xs text-muted-foreground">{automation.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Connection Automation Menu */}
        <Dialog open={automationMenuOpen} onOpenChange={setAutomationMenuOpen}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-base">Add Automation</DialogTitle>
            </DialogHeader>
            <div className="grid gap-1.5 py-2">
              {[
                { id: "trigger", type: "trigger", label: "When Pressed" },
                { id: "trigger", type: "trigger", label: "When Released" },
                { id: "trigger", type: "trigger", label: "On State Change" },
                { id: "action", type: "action", label: "Turn On" },
                { id: "action", type: "action", label: "Turn Off" },
                { id: "action", type: "action", label: "Toggle" },
                { id: "delay", type: "delay", label: "Wait 1s" },
                { id: "delay", type: "delay", label: "Wait 5s" },
              ].map((automation, idx) => (
                <Button
                  key={`${automation.id}-${idx}`}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-8"
                  onClick={() => createAutomationNode({ id: automation.id, type: automation.type, label: automation.label })}
                >
                  <span className="text-sm">{automation.label}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>Quick actions for the Workshop</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {[
                { keys: "⌘ + S", action: "Save project" },
                { keys: "⌘ + E", action: "Export YAML" },
                { keys: "⌘ + R", action: "Run simulation" },
                { keys: "⌘ + 1", action: "Visual mode" },
                { keys: "⌘ + 2", action: "Split mode" },
                { keys: "⌘ + 3", action: "YAML mode" },
                { keys: "⌘ + /", action: "Show shortcuts" },
                { keys: "Delete", action: "Delete selected node" },
              ].map(({ keys, action }) => (
                <div key={keys} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{action}</span>
                  <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{keys}</kbd>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
