# 📁 Vue d’ensemble du projet *BRICEMG Studio* – « carte » des responsabilités

> **Objectif** : fournir une vue claire de qui (quelle partie du code) fait quoi afin d’optimiser les prochaines itérations (ajouts de fonctionnalités, refactorings, amélioration de la maintenabilité).

---

### 1️⃣ Structure du répertoire (extraits clés)
```
gitBriceMG/
│
├─ index.html                 ← page publique (visiteur)
├─ admin.html                 ← CMS / WYSIWYG (édition du site)
├─ content.json               ← source de données du site (texte, métadonnées)
├─ styles.css                 ← design‑system (tokens, palette, typographies)
│
├─ css/                       ← (potentiels sous‑styles supplémentaires)
│
├─ js/
│   ├─ utils/
│   │   └─ storage.js         ← API localStorage pour sauvegarder les réglages
│   ├─ templates/
│   │   └─ page.js            ← génération dynamique du markup à partir de content.json
│   ├─ animation/
│   │   └─ canvas.js          ← canvas interactive (effet « play » des cartes)
│   ├─ index/
│   │   └─ main.js            ← orchestration de la page visiteur (load, init UI)
│   └─ admin/
│       └─ wysiwyg.js         ← logique du CMS / éditeur de thème (UI, synchronisation)
│
├─ media/                     ← images utilisées dans les cartes
├─ files/                     ← éventuels assets supplémentaires
└─ _archives/ …               ← backups / versions antérieures
```

---

### 2️⃣ Carte des responsabilités (Mermaid)
```mermaid
flowchart TD
    %% Pages
    Index["index.html<br/>(page visiteur)"]
    Admin["admin.html<br/>(CMS / WYSIWYG)"]
    JSON["content.json<br/>(données du site)"]
    CSS["styles.css<br/>(design‑system)"]
    
    %% JS modules
    Main["js/index/main.js<br/>▶️ lance l’app visiteur"]
    PageTpl["js/templates/page.js<br/>🧩 génère le HTML à partir de JSON"]
    Storage["js/utils/storage.js<br/>📦 persistance locale (thème, réglages)"]
    Canvas["js/animation/canvas.js<br/>🎨 effets canvas (cards‑play)"]
    Wysiwyg["js/admin/wysiwyg.js<br/>🛠️ éditeur de thème & UI CMS"]
    
    %% Relations
    Index -->|charge| Main
    Index -->|inclut| CSS
    Index -->|inclut| PageTpl
    Index -->|inclut| Canvas
    Index -->|inclut| Storage
    
    Admin -->|charge| Wysiwyg
    Admin -->|inclut| CSS
    Admin -->|inclut| Storage
    
    Main -->|lit| JSON
    PageTpl -->|lit| JSON
    Wysiwyg -->|modifie| JSON
    Wysiwyg -->|synchronise| Storage
    
    Canvas -->|interagit avec| CSS
    Storage -->|sauvegarde| LocalStorage
    
    classDef page fill:#E3F2FD,stroke:#1565C0,color:#000;
    classDef js   fill:#FFF3E0,stroke:#EF6C00,color:#000;
    classDef data fill:#E8F5E9,stroke:#2E7D32,color:#000;
    classDef style fill:#F3E5F5,stroke:#6A1B9A,color:#000;
    
    class Index,Admin page;
    class Main,PageTpl,Canvas,Storage,Wysiwyg js;
    class JSON data;
    class CSS style;
```
#### Légende
| Couleur | Élément |
|--------|---------|
| **Bleu clair** | Pages HTML (front‑end) |
| **Orange clair** | Modules JavaScript |
| **Vert clair** | Données/Configuration (JSON) |
| **Violet clair** | Styles (CSS) |

---

### 3️⃣ Résumé fonctionnel
| Composant | Rôle principal | Points d’attention / amélioration |
|-----------|----------------|-----------------------------------|
| **index.html** | Page publique : charge le site, affiche les cartes, animations, navigation. | - Séparer le markup statique du rendu dynamique (`<template>` ou `shadow DOM`) pour faciliter le test unitaire.<br>- Ajouter des attributs ARIA/SEO (`<main>`, `<section>`, `<h1>` unique). |
| **admin.html** | Interface CMS : permet d’éditer le thème, le contenu, de prévisualiser le résultat. | - Actuellement tout le CSS est partagé ; penser à un *theme‑preview* isolé.<br>- Sécuriser la sauvegarde (validation du JSON avant `localStorage`). |
| **content.json** | Source unique de texte, titres, métadonnées, liens, couleurs par défaut. | - Structure déjà claire ; envisager un schéma JSON‑Schema pour validation automatisée.<br>- Possibilité d’ajouter une couche *i18n* (langues). |
| **styles.css** | Design‑system : variables CSS (`--bg-start`, `--ink`, `--r`, …) ; composants UI (cards, bar, foot, etc.). | - Centraliser les variables dans `:root` ✅, mais envisager un pré‑processus (Sass/PostCSS) pour gérer les thèmes multiples.<br>- Documenter chaque token (commentaire + lien design). |
| **js/utils/storage.js** | Wrapper `localStorage` : persistance des réglages utilisateur (thème, couleur, etc.). | - Gestion des erreurs (`try/catch`), expiration éventuelle.<br>- API asynchrone `Promise` pour uniformiser l’appel. |
| **js/templates/page.js** | Convertit `content.json` en éléments DOM (cards, sections, etc.). | - Découpler la logique de création d’éléments (`createElement`) du remplissage de données ; facilite les tests unitaires.<br>- Ajouter des hooks de customisation (ex : plugins). |
| **js/animation/canvas.js** | Canvas HTML5 pour l’interaction « play » des cartes (effet de déplacement, couleur). | - Vérifier la compatibilité mobile (touch events).<br>- Limiter le FPS pour réduire la charge CPU. |
| **js/index/main.js** | Point d’entrée de la page visiteur : initialise le stockage, charge le contenu, démarre l’animation. | - Introduire un *router* léger (hash‑based) si vous ajoutez des sections supplémentaires.<br>- Déplacer la logique d’initialisation vers des fonctions nommées (`initTheme()`, `initCards()`). |
| **js/admin/wysiwyg.js** | Gestion du CMS : synchronisation UI ↔ JSON ↔ storage, contrôles de couleur, typographie, presets. | - Utiliser le *observer pattern* (`MutationObserver`) pour réagir aux changements de DOM.<br>- Séparer la logique de « preset » (défaut, dark, white, warm, cyber) dans un module dédié. |
| **media/** | Dossier contenant les images affichées dans les cartes. | - Ajouter un script de compression/optimisation (e.g. `imagemin`) dans le workflow de build. |
| **_archives/** | Historique des versions (`v0.1.15.zip`). | - Considérer une stratégie de versionnage Git + tags plutôt que de stocker des zips dans le repo. |

---

### 4️⃣ Recommandations pour les **prochaines itérations**
1. **Modularisation** – Créez un *module* `theme.js` qui regroupe toutes les fonctions liées aux couleurs, aux gradients et aux presets. Exportez un objet `Theme` consommé par `wysiwyg.js` et `page.js`.
2. **Tests unitaires** – Utilisez un petit framework (Jest ou Vitest) pour tester : `storage.js` : lecture/écriture, fallback. `page.js` : génération d’une carte à partir d’un fragment JSON.
3. **CI / Lint** – Ajoutez **ESLint** (avec `eslint-config-prettier`) et **Stylelint** pour CSS afin de garantir la cohérence du code.
4. **Documentation** – Générer automatiquement la *API* depuis les JSDoc (`/** ... */`) dans chaque module. Produire un fichier `README.md` qui reprend la carte ci‑dessus (Mermaid) et le flux de données.
5. **Optimisation des performances** – Lazy‑load les images (`loading="lazy"` ou IntersectionObserver). Debouncer les handlers du canvas lors du redimensionnement (`resize`).
6. **Accessibilité & SEO** – Ajoutez un `<h1>` unique sur `index.html` et `admin.html`. Utilisez des attributs ARIA (`role="dialog"` déjà présent, mais vérifier les IDs uniques). Déclarez les métadonnées OpenGraph dans le `<head>` pour le partage social.

---

### 5️⃣ Prochaine étape (à vous)
- **Valider** la carte et les points d’amélioration : quels éléments voulez‑vous prioriser ?  
- **Déterminer** si vous avez besoin d’une refactorisation (ex. extraction du thème) ou d’une fonctionnalité supplémentaire (ex. traductions).  
- **Définir** le périmètre du prochain sprint : par ex. *« Séparer le thème dans un module dédié »* ou *« Ajouter les tests unitaires sur storage.js »*.

> Vous pouvez me demander de créer un squelette de module, d’écrire les premiers tests, ou même de générer un diagramme plus détaillé (ex. séquence d’initialisation). **Quel est votre choix pour la suite ?**
