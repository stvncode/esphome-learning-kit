import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TabsContent } from "@/components/ui/tabs"
import type { Node } from "@xyflow/react"
import { GitBranch, Plus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ACTION_OPTIONS, TRIGGER_OPTIONS } from "./constants"
import type { Automation } from "./types"
import { useWorkspaceT } from "./workspace.i18n"

interface AutomationsTabProps {
  nodes: Node[]
  outputNodes: Node[]
  automations: Automation[]
  onAddAutomation: (data: Omit<Automation, "id">) => void
  onRemoveAutomation: (id: string) => void
}

const EMPTY_FORM = { sourceNodeId: "", trigger: "", action: "", targetNodeId: "" }

export function AutomationsTab({
  nodes,
  outputNodes,
  automations,
  onAddAutomation,
  onRemoveAutomation,
}: AutomationsTabProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const t = useWorkspaceT()

  function handleSubmit() {
    if (!form.sourceNodeId || !form.trigger || !form.action || !form.targetNodeId) {
      toast.error(t("auto.fillAll"))
      return
    }
    onAddAutomation(form)
    setForm(EMPTY_FORM)
  }

  return (
    <TabsContent value="automations" className="flex flex-col gap-3">
      <Card className="shrink-0 border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t("auto.add")}</CardTitle>
          <CardDescription className="text-xs">{t("auto.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("auto.source")}</p>
            <Select
              value={form.sourceNodeId}
              onValueChange={(v) => setForm((p) => ({ ...p, sourceNodeId: v }))}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder={t("auto.selectNode")} />
              </SelectTrigger>
              <SelectContent>
                {nodes.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {t("auto.noNodes")}
                  </SelectItem>
                ) : (
                  nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {String(n.data.label ?? n.id)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("auto.trigger")}</p>
            <Select
              value={form.trigger}
              onValueChange={(v) => setForm((p) => ({ ...p, trigger: v }))}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder={t("auto.selectTrigger")} />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("auto.action")}</p>
            <Select
              value={form.action}
              onValueChange={(v) => setForm((p) => ({ ...p, action: v }))}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder={t("auto.selectAction")} />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("auto.target")}</p>
            <Select
              value={form.targetNodeId}
              onValueChange={(v) => setForm((p) => ({ ...p, targetNodeId: v }))}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder={t("auto.selectOutput")} />
              </SelectTrigger>
              <SelectContent>
                {outputNodes.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {t("auto.noOutputs")}
                  </SelectItem>
                ) : (
                  outputNodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {String(n.data.label ?? n.id)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="w-full" onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            {t("auto.add")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {automations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 py-8 text-center">
            <GitBranch className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">{t("auto.empty")}</p>
          </div>
        ) : (
          automations.map((auto) => {
            const srcNode = nodes.find((n) => n.id === auto.sourceNodeId)
            const tgtNode = nodes.find((n) => n.id === auto.targetNodeId)
            const triggerLabel =
              TRIGGER_OPTIONS.find((o) => o.value === auto.trigger)?.label ?? auto.trigger
            const actionLabel =
              ACTION_OPTIONS.find((o) => o.value === auto.action)?.label ?? auto.action

            return (
              <div
                key={auto.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-card/50 p-3"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-xs font-medium">
                    {srcNode ? String(srcNode.data.label) : "?"} →{" "}
                    {tgtNode ? String(tgtNode.data.label) : "?"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {triggerLabel} → {actionLabel}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 p-0"
                  onClick={() => onRemoveAutomation(auto.id)}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            )
          })
        )}
      </div>
    </TabsContent>
  )
}
