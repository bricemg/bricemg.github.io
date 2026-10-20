const defaultContent = {
  site: {
    title: 'BRICEMG / STUDIO',
    subtitle: 'DESIGN / CODE / VISION',
    heroClaim: 'DES IDÉES QUI ONT UNE FORME, UNE VOIX ET UNE VITESSE.',
    intro: 'Je crée des interfaces, des identités visuelles et des expériences web qui donnent du sens à une idée.',
    about: 'Je conçois et développe des projets à la croisée du design, du produit et du code.',
    email: 'bonjour@bricemg.dev'
  },
  theme: {
    bg: '#e3e3e3',
    cell: '#f0f0f0',
    border: '#d8d8d8',
    text: '#2e2e2e',
    textSoft: '#585858',
    textFaint: '#9b9b9b',
    accent: '#d71921'
  },
  sections: [
    {
      id: 'atelier',
      letter: 'A',
      title: 'ATELIER',
      visible: true,
      items: [
        {
          id: 'branding',
          title: 'IDENTITÉ VISUELLE',
          code: 'BRAND',
          desc: 'Logo, charte graphique, guidelines, visual system.',
          type: 'IDENTITÉ',
          status: 'ACTIF',
          visible: true
        },
        {
          id: 'portfolio',
          title: 'PORTFOLIO',
          code: 'SHOWCASE',
          desc: 'Présentation des réalisations, des projets et des compétences.',
          type: 'CASE STUDIES',
          status: 'ACTIF',
          visible: true
        },
        {
          id: 'web',
          title: 'SITE WEB',
          code: 'WEB',
          desc: 'Site vitrine, landing page, expériences interactives.',
          type: 'PRODUCTION',
          status: 'EN COURS',
          visible: true
        },
        {
          id: 'experiments',
          title: 'EXPÉRIMENTATIONS',
          code: 'CREATIVE CODE',
          desc: 'Outils, interfaces, motion, génération graphique.',
          type: 'R&D',
          status: 'EXPLORATION',
          visible: true
        }
      ]
    },
    {
      id: 'projets',
      letter: 'B',
      title: 'PROJETS',
      visible: true,
      items: [
        {
          id: 'saas',
          title: 'SAAS / PRODUCT',
          code: 'UX',
          desc: 'Applications, tableaux de bord, flux de travail.',
          type: 'SOFTWARE',
          status: 'CONCEPTION',
          visible: true
        },
        {
          id: 'motion',
          title: 'MOTION / VISUAL',
          code: 'MOTION',
          desc: 'Animation, typographie, images en mouvement.',
          type: 'MEDIA',
          status: 'RÉALISATION',
          visible: true
        },
        {
          id: 'consulting',
          title: 'CONSEIL / DESIGN',
          code: 'STRATÉGIE',
          desc: 'Positionnement, UX, idéation et définition de solutions.',
          type: 'ADVISORY',
          status: 'DISCUSSION',
          visible: true
        },
        {
          id: 'culture',
          title: 'CULTURE / ÉVÈNEMENT',
          code: 'PUBLISH',
          desc: 'Visuel, communication, campagnes et trousse de présentation.',
          type: 'ÉVÈNEMENT',
          status: 'PLANIFICATION',
          visible: true
        }
      ]
    }
  ],
  plates: [
    {
      id: 'plate_f',
      letter: 'F',
      label: 'INFO',
      visible: true,
      items: [
        {
          title: 'ÉTAT',
          desc: "CRÉATION D'UNE BASE VISUELLE ET D'UNE PREMIÈRE VERSION D'EXPOSITION."
        },
        {
          title: 'FOCUS',
          desc: 'DESIGN, DÉVELOPPEMENT, EXPÉRIMENTATION ET STORYTELLING.'
        }
      ]
    },
    {
      id: 'plate_g',
      letter: 'G',
      label: 'APPROCHE',
      visible: true,
      items: [
        {
          title: 'PRINCIPE',
          desc: 'CLARTÉ, RÉPÉTITION, RYTHME, STRUCTURE ET PLAINES DE COULEUR.'
        },
        {
          title: 'MOOD',
          desc: 'MINIMAL, CALME, MODERNE, UN PEU TECHNIQUE ET CURIEUX.'
        }
      ]
    },
    {
      id: 'plate_h',
      letter: 'H',
      label: 'CONTACT',
      visible: true,
      hasDot: true,
      text: 'POUR UN PROJET, UNE COLLABORATION, OU UNE DISCUSSION.',
      emailPrefix: 'ÉCRIS À',
      email: 'bonjour@bricemg.dev'
    }
  ],
  footer: {
    col1: 'BRICEMG',
    col2: 'DESIGN / CODE / VISION',
    col3: 'DESIGN / CODE / VISION',
    col4: 'bonjour@bricemg.dev',
    col5: '© 2026'
  },
  cards: [],
  projects: []
};

window.defaultContent = defaultContent;
