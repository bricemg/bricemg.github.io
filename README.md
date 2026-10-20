# BRICEMG / STUDIO

Repository: `bricemg/_`

A minimal static portfolio website with a lightweight CMS for editing content directly in the browser.

## English

### Overview
This project is a simple and elegant portfolio website built with plain HTML, CSS and JavaScript. It includes a minimal CMS that allows non-technical users to update site content without a backend or database.

### Features
- Static portfolio homepage
- Lightweight "CMS Minimal" editor
- Visual theme and palette customizer (background, cards, borders, typography, accent)
- Local content persistence via `localStorage`
- Simple admin access with a password
- Responsive layout
- Minimal dependencies and easy deployment

### Project structure
- `index.html` — public website
- `admin.html` — CMS editor
- `content.js` — default content data
- `styles.css` — site + admin styling
- `js/` — JavaScript modules for storage, rendering, template generation and animation
- `css/` — additional CSS files

### Local preview
Open the project locally in a browser, or use a simple local server:

```bash
python -m http.server 8000
```

Then visit:
- `http://localhost:8000/`
- `http://localhost:8000/admin.html`

The content is saved in the browser using `localStorage`, so this version is ideal for a lightweight prototype or personal portfolio.

### Deployment
The site is designed for GitHub Pages:

- Public site: `https://bricemg.github.io/_/`
- Admin: `https://bricemg.github.io/_/admin.html`

### Notes
This project is intentionally minimal and static. It is perfect for a portfolio, mockup, or lightweight personal website. For a production CMS with multi-user editing, a backend such as Strapi, Sanity, or a custom Node.js API would be recommended.

---

## Français

### Présentation
Ce projet est un site vitrine minimaliste et élégant, construit avec du HTML, CSS et JavaScript pur. Il comprend un CMS minimal permettant de modifier le contenu directement dans le navigateur, sans base de données ni backend.

### Fonctionnalités
- Page d’accueil statique pour portfolio
- Éditeur CMS minimal
- Personnalisation visuelle du thème (fond, cartes, contours, typographie, accent)
- Sauvegarde locale via `localStorage`
- Accès admin protégé par mot de passe
- Mise en page responsive
- Très peu de dépendances et déploiement simple

### Structure du projet
- `index.html` — site public
- `admin.html` — panneau d’édition CMS
- `content.js` — données par défaut du site
- `styles.css` — styles du site et du CMS
- `js/` — modules JavaScript pour le stockage, le rendu, les templates et l’animation
- `css/` — fichiers CSS spécifiques

### Prévisualisation locale
Ouvrez le projet dans le navigateur, ou lancez un petit serveur local :

```bash
python -m http.server 8000
```

Puis ouvrez :
- `http://localhost:8000/`
- `http://localhost:8000/admin.html`

Les contenus sont enregistrés dans le navigateur via `localStorage`. Cette version est idéale pour un prototype léger ou un portfolio personnel.

### Déploiement
Le site est conçu pour GitHub Pages :

- Site public : `https://bricemg.github.io/_/`
- Admin : `https://bricemg.github.io/_/admin.html`

### Remarques
Ce projet est volontairement minimal et statique. Il convient parfaitement à un portfolio, une maquette ou un site personnel léger. Pour un vrai CMS en production avec plusieurs utilisateurs, il est recommandé d’utiliser un backend comme Strapi, Sanity ou une API custom.

---

## License
This project is provided as-is for personal and portfolio use.

---

Made with simplicity, design, and experimentation.
