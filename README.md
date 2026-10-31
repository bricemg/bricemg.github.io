# BRICEMG / STUDIO

Repository: `bricemg`

A minimal, high-aesthetic portfolio website with an integrated live WYSIWYG CMS for editing content and styling directly in the browser.

---

## English

### Overview
**BRICEMG / STUDIO** is a clean, modern, zero-dependency portfolio built with native HTML, CSS, and vanilla JavaScript. It incorporates a live WYSIWYG CMS directly inside the browser, allowing real-time customization of text, projects, sections, typography, gradients, and layout without requiring any complex build setup or database.

### Features
- **Public Portfolio**: Fast, lightweight, responsive showcase with generative background canvas effects.
- **Live WYSIWYG CMS Studio** (`noAdmin.html`): Edit text directly in context or via the collapsible sidebar with live preview.
- **Advanced Theme Customizer**:
  - Linear gradients with custom angles & color pickers (Background, Cards/Cells, Contours/Borders).
  - Typography selector (Doto, IBM Plex Mono, Inter, JetBrains Mono, Space Mono, Syne).
  - Fine controls: base font size, text transform (uppercase/none), letter-spacing, and border-radius.
  - Text & accent color palette management.
- **Dynamic Content & Sections Management**:
  - Add, edit, toggle visibility, and reorder sections and cards/projects.
  - Media/image path binding, project badges, tags, and status.
- **Dual Persistence Workflow**:
  - **Instant Local Storage**: Changes are immediately saved in browser `localStorage`.
  - **One-Click JSON Export**: Download updated `content.json` to commit and publish permanently on GitHub Pages.
- **Protected CMS Access**: Password authentication gate (default password: `bricemg`).
- **Zero Build Tools**: 100% static, runs anywhere immediately.

### Project Structure
```text
├── index.html            # Public portfolio homepage
├── noAdmin.html          # Live WYSIWYG CMS editor
├── content.json          # Default site data & theme configuration
├── styles.css            # Core design system and visitor layout styling
├── css/
│   └── admin-sections.css # CMS UI and sidebar styles
├── js/
│   ├── admin/wysiwyg.js  # Live WYSIWYG studio controller & inspector
│   ├── animation/canvas.js# Background animated canvas graphics
│   ├── index/main.js     # Public site bootstrapping
│   ├── templates/page.js # HTML template generators
│   └── utils/storage.js  # Storage handling, theme applier & JSON export
└── media/                # Images, placeholders, and project assets
```

### Local Preview
Open the project with any local HTTP server (required to allow `content.json` fetching):

```bash
# Python 3
python -m http.server 8000

# Or Node.js
npx serve .
```

Then navigate to:
- Public site: [http://localhost:8000/](http://localhost:8000/)
- CMS Studio: [http://localhost:8000/noAdmin.html](http://localhost:8000/noAdmin.html)

### How Content is Published
1. Access the CMS at `noAdmin.html` using the access key (default: `bricemg`).
2. Tweak your theme, copy, and project cards with live visual feedback.
3. Click **"Enregistrer (Local)"** to preserve edits in your browser.
4. Click **"Exporter content.json"** to download the updated data file.
5. Replace the root `content.json` file in your repository with this file and commit:
   ```bash
   git add content.json
   git commit -m "Update site content and theme"
   git push
   ```
6. Your live site will automatically display the new content.

### Deployment
Ready to deploy out of the box on **GitHub Pages**, Netlify, Vercel, or any static host:
- Public site: `https://bricemg.github.io/_/`
- Admin: `https://bricemg.github.io/_/noAdmin.html`

---

## Français

### Présentation
**BRICEMG / STUDIO** est un portfolio moderne, épuré et sans dépendances lourdes, conçu en HTML, CSS et JavaScript pur. Il intègre un studio d'édition WYSIWYG directement dans le navigateur, permettant de modifier les textes, les projets, les sections, la typographie et les dégradés visuels en temps réel sans nécessiter de backend ou de base de données.

### Fonctionnalités
- **Site public vitrine** : Page d'accueil fluide, responsive, dotée d'une animation d'arrière-plan sur canvas interactif.
- **Studio CMS WYSIWYG en direct** (`noAdmin.html`) : Modification directe des éléments à l'écran ou via le volet latéral repliable avec aperçu temps réel.
- **Personnalisation visuelle avancée du thème** :
  - Dégradés linéaires configurables (angles et sélecteurs de couleurs pour l'arrière-plan, les cellules/cartes et les bordures).
  - Choix de typographies contemporaines (Doto, IBM Plex Mono, Inter, JetBrains Mono, Space Mono, Syne).
  - Contrôle précis : taille de police, casse (`uppercase`), espacement des lettres et arrondi des bordures (`border-radius`).
  - Palette de couleurs pour les textes et touches d'accentuation.
- **Gestion dynamique des sections & éléments** :
  - Création, édition, bascule de visibilité et organisation des sections et des projets/cartes.
  - Gestion des médias/images, statuts, codes et descriptions.
- **Double persistance pensée pour Git & le statique** :
  - **Sauvegarde locale instantanée** : Enregistrement continu dans le `localStorage` du navigateur.
  - **Export JSON en 1 clic** : Téléchargement direct du fichier `content.json` prêt à être versionné et publié.
- **Accès CMS sécurisé** : Protection par clé d'accès (défaut : `bricemg`).
- **Zéro compilation** : Fonctionne directement sans bundler ni `node_modules`.

### Structure du projet
```text
├── index.html            # Site vitrine public
├── noAdmin.html          # Studio d'édition CMS WYSIWYG
├── content.json          # Données par défaut du site et paramètres du thème
├── styles.css            # Système de design principal et styles du site
├── css/
│   └── admin-sections.css # Styles du panneau d'administration et de la sidebar
├── js/
│   ├── admin/wysiwyg.js  # Moteur d'édition WYSIWYG et inspecteur
│   ├── animation/canvas.js# Animation graphique de fond en Canvas
│   ├── index/main.js     # Initialisation du site public
│   ├── templates/page.js # Générateur de gabarits HTML
│   └── utils/storage.js  # Gestion du stockage, application des thèmes et export
└── media/                # Images, visuels et placeholders
```

### Prévisualisation locale
Démarrez un serveur HTTP local (indispensable pour permettre le chargement asynchrone de `content.json`) :

```bash
# Avec Python 3
python -m http.server 8000

# Ou avec Node.js
npx serve .
```

Puis rendez-vous sur :
- Site public : [http://localhost:8000/](http://localhost:8000/)
- Studio CMS : [http://localhost:8000/noAdmin.html](http://localhost:8000/noAdmin.html)

### Workflow de mise à jour du contenu
1. Accédez à `noAdmin.html` et saisissez la clé d'accès (par défaut : `bricemg`).
2. Personnalisez votre thème, vos textes et vos projets avec rendu visuel direct.
3. Cliquez sur **« Enregistrer (Local) »** pour garder vos modifications dans votre navigateur.
4. Cliquez sur **« Exporter content.json »** pour télécharger le fichier à jour.
5. Remplacez le fichier `content.json` à la racine de votre dépôt par le fichier téléchargé, puis committez :
   ```bash
   git add content.json
   git commit -m "Mise à jour du contenu et du thème"
   git push
   ```
6. Le site public en ligne prend immédiatement en compte vos modifications sur GitHub Pages.

### Déploiement
Prêt pour un déploiement direct sur **GitHub Pages**, Netlify, Vercel ou n'importe quel hébergeur statique :
- Site public : `https://bricemg.github.io/_/`
- Panneau d'administration : `https://bricemg.github.io/_/noAdmin.html`

---

## License
This project is provided as-is for personal and portfolio use.

---

Made with simplicity, design, and experimentation.
