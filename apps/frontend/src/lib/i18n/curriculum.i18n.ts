import { createScope } from "./scope"

// Phase + level titles and phase descriptions, shared across the sidebar,
// breadcrumb, command palette, home learning path and level navigation.
const en = {
  "breadcrumb.home": "Home",
  "breadcrumb.phase": "Phase {n}",

  "phase.1": "Visual Understanding",
  "phase.2": "Revealing the Code",
  "phase.3": "Guided Editing",
  "phase.4": "Building from Scratch",
  "phase.5": "Real Hardware",
  "phase.6": "Advanced Topics",

  "phaseDesc.1": "Learn the mental model of smart devices",
  "phaseDesc.2": "Discover the YAML behind every visual block",
  "phaseDesc.3": "Make your first changes to real configurations",
  "phaseDesc.4": "Write complete configs from a blank slate",
  "phaseDesc.5": "Debug with logs and integrate with Home Assistant",
  "phaseDesc.6": "Master lambdas, custom components, and more",

  "level.1.1": "What is a smart device?",
  "level.1.2": "Meet your board",
  "level.1.3": "Your first flow",
  "level.1.4": "Adding timing",
  "level.2.1": "The YAML behind the magic",
  "level.2.2": "Understanding the structure",
  "level.2.3": "Spot the difference",
  "level.2.4": "Reading a complete config",
  "level.3.1": "Change the names",
  "level.3.2": "Change the pins",
  "level.3.3": "Change the behavior",
  "level.3.4": "Add a delay",
  "level.3.5": "Conditions",
  "level.4.1": "Fill in the blanks",
  "level.4.2": "Add a component",
  "level.4.3": "Create an automation",
  "level.4.4": "Write a complete config",
  "level.5.1": "Debug with logs",
  "level.5.2": "Integration with Home Assistant",
  "level.6.1": "Lambdas",
  "level.6.2": "Custom components",
  "level.6.3": "I2C and SPI devices",
} as const

const fr: Record<keyof typeof en, string> = {
  "breadcrumb.home": "Accueil",
  "breadcrumb.phase": "Phase {n}",

  "phase.1": "Compréhension visuelle",
  "phase.2": "Révéler le code",
  "phase.3": "Édition guidée",
  "phase.4": "Créer de zéro",
  "phase.5": "Matériel réel",
  "phase.6": "Sujets avancés",

  "phaseDesc.1": "Assimilez le modèle mental des objets connectés",
  "phaseDesc.2": "Découvrez le YAML derrière chaque bloc visuel",
  "phaseDesc.3": "Faites vos premières modifications sur de vraies configurations",
  "phaseDesc.4": "Rédigez des configurations complètes à partir de zéro",
  "phaseDesc.5": "Déboguez avec les journaux et intégrez Home Assistant",
  "phaseDesc.6": "Maîtrisez les lambdas, les composants personnalisés et plus",

  "level.1.1": "Qu'est-ce qu'un objet connecté ?",
  "level.1.2": "Découvrez votre carte",
  "level.1.3": "Votre premier flux",
  "level.1.4": "Ajouter de la temporisation",
  "level.2.1": "Le YAML derrière la magie",
  "level.2.2": "Comprendre la structure",
  "level.2.3": "Repérez la différence",
  "level.2.4": "Lire une configuration complète",
  "level.3.1": "Changer les noms",
  "level.3.2": "Changer les broches",
  "level.3.3": "Changer le comportement",
  "level.3.4": "Ajouter un délai",
  "level.3.5": "Conditions",
  "level.4.1": "Compléter les blancs",
  "level.4.2": "Ajouter un composant",
  "level.4.3": "Créer une automatisation",
  "level.4.4": "Écrire une configuration complète",
  "level.5.1": "Déboguer avec les journaux",
  "level.5.2": "Intégration avec Home Assistant",
  "level.6.1": "Lambdas",
  "level.6.2": "Composants personnalisés",
  "level.6.3": "Périphériques I2C et SPI",
}

const nl: Record<keyof typeof en, string> = {
  "breadcrumb.home": "Start",
  "breadcrumb.phase": "Fase {n}",

  "phase.1": "Visueel begrip",
  "phase.2": "De code onthullen",
  "phase.3": "Begeleid bewerken",
  "phase.4": "Vanaf nul bouwen",
  "phase.5": "Echte hardware",
  "phase.6": "Gevorderde onderwerpen",

  "phaseDesc.1": "Leer het mentale model van slimme apparaten",
  "phaseDesc.2": "Ontdek de YAML achter elk visueel blok",
  "phaseDesc.3": "Maak je eerste wijzigingen in echte configuraties",
  "phaseDesc.4": "Schrijf volledige configuraties vanaf een leeg blad",
  "phaseDesc.5": "Debug met logboeken en integreer met Home Assistant",
  "phaseDesc.6": "Beheers lambdas, eigen componenten en meer",

  "level.1.1": "Wat is een slim apparaat?",
  "level.1.2": "Maak kennis met je bord",
  "level.1.3": "Je eerste flow",
  "level.1.4": "Timing toevoegen",
  "level.2.1": "De YAML achter de magie",
  "level.2.2": "De structuur begrijpen",
  "level.2.3": "Zoek het verschil",
  "level.2.4": "Een volledige configuratie lezen",
  "level.3.1": "De namen wijzigen",
  "level.3.2": "De pinnen wijzigen",
  "level.3.3": "Het gedrag wijzigen",
  "level.3.4": "Een vertraging toevoegen",
  "level.3.5": "Voorwaarden",
  "level.4.1": "Vul de lege plekken in",
  "level.4.2": "Een component toevoegen",
  "level.4.3": "Een automatisering maken",
  "level.4.4": "Een volledige configuratie schrijven",
  "level.5.1": "Debuggen met logboeken",
  "level.5.2": "Integratie met Home Assistant",
  "level.6.1": "Lambdas",
  "level.6.2": "Eigen componenten",
  "level.6.3": "I2C- en SPI-apparaten",
}

export const useCurriculumT = createScope(en, { fr, nl })

type CurriculumKey = keyof typeof en

/** Convenience hooks for the dynamic phase/level keys. */
export function useCurriculumLabels() {
  const t = useCurriculumT()
  return {
    levelTitle: (id: string) => t(`level.${id}` as CurriculumKey),
    phaseTitle: (n: number) => t(`phase.${n}` as CurriculumKey),
    phaseDesc: (n: number) => t(`phaseDesc.${n}` as CurriculumKey),
    phaseLabel: (n: number) => t("breadcrumb.phase", { n }),
  }
}
