/** English is the source of truth. Other locales are type-checked against these keys. */
export const en = {
  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.workspace": "Workspace",
  "nav.classes": "Classes",
  "nav.glossary": "Glossary",
  "nav.settings": "Settings",
  "nav.builder": "Builder",
  "nav.starterKitGuide": "Starter Kit Guide",
  "nav.helpTitle": "Stuck on a term?",
  "nav.helpBody": "Open the glossary for plain-language definitions.",

  // Header
  "header.yourProgress": "Your Progress",
  "header.levels": "{done}/{total} levels",
  "header.dayStreak": "day streak",
  "header.achievements": "achievements",
  "header.search": "Search",

  // Command palette
  "palette.placeholder": "Jump to a level or page…",
  "palette.noResults": "No results",
  "palette.certificate": "Certificate",

  // Level navigation
  "levelNav.prev": "Prev",
  "levelNav.next": "Next",
  "levelNav.count": "Level {n} of {total}",

  // Account menu
  "account.signOut": "Sign out",
  "account.settings": "Settings",
  "account.viewCertificate": "View your certificate",

  // Common
  "common.cancel": "Cancel",
  "common.save": "Save changes",
  "common.saving": "Saving…",

  // Settings — page
  "settings.title": "Settings",
  "settings.subtitle": "Manage your profile and preferences.",

  // Settings — profile
  "settings.profile.title": "Profile",
  "settings.profile.desc": "Your name and avatar across the app.",
  "settings.profile.name": "Display name",
  "settings.profile.email": "Email",
  "settings.profile.emailHint": "Your email can't be changed.",
  "settings.profile.avatarHint": "Click your avatar to choose an image. Saving avatars is coming soon.",

  // Settings — preferences
  "settings.prefs.title": "Preferences",
  "settings.prefs.desc": "Theme and language.",
  "settings.prefs.theme": "Theme",
  "settings.prefs.themeLight": "Light",
  "settings.prefs.themeDark": "Dark",
  "settings.prefs.themeSystem": "System",
  "settings.prefs.language": "Language",

  // Settings — security
  "settings.security.title": "Security",
  "settings.security.desc": "Change your password.",
  "settings.security.current": "Current password",
  "settings.security.new": "New password",
  "settings.security.update": "Update password",
  "settings.security.updated": "Password updated",

  // Settings — danger zone
  "settings.danger.title": "Danger zone",
  "settings.danger.resetTitle": "Reset progress",
  "settings.danger.resetDesc": "Clear all completed levels, streak, and achievements.",
  "settings.danger.resetBtn": "Reset progress",
  "settings.danger.resetConfirmTitle": "Reset all your progress?",
  "settings.danger.resetConfirmDesc": "This clears your completed levels, streak, and achievements. This can't be undone.",
  "settings.danger.deleteTitle": "Delete account",
  "settings.danger.deleteDesc": "Permanently delete your account and all of your data.",
  "settings.danger.deleteBtn": "Delete account",
  "settings.danger.deleteConfirmTitle": "Delete your account?",
  "settings.danger.deleteConfirmDesc": "This permanently deletes your account, progress, projects, and classes. This can't be undone.",

  // Onboarding
  "onboarding.title": "Welcome to ESPHome Learn 👋",
  "onboarding.subtitle":
    "You'll learn to build real smart devices across 22 guided levels. Here's the path:",
  "onboarding.s1Title": "Understand visually",
  "onboarding.s1Desc": "Drag-and-drop flows show how smart devices work — no code to start.",
  "onboarding.s2Title": "Reveal the code",
  "onboarding.s2Desc": "See the real ESPHome YAML each block maps to.",
  "onboarding.s3Title": "Build it yourself",
  "onboarding.s3Desc": "Write complete configs, then debug and connect to Home Assistant.",
  "onboarding.s4Title": "Export to ESPHome",
  "onboarding.s4Desc": "Take your config to real hardware when you're ready.",
  "onboarding.explore": "Explore on my own",
  "onboarding.start": "Start level 1",

  // Certificate
  "certificate.lockedTitle": "Your certificate is almost ready",
  "certificate.lockedDesc": "Complete all {total} levels to unlock it — you're at {completed}/{total}.",
  "certificate.keepLearning": "Keep learning",
  "certificate.back": "Back to app",
  "certificate.print": "Print / Save PDF",
  "certificate.heading": "Certificate of Completion",
  "certificate.certifies": "This certifies that",
  "certificate.body":
    "has successfully completed all {total} levels of the ESPHome Learn curriculum — from visual flows and YAML through real-hardware workflows and advanced topics.",
  "certificate.date": "Date",
  "certificate.org": "ESPHome Learn",
  "certificate.kit": "Starter Kit",

  // Not found
  "notFound.title": "Node not found",
  "notFound.desc": "Looks like this connection is broken. The page you're looking for doesn't exist or was moved.",
  "notFound.goBack": "Go back",
  "notFound.home": "Home page",

  // Toasts
  "settings.toast.profileSaved": "Profile updated",
  "settings.toast.progressReset": "Progress reset",
  "settings.toast.accountDeleted": "Your account has been deleted",
} as const

export type TranslationKey = keyof typeof en
