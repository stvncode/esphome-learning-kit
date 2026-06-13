import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"

export interface DeleteConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
}

interface DeleteConfirmModalProps extends DeleteConfirmOptions {
  open: boolean
  pending?: boolean
  onCancel: () => void
}

/** A destructive confirmation dialog built from the shadcn Dialog primitive. */
export function DeleteConfirmModal({
  open,
  pending,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm()} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Ergonomic replacement for native `confirm()`. Call `confirm({...})` from a
 * handler, and render the returned `dialog` once in the component.
 */
export function useDeleteConfirm() {
  const [options, setOptions] = useState<DeleteConfirmOptions | null>(null)
  const [pending, setPending] = useState(false)

  const confirm = useCallback((opts: DeleteConfirmOptions) => setOptions(opts), [])

  const handleConfirm = useCallback(async () => {
    if (!options) return
    try {
      setPending(true)
      await options.onConfirm()
      setOptions(null)
    } finally {
      setPending(false)
    }
  }, [options])

  const dialog = (
    <DeleteConfirmModal
      open={!!options}
      pending={pending}
      title={options?.title ?? ""}
      description={options?.description}
      confirmLabel={options?.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={() => setOptions(null)}
    />
  )

  return { confirm, dialog }
}
