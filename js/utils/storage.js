// Storage and constants
const STORAGE_KEY = 'bricemg_site_content_v1';
const ADMIN_SECRET = 'bricemg';
const AUTH_KEY = 'bricemg_admin_authenticated';

function normalizeItem(item, idx, fallbackType) {
  return {
    id: item.id || 'item_' + Date.now() + '_' + idx,
    title: item.title || 'NOUVEAU TITRE',
    code: item.code || 'CODE',
    desc: item.desc || 'Description...',
    type: item.type || fallbackType || 'PROJET',
    status: item.status || item.phase || 'ACTIF',
    visible: item.visible !== false
  };
}

function migrateToSections(parsed, defaultData) {
  if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
    return parsed.sections.map((sec, secIdx) => ({
      id: sec.id || 'sec_' + secIdx,
      letter: sec.letter || String.fromCharCode(65 + secIdx),
      title: sec.title || ('SECTION ' + (secIdx + 1)),
      visible: sec.visible !== false,
      items: Array.isArray(sec.items)
        ? sec.items.map((it, i) => normalizeItem(it, i, 'ITEM'))
        : []
    }));
  }

  // Fallback: migrate from cards and projects
  const cards = parsed.cards || defaultData.cards || [];
  const projects = parsed.projects || defaultData.projects || [];

  return [
    {
      id: 'atelier',
      letter: 'A',
      title: 'ATELIER',
      visible: true,
      items: cards.map((c, i) => normalizeItem(c, i, 'IDENTITÉ'))
    },
    {
      id: 'projets',
      letter: 'B',
      title: 'PROJETS',
      visible: true,
      items: projects.map((p, i) => normalizeItem(p, i, 'SOFTWARE'))
    }
  ];
}

// Get content from localStorage or return default
function getContent() {
  const defaultData = window.defaultContent || {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      ...defaultData,
      sections: migrateToSections(defaultData, defaultData)
    };
  }
  try {
    const parsed = JSON.parse(raw);
    const sections = migrateToSections(parsed, defaultData);
    return {
      ...defaultData,
      ...parsed,
      site: {
        ...(defaultData.site || {}),
        ...(parsed.site || {})
      },
      theme: {
        ...(defaultData.theme || {}),
        ...(parsed.theme || {})
      },
      sections,
      plates: parsed.plates || defaultData.plates,
      footer: {
        ...(defaultData.footer || {}),
        ...(parsed.footer || {})
      },
      cards: sections[0]?.items || parsed.cards || defaultData.cards,
      projects: sections[1]?.items || parsed.projects || defaultData.projects
    };
  } catch (error) {
    console.error('Error parsing content:', error);
    return {
      ...defaultData,
      sections: migrateToSections(defaultData, defaultData),
      plates: defaultData.plates,
      footer: defaultData.footer
    };
  }
}

// Save content to localStorage
function saveContent(content) {
  try {
    // Keep backward-compatible card/project arrays if sections exist
    if (content.sections && content.sections.length > 0) {
      content.cards = content.sections[0] ? content.sections[0].items : [];
      content.projects = content.sections[1] ? content.sections[1].items : [];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
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
  if (theme.textSoft) {
    root.style.setProperty('--ink-soft', theme.textSoft);
  }
  if (theme.textFaint) {
    root.style.setProperty('--ink-faint', theme.textFaint);
  }
  if (theme.accent) {
    root.style.setProperty('--red', theme.accent);
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

// Sanitize HTML string (basic XSS prevention)
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
  applyTheme,
  isAuthenticated,
  setAuthenticated,
  sanitize
};
