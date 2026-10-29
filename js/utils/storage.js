// Storage and constants
const STORAGE_KEY = 'bricemg_site_content_v1';
const ADMIN_SECRET = 'bricemg';
const AUTH_KEY = 'bricemg_admin_authenticated';

// Helper to extract clean serializable content (strip temp previews and sync backward-compatible keys)
function getCleanContent(content) {
  if (!content) return {};
  const clean = JSON.parse(JSON.stringify(content, (k, v) => (k === '_tempPreview' ? undefined : v)));
  if (clean.sections && Array.isArray(clean.sections)) {
    clean.cards = clean.sections[0] ? clean.sections[0].items || [] : [];
    clean.projects = clean.sections[1] ? clean.sections[1].items || [] : [];
  }
  return clean;
}

// Fetch content from localStorage or fallback to content.json (with safe merge)
async function getContent() {
  let defaultData = {};
  try {
    const response = await fetch('./content.json');
    if (response.ok) {
      defaultData = await response.json();
    }
  } catch (error) {
    console.warn('Chargement content.json impossible (environnement local/statique) :', error);
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultData;
  }

  try {
    const localData = JSON.parse(raw);
    return {
      ...defaultData,
      ...localData,
      site: { ...(defaultData.site || {}), ...(localData.site || {}) },
      theme: { ...(defaultData.theme || {}), ...(localData.theme || {}) },
      sections: Array.isArray(localData.sections) && localData.sections.length > 0 ? localData.sections : defaultData.sections || []
    };
  } catch (e) {
    console.error('Erreur lecture localStorage, retour aux données par défaut:', e);
    return defaultData;
  }
}

// Save content to localStorage
function saveContent(content) {
  try {
    const cleanContent = getCleanContent(content);
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
    const cleanContent = getCleanContent(content);
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

// Apply theme CSS variables to document (supports linear gradients and backward-compatible solid colors)
function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;

  // Background gradient
  const bgStart = theme.bgStart || theme.bg || '#e3e3e3';
  const bgEnd = theme.bgEnd || theme.bg || bgStart;
  const bgAngle = theme.bgAngle || '135deg';
  root.style.setProperty('--bg-start', bgStart);
  root.style.setProperty('--bg-end', bgEnd);
  root.style.setProperty('--bg-angle', bgAngle);
  root.style.setProperty('--bg-gradient', `linear-gradient(${bgAngle}, ${bgStart}, ${bgEnd})`);
  root.style.setProperty('--bg', bgStart);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', bgStart);
  }

  // Cell / Blocks gradient
  const cellStart = theme.cellStart || theme.cell || '#f0f0f0';
  const cellEnd = theme.cellEnd || theme.cell || cellStart;
  const cellAngle = theme.cellAngle || '145deg';
  root.style.setProperty('--cell-start', cellStart);
  root.style.setProperty('--cell-end', cellEnd);
  root.style.setProperty('--cell-angle', cellAngle);
  root.style.setProperty('--cell-gradient', `linear-gradient(${cellAngle}, ${cellStart}, ${cellEnd})`);
  root.style.setProperty('--cell', cellStart);

  // Border / Contours gradient
  const borderStart = theme.borderStart || theme.border || '#d8d8d8';
  const borderEnd = theme.borderEnd || theme.border || borderStart;
  const borderAngle = theme.borderAngle || '135deg';
  root.style.setProperty('--border-start', borderStart);
  root.style.setProperty('--border-end', borderEnd);
  root.style.setProperty('--border-angle', borderAngle);
  root.style.setProperty('--border-gradient', `linear-gradient(${borderAngle}, ${borderStart}, ${borderEnd})`);
  root.style.setProperty('--hair', borderStart);
  root.style.setProperty('--card-border', borderStart);

  // Text colors
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

function linkify(str) {
  return sanitize(str).replace(/(https?:\/\/[^\s<]+)/gi, (match) => {
    const trailing = match.match(/[.,;:!?)]+$/);
    const suffix = trailing ? trailing[0] : '';
    const url = suffix ? match.slice(0, -suffix.length) : match;
    if (!/^https?:\/\//i.test(url)) return match;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${suffix}`;
  });
}

function formatDetailHtml(str) {
  const source = str == null ? '' : String(str);
  const links = [];
  const withTokens = source.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (fullTag, attrs, label) => {
      const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
      if (!hrefMatch) return fullTag;
      const href = hrefMatch[2].replace(/\\/g, '/');
      const hasDownload = /\bdownload\b/i.test(attrs);
      const isExternal = /^https?:\/\//i.test(href);
      const token = `%%BRICE_A_${links.length}%%`;
      links.push({ href, label, isExternal, hasDownload });
      return token;
    }
  );

  let html = linkify(withTokens);
  links.forEach((link, i) => {
    let extraAttrs = '';
    if (link.hasDownload) {
      extraAttrs += ' download';
    }
    if (link.isExternal) {
      extraAttrs += ' target="_blank" rel="noopener noreferrer"';
    }
    html = html.split(`%%BRICE_A_${i}%%`).join(
      `<a href="${sanitize(link.href)}"${extraAttrs}>${sanitize(link.label)}</a>`
    );
  });
  return html;
}

window.sanitize = sanitize;
window.linkify = linkify;
window.formatDetailHtml = formatDetailHtml;
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
  sanitize,
  linkify,
  formatDetailHtml
};