// Storage and constants
const STORAGE_KEY = 'bricemg_site_content_v1';
const ADMIN_SECRET = 'bricemg';
const AUTH_KEY = 'bricemg_admin_authenticated';

// Fetch content from localStorage or fallback to content.json
async function getContent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Erreur lecture localStorage:', e);
    }
  }

  try {
    const response = await fetch('./content.json');
    if (!response.ok) throw new Error('Impossible de charger content.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur chargement content.json:', error);
    return {};
  }
}

// Save content to localStorage
function saveContent(content) {
  try {
    const cleanContent = JSON.parse(JSON.stringify(content, (k, v) => k === '_tempPreview' ? undefined : v));
    if (cleanContent.sections && cleanContent.sections.length > 0) {
      cleanContent.cards = cleanContent.sections[0] ? cleanContent.sections[0].items : [];
      cleanContent.projects = cleanContent.sections[1] ? cleanContent.sections[1].items : [];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanContent));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde localStorage:', error);
    return false;
  }
}

// Download content as content.json for Git commit
function exportContentJSON(content) {
  try {
    const cleanContent = JSON.parse(JSON.stringify(content, (k, v) => k === '_tempPreview' ? undefined : v));
    if (cleanContent.sections && cleanContent.sections.length > 0) {
      cleanContent.cards = cleanContent.sections[0] ? cleanContent.sections[0].items : [];
      cleanContent.projects = cleanContent.sections[1] ? cleanContent.sections[1].items : [];
    }
    const jsonString = JSON.stringify(cleanContent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = 'content.json';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export JSON:', error);
    return false;
  }
}

// Apply theme CSS variables to document
function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.bg) root.style.setProperty('--bg', theme.bg);
  if (theme.cell) root.style.setProperty('--cell', theme.cell);
  if (theme.border) {
    root.style.setProperty('--hair', theme.border);
    root.style.setProperty('--card-border', theme.border);
  }
  if (theme.text) {
    root.style.setProperty('--ink', theme.text);
    root.style.setProperty('--ink-deep', theme.text);
  }
  if (theme.textSoft) root.style.setProperty('--ink-soft', theme.textSoft);
  if (theme.textFaint) root.style.setProperty('--ink-faint', theme.textFaint);
  if (theme.accent) root.style.setProperty('--red', theme.accent);

  // Typography styles
  if (theme.fontDot) root.style.setProperty('--dot', theme.fontDot);
  if (theme.fontMono) root.style.setProperty('--mono', theme.fontMono);
  if (theme.fontSize) root.style.setProperty('--base-font-size', theme.fontSize);
  if (theme.textTransform) root.style.setProperty('--text-transform', theme.textTransform);
  if (theme.letterSpacing) root.style.setProperty('--letter-spacing', theme.letterSpacing);

  // Border radius (arrondi des cartes, parties et blocs)
  if (theme.borderRadius !== undefined && theme.borderRadius !== null && theme.borderRadius !== '') {
    root.style.setProperty('--r', theme.borderRadius);
  }
}

// Basic auth state
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setAuthenticated(val) {
  if (val) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

// Sanitize HTML string
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

window.storageUtils = {
  STORAGE_KEY,
  ADMIN_SECRET,
  AUTH_KEY,
  getContent,
  saveContent,
  exportContentJSON,
  applyTheme,
  isAuthenticated,
  setAuthenticated,
  sanitize
};