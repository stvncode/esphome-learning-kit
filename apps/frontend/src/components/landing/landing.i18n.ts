import { createScope } from "@/lib/i18n/scope"

const en = {
  "header.features": "Features",
  "header.builder": "Builder",
  "header.curriculum": "Curriculum",
  "header.signIn": "Sign In",
  "header.getStarted": "Get Started",

  "hero.badge": "ESP32-C6 Starter Kit",
  "hero.title1": "Build smart devices.",
  "hero.title2": "Without the guesswork.",
  "hero.subtitle":
    "Learn ESPHome through 22 guided levels. Start by dragging visual flows, watch the YAML generate live, then export it to flash with ESPHome on real hardware.",
  "hero.ctaPrimary": "Get started free",
  "hero.ctaSecondary": "Sign in",
  "hero.statLevels": "Guided levels",
  "hero.statPhases": "Phases",
  "hero.statWorkspace": "Builder + YAML editor",
  "hero.sensorSub": "Temperature · Humidity",
  "hero.chipReady": "Ready for ESPHome",

  "features.eyebrow": "Why ESPHome Learn",
  "features.title": "Everything you need, in one place",
  "features.visualTitle": "Visual Builder",
  "features.visualDesc":
    "Drag components onto the canvas, connect them with flows. No code needed to start — just intuition.",
  "features.yamlTitle": "Live YAML",
  "features.yamlDesc":
    "Every node and connection you create instantly generates valid ESPHome YAML. Watch it build as you design.",
  "features.hwTitle": "Real Hardware",
  "features.hwDesc":
    "Export your config and flash it with ESPHome — your device shows up in Home Assistant. From learning to production in minutes.",

  "how.eyebrow": "The path",
  "how.title": "From zero to deployed — step by step",
  "how.s1Title": "Understand visually",
  "how.s1Desc": "Learn how smart devices work using drag-and-drop blocks. No prior knowledge required.",
  "how.s2Title": "Reveal the code",
  "how.s2Desc": "See how every visual block maps to real ESPHome YAML. Bridge the gap between concept and code.",
  "how.s3Title": "Export & deploy",
  "how.s3Desc":
    "Export your config and open it in ESPHome to flash your ESP32. Your device shows up in Home Assistant, ready to automate.",

  "builder.eyebrow": "Builder",
  "builder.title": "Visual flows. Real YAML. One workspace.",
  "builder.subtitle":
    "Connect nodes visually and watch valid ESPHome configuration generate in real time. Switch to YAML view anytime to see the code behind your design.",
  "builder.components": "Components",
  "builder.selectedNode": "Selected Node",
  "builder.flow": "Flow",
  "builder.liveYaml": "Live YAML",
  "builder.tabProperties": "Properties",
  "builder.tabLogs": "Logs",
  "builder.callout1Title": "Drag & drop nodes",
  "builder.callout1Desc": "Components, triggers, actions — drag them onto the canvas and wire them up.",
  "builder.callout2Title": "Instant YAML output",
  "builder.callout2Desc": "Every connection you make generates valid ESPHome YAML in real time.",
  "builder.callout3Title": "Switch views anytime",
  "builder.callout3Desc": "Toggle between Builder and YAML views without losing your work.",

  "curriculum.eyebrow": "Curriculum",
  "curriculum.title": "6 phases. 22 levels.",
  "curriculum.tagline": "From first click to advanced config",
  "curriculum.levels": "{n} levels",
  "curriculum.phase1": "Visual Understanding",
  "curriculum.phase2": "Revealing the Code",
  "curriculum.phase3": "Guided Editing",
  "curriculum.phase4": "Building from Scratch",
  "curriculum.phase5": "Real Hardware",
  "curriculum.phase6": "Advanced Topics",

  "cta.title": "Ready to build your first smart device?",
  "cta.subtitle": "Start for free. No hardware required to begin learning.",
  "cta.button": "Start learning — it's free",

  "footer.tagline": "Built for makers and home automation enthusiasts.",
  "footer.signIn": "Sign In",
  "footer.signUp": "Sign Up",
} as const

const fr: Record<keyof typeof en, string> = {
  "header.features": "Fonctionnalités",
  "header.builder": "Éditeur",
  "header.curriculum": "Programme",
  "header.signIn": "Se connecter",
  "header.getStarted": "Commencer",

  "hero.badge": "Kit de démarrage ESP32-C6",
  "hero.title1": "Créez des objets connectés.",
  "hero.title2": "Sans approximation.",
  "hero.subtitle":
    "Apprenez ESPHome à travers 22 niveaux guidés. Commencez par glisser des blocs visuels, regardez le YAML se générer en direct, puis exportez-le pour le flasher avec ESPHome sur du vrai matériel.",
  "hero.ctaPrimary": "Commencer gratuitement",
  "hero.ctaSecondary": "Se connecter",
  "hero.statLevels": "Niveaux guidés",
  "hero.statPhases": "Phases",
  "hero.statWorkspace": "Éditeur visuel + YAML",
  "hero.sensorSub": "Température · Humidité",
  "hero.chipReady": "Prêt pour ESPHome",

  "features.eyebrow": "Pourquoi ESPHome Learn",
  "features.title": "Tout ce qu'il vous faut, au même endroit",
  "features.visualTitle": "Éditeur visuel",
  "features.visualDesc":
    "Glissez des composants sur le canevas et reliez-les par des flux. Aucun code requis pour démarrer — juste de l'intuition.",
  "features.yamlTitle": "YAML en direct",
  "features.yamlDesc":
    "Chaque nœud et connexion génère instantanément un YAML ESPHome valide. Regardez-le se construire au fil de votre conception.",
  "features.hwTitle": "Matériel réel",
  "features.hwDesc":
    "Exportez votre configuration et flashez-la avec ESPHome — votre appareil apparaît dans Home Assistant. De l'apprentissage à la production en quelques minutes.",

  "how.eyebrow": "Le parcours",
  "how.title": "De zéro au déploiement — étape par étape",
  "how.s1Title": "Comprendre visuellement",
  "how.s1Desc":
    "Découvrez le fonctionnement des objets connectés grâce à des blocs glisser-déposer. Aucune connaissance préalable requise.",
  "how.s2Title": "Révéler le code",
  "how.s2Desc":
    "Voyez comment chaque bloc visuel correspond à du vrai YAML ESPHome. Faites le pont entre concept et code.",
  "how.s3Title": "Exporter & déployer",
  "how.s3Desc":
    "Exportez votre configuration et ouvrez-la dans ESPHome pour flasher votre ESP32. Votre appareil apparaît dans Home Assistant, prêt à être automatisé.",

  "builder.eyebrow": "Éditeur",
  "builder.title": "Flux visuels. Vrai YAML. Un seul atelier.",
  "builder.subtitle":
    "Reliez des nœuds visuellement et regardez une configuration ESPHome valide se générer en temps réel. Passez à la vue YAML à tout moment pour voir le code derrière votre conception.",
  "builder.components": "Composants",
  "builder.selectedNode": "Nœud sélectionné",
  "builder.flow": "Flux",
  "builder.liveYaml": "YAML en direct",
  "builder.tabProperties": "Propriétés",
  "builder.tabLogs": "Journaux",
  "builder.callout1Title": "Glisser-déposer des nœuds",
  "builder.callout1Desc": "Composants, déclencheurs, actions — glissez-les sur le canevas et reliez-les.",
  "builder.callout2Title": "YAML instantané",
  "builder.callout2Desc": "Chaque connexion génère un YAML ESPHome valide en temps réel.",
  "builder.callout3Title": "Changez de vue à tout moment",
  "builder.callout3Desc": "Basculez entre les vues Éditeur et YAML sans perdre votre travail.",

  "curriculum.eyebrow": "Programme",
  "curriculum.title": "6 phases. 22 niveaux.",
  "curriculum.tagline": "Du premier clic à la configuration avancée",
  "curriculum.levels": "{n} niveaux",
  "curriculum.phase1": "Compréhension visuelle",
  "curriculum.phase2": "Révéler le code",
  "curriculum.phase3": "Édition guidée",
  "curriculum.phase4": "Créer de zéro",
  "curriculum.phase5": "Matériel réel",
  "curriculum.phase6": "Sujets avancés",

  "cta.title": "Prêt à créer votre premier objet connecté ?",
  "cta.subtitle": "Commencez gratuitement. Aucun matériel requis pour débuter.",
  "cta.button": "Commencer — c'est gratuit",

  "footer.tagline": "Conçu pour les makers et les passionnés de domotique.",
  "footer.signIn": "Se connecter",
  "footer.signUp": "S'inscrire",
}

const nl: Record<keyof typeof en, string> = {
  "header.features": "Functies",
  "header.builder": "Bouwer",
  "header.curriculum": "Lesprogramma",
  "header.signIn": "Inloggen",
  "header.getStarted": "Aan de slag",

  "hero.badge": "ESP32-C6 Starterkit",
  "hero.title1": "Bouw slimme apparaten.",
  "hero.title2": "Zonder giswerk.",
  "hero.subtitle":
    "Leer ESPHome via 22 begeleide niveaus. Begin met het slepen van visuele flows, zie de YAML live ontstaan en exporteer hem daarna om met ESPHome op echte hardware te flashen.",
  "hero.ctaPrimary": "Gratis beginnen",
  "hero.ctaSecondary": "Inloggen",
  "hero.statLevels": "Begeleide niveaus",
  "hero.statPhases": "Fasen",
  "hero.statWorkspace": "Bouwer + YAML-editor",
  "hero.sensorSub": "Temperatuur · Vochtigheid",
  "hero.chipReady": "Klaar voor ESPHome",

  "features.eyebrow": "Waarom ESPHome Learn",
  "features.title": "Alles wat je nodig hebt, op één plek",
  "features.visualTitle": "Visuele bouwer",
  "features.visualDesc":
    "Sleep componenten op het canvas en verbind ze met flows. Geen code nodig om te beginnen — alleen intuïtie.",
  "features.yamlTitle": "Live YAML",
  "features.yamlDesc":
    "Elk knooppunt en elke verbinding genereert direct geldige ESPHome-YAML. Zie het opbouwen terwijl je ontwerpt.",
  "features.hwTitle": "Echte hardware",
  "features.hwDesc":
    "Exporteer je configuratie en flash hem met ESPHome — je apparaat verschijnt in Home Assistant. Van leren naar productie in enkele minuten.",

  "how.eyebrow": "Het traject",
  "how.title": "Van nul tot uitgerold — stap voor stap",
  "how.s1Title": "Visueel begrijpen",
  "how.s1Desc":
    "Leer hoe slimme apparaten werken met sleep-en-neerzetblokken. Geen voorkennis vereist.",
  "how.s2Title": "Onthul de code",
  "how.s2Desc":
    "Zie hoe elk visueel blok overeenkomt met echte ESPHome-YAML. Sla de brug tussen concept en code.",
  "how.s3Title": "Exporteren & uitrollen",
  "how.s3Desc":
    "Exporteer je configuratie en open hem in ESPHome om je ESP32 te flashen. Je apparaat verschijnt in Home Assistant, klaar om te automatiseren.",

  "builder.eyebrow": "Bouwer",
  "builder.title": "Visuele flows. Echte YAML. Eén werkruimte.",
  "builder.subtitle":
    "Verbind knooppunten visueel en zie een geldige ESPHome-configuratie in realtime ontstaan. Schakel altijd over naar de YAML-weergave om de code achter je ontwerp te zien.",
  "builder.components": "Componenten",
  "builder.selectedNode": "Geselecteerd knooppunt",
  "builder.flow": "Flow",
  "builder.liveYaml": "Live YAML",
  "builder.tabProperties": "Eigenschappen",
  "builder.tabLogs": "Logboeken",
  "builder.callout1Title": "Knooppunten slepen & neerzetten",
  "builder.callout1Desc": "Componenten, triggers, acties — sleep ze op het canvas en verbind ze.",
  "builder.callout2Title": "Directe YAML-uitvoer",
  "builder.callout2Desc": "Elke verbinding die je maakt genereert in realtime geldige ESPHome-YAML.",
  "builder.callout3Title": "Schakel altijd van weergave",
  "builder.callout3Desc": "Wissel tussen de Bouwer- en YAML-weergave zonder je werk te verliezen.",

  "curriculum.eyebrow": "Lesprogramma",
  "curriculum.title": "6 fasen. 22 niveaus.",
  "curriculum.tagline": "Van de eerste klik tot geavanceerde configuratie",
  "curriculum.levels": "{n} niveaus",
  "curriculum.phase1": "Visueel begrip",
  "curriculum.phase2": "De code onthullen",
  "curriculum.phase3": "Begeleid bewerken",
  "curriculum.phase4": "Vanaf nul bouwen",
  "curriculum.phase5": "Echte hardware",
  "curriculum.phase6": "Gevorderde onderwerpen",

  "cta.title": "Klaar om je eerste slimme apparaat te bouwen?",
  "cta.subtitle": "Begin gratis. Geen hardware nodig om te leren.",
  "cta.button": "Begin met leren — het is gratis",

  "footer.tagline": "Gemaakt voor makers en domotica-liefhebbers.",
  "footer.signIn": "Inloggen",
  "footer.signUp": "Registreren",
}

export const useLandingT = createScope(en, { fr, nl })
