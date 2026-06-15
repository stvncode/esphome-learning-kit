import { useDeleteConfirm } from "@/components/DeleteConfirmModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteAccount, uploadAvatar } from "@/lib/api"
import { authClient, signOut, useSession } from "@/lib/auth-client"
import { LOCALES, LOCALE_LABELS, useTranslation } from "@/lib/i18n"
import { useProgressStore } from "@/stores/progressStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, Settings as SettingsIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function Settings() {
  const { t, locale, setLocale } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearProgress = useProgressStore((s) => s.clear)
  const resetProgress = useProgressStore((s) => s.resetProgress)
  const { confirm, dialog } = useDeleteConfirm()

  const [name, setName] = useState(session?.user?.name ?? "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const profileMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim()
      // Upload the picked file first (if any), then persist name + image in one
      // updateUser call so the session reflects both immediately.
      const image = avatarFile ? (await uploadAvatar(avatarFile)).url : undefined
      const { error } = await authClient.updateUser({
        ...(trimmed && trimmed !== session?.user?.name ? { name: trimmed } : {}),
        ...(image ? { image } : {}),
      })
      if (error) throw new Error(error.message ?? "Failed to update profile")
    },
    onSuccess: () => {
      setAvatarFile(null)
      toast.success(t("settings.toast.profileSaved"))
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("Must be at least 8 characters long")
      const { error } = await authClient.changePassword({ currentPassword, newPassword })
      if (error) throw new Error(error.message ?? "Failed to update password")
    },
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      toast.success(t("settings.security.updated"))
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await signOut().catch(() => {})
      clearProgress()
      queryClient.clear()
      toast.success(t("settings.toast.accountDeleted"))
      navigate("/")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const nameChanged = !!name.trim() && name.trim() !== session?.user?.name

  const initial = (session?.user?.name?.[0] ?? "?").toUpperCase()
  const avatarSrc = avatarPreview ?? session?.user?.image ?? undefined

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.profile.title")}</CardTitle>
          <CardDescription>{t("settings.profile.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-semibold text-white"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5" />
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            <p className="text-xs text-muted-foreground">{t("settings.profile.avatarHint")}</p>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">{t("settings.profile.name")}</FieldLabel>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{t("settings.profile.email")}</FieldLabel>
              <Input id="email" value={session?.user?.email ?? ""} readOnly disabled />
              <p className="text-xs text-muted-foreground">{t("settings.profile.emailHint")}</p>
            </Field>
          </FieldGroup>
          <Button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending || (!nameChanged && !avatarFile)}
          >
            {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.prefs.title")}</CardTitle>
          <CardDescription>{t("settings.prefs.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <FieldLabel>{t("settings.prefs.theme")}</FieldLabel>
            <Select value={theme ?? "system"} onValueChange={setTheme}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("settings.prefs.themeLight")}</SelectItem>
                <SelectItem value="dark">{t("settings.prefs.themeDark")}</SelectItem>
                <SelectItem value="system">{t("settings.prefs.themeSystem")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4">
            <FieldLabel>{t("settings.prefs.language")}</FieldLabel>
            <Select value={locale} onValueChange={(v) => setLocale(v as typeof locale)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.security.title")}</CardTitle>
          <CardDescription>{t("settings.security.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current">{t("settings.security.current")}</FieldLabel>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new">{t("settings.security.new")}</FieldLabel>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => passwordMutation.mutate()}
              disabled={!currentPassword || !newPassword || passwordMutation.isPending}
            >
              {passwordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("settings.security.update")}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-base text-red-400">{t("settings.danger.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("settings.danger.resetTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.danger.resetDesc")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                confirm({
                  title: t("settings.danger.resetConfirmTitle"),
                  description: t("settings.danger.resetConfirmDesc"),
                  confirmLabel: t("settings.danger.resetBtn"),
                  onConfirm: () => {
                    resetProgress()
                    toast.success(t("settings.toast.progressReset"))
                  },
                })
              }
            >
              {t("settings.danger.resetBtn")}
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <div>
              <p className="text-sm font-medium">{t("settings.danger.deleteTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.danger.deleteDesc")}</p>
            </div>
            <Button
              variant="destructive"
              onClick={() =>
                confirm({
                  title: t("settings.danger.deleteConfirmTitle"),
                  description: t("settings.danger.deleteConfirmDesc"),
                  confirmLabel: t("settings.danger.deleteBtn"),
                  onConfirm: () => deleteMutation.mutateAsync(),
                })
              }
            >
              {t("settings.danger.deleteBtn")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {dialog}
    </div>
  )
}
