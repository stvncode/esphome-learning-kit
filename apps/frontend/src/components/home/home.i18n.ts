import { createScope } from "@/lib/i18n/scope"

const en = {
  "hero.badge": "ESP32 Starter Kit Guide",
  "hero.title1": "Learn ESPHome,",
  "hero.title2": "visually.",
  "hero.subtitle":
    "Go from zero to real hardware. Start with drag-and-drop flows, discover the YAML behind them, then write complete configs to flash with ESPHome.",
  "hero.continue": "Continue learning",
  "hero.start": "Start Learning",
  "hero.certificate": "View your certificate",
  "hero.workspace": "Open Workspace",
  "hero.upNext": "Up next — Level {id}: {title}",
  "hero.statPhases": "Phases",
  "hero.statLevels": "Levels",
  "hero.statProgress": "Your Progress",
  "hero.livePreview": "Live preview — ESP32-C6 Starter Kit",
  "hero.previewCaption": "Visual flows translate directly to ESPHome YAML — no guesswork.",

  "path.title": "Learning Path",
  "path.subtitle": "Six phases, each building on the last.",
  "path.badge": "6 Phases · 22 Levels",
  "path.progress": "Progress",
  "path.continue": "Continue",
  "path.start": "Start Phase",
} as const

const fr: Record<keyof typeof en, string> = {
  "hero.badge": "Guide du kit de démarrage ESP32",
  "hero.title1": "Apprenez ESPHome,",
  "hero.title2": "visuellement.",
  "hero.subtitle":
    "Passez de zéro au matériel réel. Commencez par des flux en glisser-déposer, découvrez le YAML qui se cache derrière, puis rédigez des configurations complètes à flasher avec ESPHome.",
  "hero.continue": "Continuer l'apprentissage",
  "hero.start": "Commencer",
  "hero.certificate": "Voir votre certificat",
  "hero.workspace": "Ouvrir l'atelier",
  "hero.upNext": "À suivre — Niveau {id} : {title}",
  "hero.statPhases": "Phases",
  "hero.statLevels": "Niveaux",
  "hero.statProgress": "Votre progression",
  "hero.livePreview": "Aperçu en direct — Kit de démarrage ESP32-C6",
  "hero.previewCaption": "Les flux visuels se traduisent directement en YAML ESPHome — sans approximation.",

  "path.title": "Parcours d'apprentissage",
  "path.subtitle": "Six phases, chacune s'appuyant sur la précédente.",
  "path.badge": "6 phases · 22 niveaux",
  "path.progress": "Progression",
  "path.continue": "Continuer",
  "path.start": "Démarrer la phase",
}

const nl: Record<keyof typeof en, string> = {
  "hero.badge": "ESP32 Starterkit-gids",
  "hero.title1": "Leer ESPHome,",
  "hero.title2": "visueel.",
  "hero.subtitle":
    "Ga van nul naar echte hardware. Begin met sleep-en-neerzetflows, ontdek de YAML erachter en schrijf daarna volledige configuraties om met ESPHome te flashen.",
  "hero.continue": "Verder leren",
  "hero.start": "Begin met leren",
  "hero.certificate": "Bekijk je certificaat",
  "hero.workspace": "Werkruimte openen",
  "hero.upNext": "Hierna — Niveau {id}: {title}",
  "hero.statPhases": "Fasen",
  "hero.statLevels": "Niveaus",
  "hero.statProgress": "Jouw voortgang",
  "hero.livePreview": "Live voorbeeld — ESP32-C6 Starterkit",
  "hero.previewCaption": "Visuele flows vertalen rechtstreeks naar ESPHome-YAML — geen giswerk.",

  "path.title": "Leertraject",
  "path.subtitle": "Zes fasen, elk voortbouwend op de vorige.",
  "path.badge": "6 fasen · 22 niveaus",
  "path.progress": "Voortgang",
  "path.continue": "Doorgaan",
  "path.start": "Fase starten",
}

export const useHomeT = createScope(en, { fr, nl })
