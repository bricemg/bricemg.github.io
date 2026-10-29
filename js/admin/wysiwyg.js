(function () {
  const { ADMIN_SECRET, getContent, saveContent, exportContentJSON, applyTheme, isAuthenticated, setAuthenticated } = window.storageUtils;
  const { buildPageHTML } = window.templates;
  const { CanvasAnimation } = window;

  let currentContent = null;
  let confirmCallback = null;
  let isPreviewMode = false;
  let wasCollapsedBeforePreview = false;
  let activeCanvasAnimation = null;

  const authPanel = document.getElementById('authPanel');
  const cmsContainer = document.getElementById('cmsContainer');
  const secretInput = document.getElementById('secret');
  const loginBtn = document.getElementById('loginBtn');
  const appEl = document.getElementById('app');
  const cmsSidebar = document.getElementById('cmsSidebar');
  const cmsWorkspace = document.getElementById('cmsWorkspace');
  const collapseSidebarBtn = document.getElementById('collapseSidebarBtn');
  const expandSidebarBtn = document.getElementById('expandSidebarBtn');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const resetBtn = document.getElementById('resetBtn');
  const togglePreviewBtn = document.getElementById('togglePreviewBtn');
  const confirmModal = document.getElementById('confirmModal');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmText = document.getElementById('confirmText');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  const confirmActionBtn = document.getElementById('confirmActionBtn');
  const cmsToast = document.getElementById('cmsToast');

  const mediaModal = document.getElementById('mediaModal');
  const mediaModalTitle = document.getElementById('mediaModalTitle');
  const mediaModalPreview = document.getElementById('mediaModalPreview');
  const mediaModalCurrentPath = document.getElementById('mediaModalCurrentPath');
  const mediaModalFileInput = document.getElementById('mediaModalFileInput');
  const mediaModalBrowseBtn = document.getElementById('mediaModalBrowseBtn');
  const mediaModalPathInput = document.getElementById('mediaModalPathInput');
  const mediaModalCancelBtn = document.getElementById('mediaModalCancelBtn');
  const mediaModalSaveBtn = document.getElementById('mediaModalSaveBtn');
  const mediaModalDownloadWrap = document.getElementById('mediaModalDownloadWrap');
  const mediaModalDownloadBtn = document.getElementById('mediaModalDownloadBtn');

  const detailLinkModal = document.getElementById('detailLinkModal');
  const detailLinkText = document.getElementById('detailLinkText');
  const detailLinkUrl = document.getElementById('detailLinkUrl');
  const detailLinkCancelBtn = document.getElementById('detailLinkCancelBtn');
  const detailLinkOkBtn = document.getElementById('detailLinkOkBtn');

  let editingMediaTarget = null;
  let selectedLocalFile = null;
  let activeDetailCard = null;
  let savedDetailLinkRange = null;

  async function init() {
    currentContent = await getContent();
    if (applyTheme && currentContent.theme) {
      applyTheme(currentContent.theme);
    }
    if (isAuthenticated()) {
      showCMS();
    } else {
      showAuth();
    }
    setupAuthListeners();
    setupSidebarToggleListeners();
    setupActionsListeners();
    setupThemeAndSiteListeners();
    setupModalListeners();
    setupAppDelegation();
  }

  function showAuth() {
    authPanel.classList.remove('hidden');
    cmsContainer.classList.add('hidden');
    document.body.classList.remove('cms-mode');
  }

  function showCMS() {
    authPanel.classList.add('hidden');
    cmsContainer.classList.remove('hidden');
    document.body.classList.add('cms-mode');
    fillSidebarFields();
    renderPage();
  }

  function renderPage() {
    if (!appEl) return;
    appEl.innerHTML = buildPageHTML(currentContent, { isEditable: !isPreviewMode });
    initCanvasAnimation();
  }

  function initCanvasAnimation() {
    const field = document.getElementById('field');
    if (!field) return;
    const canvas = field.querySelector('canvas');
    if (!canvas || !CanvasAnimation) return;
    try {
      if (activeCanvasAnimation && typeof activeCanvasAnimation.destroy === 'function') {
        activeCanvasAnimation.destroy();
      }
      activeCanvasAnimation = new CanvasAnimation(canvas);
      activeCanvasAnimation.init(field);
    } catch (e) {
      console.warn('Canvas animation error:', e);
    }
  }

  function showToast(message) {
    if (!cmsToast) return;
    cmsToast.textContent = message || 'Enregistré avec succès';
    cmsToast.classList.add('is-shown');
    setTimeout(() => {
      cmsToast.classList.remove('is-shown');
    }, 2400);
  }

  function showConfirmModal(title, text, onConfirm) {
    confirmTitle.textContent = title || 'CONFIRMATION';
    confirmText.textContent = text || 'Êtes-vous sûr de vouloir effectuer cette action ?';
    confirmCallback = onConfirm;
    confirmModal.classList.add('is-active');
  }

  function closeConfirmModal() {
    confirmModal.classList.remove('is-active');
    confirmCallback = null;
  }

  function showMediaModal(secIdx, itemIdx) {
    const sections = currentContent.sections || [];
    const sec = sections[secIdx];
    if (!sec || !sec.items || !sec.items[itemIdx]) return;
    const card = sec.items[itemIdx];

    editingMediaTarget = { secIdx, itemIdx };
    selectedLocalFile = null;
    const currentImg = card.image || 'media/_placeholder.png';

    if (mediaModalTitle) mediaModalTitle.textContent = `CARTE : ${card.title || 'SANS TITRE'}`;
    if (mediaModalCurrentPath) mediaModalCurrentPath.textContent = currentImg;
    if (mediaModalPathInput) mediaModalPathInput.value = currentImg;
    if (mediaModalPreview) mediaModalPreview.src = card._tempPreview || currentImg;
    if (mediaModalDownloadWrap) mediaModalDownloadWrap.style.display = 'none';

    if (mediaModal) mediaModal.classList.add('is-active');
  }

  function closeMediaModal() {
    if (mediaModal) mediaModal.classList.remove('is-active');
    editingMediaTarget = null;
    selectedLocalFile = null;
    if (mediaModalFileInput) mediaModalFileInput.value = '';
  }

  let currentAdminDetailList = [];
  let currentAdminDetailIndex = -1;

  function getAdminDetailCardsList() {
    const sections = currentContent?.sections || [];
    const list = [];
    sections.forEach((sec, secIdx) => {
      const items = sec.items || [];
      items.forEach((card, itemIdx) => {
        list.push({
          card,
          secIdx,
          itemIdx,
          secLetter: sec.letter || '',
          secTitle: sec.title || ''
        });
      });
    });
    return list;
  }

  function updateAdminNavArrows(index) {
    const hasPrev = index > 0;
    const hasNext = index < currentAdminDetailList.length - 1;

    const prevBtns = [
      document.getElementById('detailCardPrevBtn'),
      document.getElementById('detailCardSidePrevBtn')
    ];
    const nextBtns = [
      document.getElementById('detailCardNextBtn'),
      document.getElementById('detailCardSideNextBtn')
    ];

    prevBtns.forEach(btn => {
      if (!btn) return;
      if (hasPrev) {
        btn.classList.remove('is-hidden');
      } else {
        btn.classList.add('is-hidden');
      }
    });

    nextBtns.forEach(btn => {
      if (!btn) return;
      if (hasNext) {
        btn.classList.remove('is-hidden');
      } else {
        btn.classList.add('is-hidden');
      }
    });
  }

  function displayAdminCardDetailByIndex(index) {
    if (index < 0 || index >= currentAdminDetailList.length) return;
    currentAdminDetailIndex = index;
    const item = currentAdminDetailList[index];
    const { secIdx, itemIdx, card } = item;
    activeDetailCard = { secIdx, itemIdx, card };

    const modal = document.getElementById('cardDetailModal');
    if (!modal) return;

    const idxEl = document.getElementById('detailCardIdx');
    const secTagEl = document.getElementById('detailCardSecTag');
    const titleEl = document.getElementById('detailCardTitle');
    const imageEl = document.getElementById('detailCardImage');
    const codeEl = document.getElementById('detailCardCode');
    const descEl = document.getElementById('detailCardDesc');
    const typeEl = document.getElementById('detailCardType');
    const statusEl = document.getElementById('detailCardStatus');
    const longTextEl = document.getElementById('detailCardLongText');

    if (idxEl) idxEl.textContent = String(itemIdx + 1).padStart(2, '0');
    if (secTagEl) {
      if (item.secLetter || item.secTitle) {
        secTagEl.textContent = `${item.secLetter ? item.secLetter + ' · ' : ''}${item.secTitle || ''}`.trim();
        secTagEl.style.display = 'inline-block';
      } else {
        secTagEl.style.display = 'none';
      }
    }
    if (titleEl) titleEl.textContent = card.code || card.title || 'BRAND';
    if (imageEl) {
      imageEl.onerror = () => {
        imageEl.onerror = null;
        imageEl.src = window.FALLBACK_MEDIA_SVG || 'media/_placeholder.png';
      };
      imageEl.src = card._tempPreview || card.image || 'media/_placeholder.png';
      imageEl.alt = card.title || card.code || 'Aperçu';
    }
    if (codeEl) codeEl.textContent = card.code || 'BRAND';
    if (descEl) descEl.textContent = card.desc || '';
    if (typeEl) typeEl.textContent = card.type || 'IDENTITÉ';
    if (statusEl) statusEl.textContent = card.version || card.status || card.phase || 'v 0.1.0';
    if (longTextEl) {
      longTextEl.textContent = card.details || card.desc || 'Présentation détaillée du projet et démarches de conception.';
    }

    updateAdminNavArrows(index);
  }

  function navigateAdminDetail(direction) {
    const nextIndex = currentAdminDetailIndex + direction;
    if (nextIndex >= 0 && nextIndex < currentAdminDetailList.length) {
      displayAdminCardDetailByIndex(nextIndex);
    }
  }

  function openAdminCardDetail(secIdx, itemIdx) {
    currentAdminDetailList = getAdminDetailCardsList();
    const foundIdx = currentAdminDetailList.findIndex(entry => entry.secIdx === secIdx && entry.itemIdx === itemIdx);
    const targetIdx = foundIdx !== -1 ? foundIdx : 0;

    displayAdminCardDetailByIndex(targetIdx);

    const modal = document.getElementById('cardDetailModal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAdminCardDetail() {
    closeDetailLinkModal();
    const modal = document.getElementById('cardDetailModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeDetailCard = null;
    currentAdminDetailIndex = -1;
    renderPage();
  }

  function saveDetailLinkSelection() {
    const longTextEl = document.getElementById('detailCardLongText');
    const sel = window.getSelection();
    if (longTextEl && sel && sel.rangeCount && longTextEl.contains(sel.anchorNode)) {
      savedDetailLinkRange = sel.getRangeAt(0).cloneRange();
    } else {
      savedDetailLinkRange = null;
    }
  }

  function openDetailLinkModal() {
    if (!detailLinkModal) return;
    const selected = savedDetailLinkRange ? savedDetailLinkRange.toString() : '';
    if (detailLinkText) detailLinkText.value = selected.trim();
    if (detailLinkUrl) detailLinkUrl.value = '';
    detailLinkModal.classList.add('is-active');
    detailLinkModal.setAttribute('aria-hidden', 'false');
    const focusEl = selected.trim() ? detailLinkUrl : detailLinkText;
    setTimeout(() => focusEl?.focus(), 0);
  }

  function closeDetailLinkModal() {
    if (!detailLinkModal) return;
    detailLinkModal.classList.remove('is-active');
    detailLinkModal.setAttribute('aria-hidden', 'true');
  }

  function normalizeDetailHref(raw) {
    let url = String(raw || '').trim().replace(/\\/g, '/');
    if (!url) return '';
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url) && !url.includes('/') && !url.includes('.')) {
      url = 'https://' + url;
    }
    if (!/^[a-zA-Z0-9_\-\.\/:\?#=&%]+$/i.test(url)) return '';
    return url;
  }

  function applyDetailLink() {
    const longTextEl = document.getElementById('detailCardLongText');
    if (!longTextEl || !activeDetailCard) {
      closeDetailLinkModal();
      return;
    }

    const href = normalizeDetailHref(detailLinkUrl?.value);
    if (!href) {
      detailLinkUrl?.focus();
      return;
    }

    const label = String(detailLinkText?.value || '').trim() || href;
    const isFile = /\.(zip|rar|7z|tar|gz|pdf)$/i.test(href);
    const downloadAttr = isFile ? ' download' : '';
    const snippet = `<a href="${href}"${downloadAttr}>${label.replace(/<\/a>/gi, '')}</a>`;

    longTextEl.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();

    if (savedDetailLinkRange && longTextEl.contains(savedDetailLinkRange.commonAncestorContainer)) {
      savedDetailLinkRange.deleteContents();
      const node = document.createTextNode(snippet);
      savedDetailLinkRange.insertNode(node);
      savedDetailLinkRange.setStartAfter(node);
      savedDetailLinkRange.collapse(true);
      sel.addRange(savedDetailLinkRange);
    } else {
      const prefix = longTextEl.innerText && !longTextEl.innerText.endsWith('\n') ? '\n' : '';
      longTextEl.appendChild(document.createTextNode(prefix + snippet));
    }

    activeDetailCard.card.details = longTextEl.innerText.trim();
    savedDetailLinkRange = null;
    closeDetailLinkModal();
  }

  function setupAuthListeners() {
    loginBtn.addEventListener('click', () => {
      const val = secretInput.value.trim();
      if (val === ADMIN_SECRET) {
        setAuthenticated(true);
        showCMS();
      } else {
        alert('Clé incorrecte.');
      }
    });
    secretInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }

  function collapseSidebar() {
    cmsSidebar.classList.add('is-collapsed');
    cmsWorkspace.classList.add('is-expanded');
    expandSidebarBtn.classList.remove('hidden');
  }

  function expandSidebar() {
    cmsSidebar.classList.remove('is-collapsed');
    cmsWorkspace.classList.remove('is-expanded');
    expandSidebarBtn.classList.add('hidden');
  }

  function setupSidebarToggleListeners() {
    collapseSidebarBtn.addEventListener('click', collapseSidebar);
    expandSidebarBtn.addEventListener('click', () => {
      if (isPreviewMode) {
        togglePreviewBtn.click();
      }
      expandSidebar();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeConfirmModal();
      }
    });
  }

  function setupActionsListeners() {
    saveBtn.addEventListener('click', () => {
      syncSidebarToContent();
      if (saveContent(currentContent)) {
        showToast('Modifications enregistrées localement !');
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    });

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        syncSidebarToContent();
        if (exportContentJSON(currentContent)) {
          showToast('Fichier content.json téléchargé !');
        } else {
          alert('Erreur lors de l\'exportation.');
        }
      });
    }

    resetBtn.addEventListener('click', () => {
      showConfirmModal(
        'RÉINITIALISER TOUT LE SITE ?',
        'Cette action réinitialisera les modifications locales.',
        () => {
          localStorage.removeItem(window.storageUtils.STORAGE_KEY);
          location.reload();
        }
      );
    });

    togglePreviewBtn.addEventListener('click', () => {
      isPreviewMode = !isPreviewMode;
      if (isPreviewMode) {
        wasCollapsedBeforePreview = cmsSidebar.classList.contains('is-collapsed');
        collapseSidebar();
        document.body.classList.add('cms-preview-mode');
        togglePreviewBtn.textContent = 'Mode Édition';
        togglePreviewBtn.classList.add('active');
        expandSidebarBtn.querySelector('span:last-child').textContent = 'QUITTER APERÇU';
        showToast('Mode Aperçu activé');
      } else {
        document.body.classList.remove('cms-preview-mode');
        togglePreviewBtn.textContent = 'Aperçu Direct';
        togglePreviewBtn.classList.remove('active');
        expandSidebarBtn.querySelector('span:last-child').textContent = 'MENU CMS';
        if (!wasCollapsedBeforePreview) {
          expandSidebar();
        }
      }
      renderPage();
    });
  }

  const THEME_PRESETS = {
    default: {
      bgStart: '#e3e3e3', bgEnd: '#d6d6d6', bgAngle: '135deg',
      cellStart: '#f0f0f0', cellEnd: '#e6e6e6', cellAngle: '145deg',
      borderStart: '#d8d8d8', borderEnd: '#c4c4c4', borderAngle: '135deg',
      text: '#2e2e2e', textSoft: '#585858', textFaint: '#9b9b9b', accent: '#d71921'
    },
    dark: {
      bgStart: '#141414', bgEnd: '#090909', bgAngle: '135deg',
      cellStart: '#1e1e1e', cellEnd: '#131313', cellAngle: '145deg',
      borderStart: '#343434', borderEnd: '#222222', borderAngle: '135deg',
      text: '#e0e0e0', textSoft: '#a0a0a0', textFaint: '#666666', accent: '#ff3b30'
    },
    white: {
      bgStart: '#ffffff', bgEnd: '#f0f0f0', bgAngle: '135deg',
      cellStart: '#ffffff', cellEnd: '#f8f8f8', cellAngle: '145deg',
      borderStart: '#e5e5e5', borderEnd: '#d2d2d2', borderAngle: '135deg',
      text: '#111111', textSoft: '#666666', textFaint: '#aaaaaa', accent: '#e60000'
    },
    warm: {
      bgStart: '#ebe4d8', bgEnd: '#ded5c5', bgAngle: '135deg',
      cellStart: '#f6f0e6', cellEnd: '#ece2d2', cellAngle: '145deg',
      borderStart: '#dad0be', borderEnd: '#c5b8a1', borderAngle: '135deg',
      text: '#2c2724', textSoft: '#6a625b', textFaint: '#9f958c', accent: '#c44520'
    },
    cyber: {
      bgStart: '#091510', bgEnd: '#030806', bgAngle: '135deg',
      cellStart: '#0f241a', cellEnd: '#07160e', cellAngle: '145deg',
      borderStart: '#1a4732', borderEnd: '#0c281b', borderAngle: '135deg',
      text: '#7fffa7', textSoft: '#4cd478', textFaint: '#227744', accent: '#00ff66'
    }
  };

  function formatHex(val, fallback) {
    if (!val) return fallback;
    let str = val.trim();
    if (!str.startsWith('#')) str = '#' + str;
    return /^#[0-9A-Fa-f]{6}$/.test(str) ? str : fallback;
  }

  function syncColorInput(prop, val) {
    const textInput = document.getElementById(`theme${prop}`);
    const pickerInput = document.getElementById(`theme${prop}Picker`);
    if (textInput) textInput.value = val;
    if (pickerInput) pickerInput.value = formatHex(val, '#000000');
  }

  function syncAngleUI(prefix, valStr) {
    const raw = String(valStr || '135deg').replace('deg', '').replace('°', '').trim();
    const num = parseInt(raw, 10);
    const validNum = isNaN(num) ? 135 : num;

    const range = document.getElementById(`theme${prefix}AngleRange`);
    const badge = document.getElementById(`theme${prefix}AngleVal`);
    if (range) range.value = validNum;
    if (badge) badge.textContent = `${validNum}°`;
  }

  function syncBorderRadiusUI(valStr) {
    const raw = String(valStr || '22px').trim();
    const num = parseInt(raw, 10);
    const validNum = isNaN(num) ? 22 : num;
    const normalized = `${validNum}px`;

    const borderRadiusRange = document.getElementById('themeBorderRadiusRange');
    const borderRadiusVal = document.getElementById('themeBorderRadiusVal');

    if (borderRadiusRange) borderRadiusRange.value = validNum;
    if (borderRadiusVal) borderRadiusVal.textContent = normalized;
  }

  function applyThemeFromSidebar() {
    const rangeEl = document.getElementById('themeBorderRadiusRange');
    const currentRadius = rangeEl ? `${rangeEl.value}px` : "22px";

    const bgAngle = `${document.getElementById('themeBgAngleRange')?.value || 135}deg`;
    const cellAngle = `${document.getElementById('themeCellAngleRange')?.value || 145}deg`;
    const borderAngle = `${document.getElementById('themeBorderAngleRange')?.value || 135}deg`;

    currentContent.theme = {
      bgStart: document.getElementById('themeBgStart')?.value || '#e3e3e3',
      bgEnd: document.getElementById('themeBgEnd')?.value || '#d6d6d6',
      bgAngle: bgAngle,
      bg: document.getElementById('themeBgStart')?.value || '#e3e3e3',

      cellStart: document.getElementById('themeCellStart')?.value || '#f0f0f0',
      cellEnd: document.getElementById('themeCellEnd')?.value || '#e6e6e6',
      cellAngle: cellAngle,
      cell: document.getElementById('themeCellStart')?.value || '#f0f0f0',

      borderStart: document.getElementById('themeBorderStart')?.value || '#d8d8d8',
      borderEnd: document.getElementById('themeBorderEnd')?.value || '#c4c4c4',
      borderAngle: borderAngle,
      border: document.getElementById('themeBorderStart')?.value || '#d8d8d8',

      text: document.getElementById('themeText')?.value || '#2e2e2e',
      textSoft: document.getElementById('themeTextSoft')?.value || '#585858',
      textFaint: document.getElementById('themeTextFaint')?.value || '#9b9b9b',
      accent: document.getElementById('themeAccent')?.value || '#d71921',
      fontDot: document.getElementById('themeFontDot')?.value || "'Doto', ui-monospace, monospace",
      fontMono: document.getElementById('themeFontMono')?.value || "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: document.getElementById('themeFontSize')?.value || "12px",
      textTransform: document.getElementById('themeTextTransform')?.value || "uppercase",
      letterSpacing: document.getElementById('themeLetterSpacing')?.value || "0.02em",
      borderRadius: currentRadius
    };
    applyTheme(currentContent.theme);
  }

  function fillSidebarFields() {
    const theme = currentContent.theme || THEME_PRESETS.default;
    syncColorInput('BgStart', theme.bgStart || theme.bg || '#e3e3e3');
    syncColorInput('BgEnd', theme.bgEnd || theme.bg || '#d6d6d6');
    syncAngleUI('Bg', theme.bgAngle || '135deg');

    syncColorInput('CellStart', theme.cellStart || theme.cell || '#f0f0f0');
    syncColorInput('CellEnd', theme.cellEnd || theme.cell || '#e6e6e6');
    syncAngleUI('Cell', theme.cellAngle || '145deg');

    syncColorInput('BorderStart', theme.borderStart || theme.border || '#d8d8d8');
    syncColorInput('BorderEnd', theme.borderEnd || theme.border || '#c4c4c4');
    syncAngleUI('Border', theme.borderAngle || '135deg');

    syncColorInput('Text', theme.text || '#2e2e2e');
    syncColorInput('TextSoft', theme.textSoft || '#585858');
    syncColorInput('TextFaint', theme.textFaint || '#9b9b9b');
    syncColorInput('Accent', theme.accent || '#d71921');

    const fontDotEl = document.getElementById('themeFontDot');
    const fontMonoEl = document.getElementById('themeFontMono');
    const fontSizeEl = document.getElementById('themeFontSize');
    const textTransformEl = document.getElementById('themeTextTransform');
    const letterSpacingEl = document.getElementById('themeLetterSpacing');
    if (fontDotEl && theme.fontDot) fontDotEl.value = theme.fontDot;
    if (fontMonoEl && theme.fontMono) fontMonoEl.value = theme.fontMono;
    if (fontSizeEl && theme.fontSize) fontSizeEl.value = theme.fontSize;
    if (textTransformEl && theme.textTransform) textTransformEl.value = theme.textTransform;
    if (letterSpacingEl && theme.letterSpacing) letterSpacingEl.value = theme.letterSpacing;

    syncBorderRadiusUI(theme.borderRadius || '22px');

    const site = currentContent.site || {};
    const titleEl = document.getElementById('siteTitle');
    const subtitleEl = document.getElementById('siteSubtitle');
    const cell1TitleEl = document.getElementById('cell1Title');
    const cell1BodyEl = document.getElementById('cell1Body');
    const cell2TitleEl = document.getElementById('cell2Title');
    const cell2BodyEl = document.getElementById('cell2Body');
    const claimEl = document.getElementById('heroClaim');
    const introEl = document.getElementById('intro');
    const aboutEl = document.getElementById('about');

    if (titleEl) titleEl.value = site.title || 'BRICEMG / STUDIO';
    if (subtitleEl) subtitleEl.value = site.subtitle || 'DESIGN / CODE / VISION';
    if (cell1TitleEl) cell1TitleEl.value = site.cell1Title || 'BRICEMG';
    if (cell1BodyEl) cell1BodyEl.value = site.cell1Body !== undefined ? site.cell1Body : 'STUDIO\nDESIGN / CODE / VISION\nINDEX V0.1\nLANGUAGE : EN';
    if (cell2TitleEl) cell2TitleEl.value = site.cell2Title || 'ABOUT';
    if (cell2BodyEl) cell2BodyEl.value = site.cell2Body !== undefined ? site.cell2Body : 'CREATE\nJe crée des interfaces, des identités visuelles et des expériences web qui donnent du sens à une idée.\nRÉFLEXION\nPENSER, CONCEVOIR ET DÉVELOPPER DE A À Z\nOBJECTIF\nJe conçois et développe des projets à la croisée du design, du produit et du code.';
    if (claimEl) claimEl.value = site.heroClaim || '';
    if (introEl) introEl.value = site.intro || '';
    if (aboutEl) aboutEl.value = site.about || '';

    const footer = currentContent.footer || {};
    const f1 = document.getElementById('footerCol1');
    const f2 = document.getElementById('footerCol2');
    const f3 = document.getElementById('footerCol3');
    const f4 = document.getElementById('footerCol4');
    const f5 = document.getElementById('footerCol5');
    if (f1) f1.value = footer.col1 || 'BRICEMG';
    if (f2) f2.value = footer.col2 || 'DESIGN / CODE / VISION';
    if (f3) f3.value = footer.col3 || 'DESIGN / CODE / VISION';
    if (f4) f4.value = footer.col4 || 'bonjour@bricemg.dev';
    if (f5) f5.value = footer.col5 || '© 2026';
  }

  function syncSidebarToContent() {
    applyThemeFromSidebar();
    const cell1TitleVal = document.getElementById('cell1Title')?.value.trim() || 'BRICEMG';
    const cell1BodyVal = document.getElementById('cell1Body')?.value || '';
    const cell2TitleVal = document.getElementById('cell2Title')?.value.trim() || 'NOUS';
    const cell2BodyVal = document.getElementById('cell2Body')?.value || '';

    currentContent.site = currentContent.site || {};
    currentContent.site.cell1Title = cell1TitleVal;
    currentContent.site.cell1Body = cell1BodyVal;
    currentContent.site.cell2Title = cell2TitleVal;
    currentContent.site.cell2Body = cell2BodyVal;
    currentContent.site.heroClaim = document.getElementById('heroClaim')?.value.trim() || '';
    if (document.getElementById('siteTitle')) {
      currentContent.site.title = document.getElementById('siteTitle').value.trim();
    }
    if (document.getElementById('siteSubtitle')) {
      currentContent.site.subtitle = document.getElementById('siteSubtitle').value.trim();
    }

    currentContent.footer = {
      col1: document.getElementById('footerCol1')?.value.trim() || 'BRICEMG',
      col2: document.getElementById('footerCol2')?.value.trim() || 'DESIGN / CODE / VISION',
      col3: document.getElementById('footerCol3')?.value.trim() || 'DESIGN / CODE / VISION',
      col4: document.getElementById('footerCol4')?.value.trim() || 'bonjour@bricemg.dev',
      col5: document.getElementById('footerCol5')?.value.trim() || '© 2026'
    };
  }

  function setupThemeAndSiteListeners() {
    const themeProps = [
      'BgStart', 'BgEnd',
      'CellStart', 'CellEnd',
      'BorderStart', 'BorderEnd',
      'Text', 'TextSoft', 'TextFaint', 'Accent'
    ];
    themeProps.forEach(prop => {
      const textInput = document.getElementById(`theme${prop}`);
      const pickerInput = document.getElementById(`theme${prop}Picker`);
      if (textInput && pickerInput) {
        pickerInput.addEventListener('input', () => {
          textInput.value = pickerInput.value;
          applyThemeFromSidebar();
        });
        textInput.addEventListener('input', () => {
          const hex = formatHex(textInput.value, null);
          if (hex) pickerInput.value = hex;
          applyThemeFromSidebar();
        });
      }
    });

    ['Bg', 'Cell', 'Border'].forEach(key => {
      const angleRange = document.getElementById(`theme${key}AngleRange`);
      const angleVal = document.getElementById(`theme${key}AngleVal`);
      if (angleRange) {
        angleRange.addEventListener('input', () => {
          if (angleVal) angleVal.textContent = `${angleRange.value}°`;
          applyThemeFromSidebar();
        });
      }
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        const preset = THEME_PRESETS[presetKey];
        if (preset) {
          syncColorInput('BgStart', preset.bgStart || preset.bg);
          syncColorInput('BgEnd', preset.bgEnd || preset.bg);
          syncAngleUI('Bg', preset.bgAngle || '135deg');

          syncColorInput('CellStart', preset.cellStart || preset.cell);
          syncColorInput('CellEnd', preset.cellEnd || preset.cell);
          syncAngleUI('Cell', preset.cellAngle || '145deg');

          syncColorInput('BorderStart', preset.borderStart || preset.border);
          syncColorInput('BorderEnd', preset.borderEnd || preset.border);
          syncAngleUI('Border', preset.borderAngle || '135deg');

          syncColorInput('Text', preset.text);
          syncColorInput('TextSoft', preset.textSoft || '#585858');
          syncColorInput('TextFaint', preset.textFaint || '#9b9b9b');
          syncColorInput('Accent', preset.accent);
          applyThemeFromSidebar();
          showToast(`Palette ${btn.textContent} appliquée !`);
        }
      });
    });

    ['themeFontDot', 'themeFontMono', 'themeFontSize', 'themeTextTransform', 'themeLetterSpacing'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          applyThemeFromSidebar();
          showToast('Style typographique mis à jour');
        });
      }
    });

    const borderRadiusRange = document.getElementById('themeBorderRadiusRange');
    if (borderRadiusRange) {
      borderRadiusRange.addEventListener('input', () => {
        syncBorderRadiusUI(`${borderRadiusRange.value}px`);
        applyThemeFromSidebar();
      });
      borderRadiusRange.addEventListener('change', () => {
        showToast(`Arrondi défini sur ${borderRadiusRange.value}px`);
      });
    }

    [
      'cell1Title', 'cell1Body', 'cell2Title', 'cell2Body',
      'siteTitle', 'siteSubtitle', 'heroClaim', 'intro', 'about',
      'footerCol1', 'footerCol2', 'footerCol3', 'footerCol4', 'footerCol5'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          syncSidebarToContent();
          renderPage();
        });
      }
    });
  }

  function setupModalListeners() {
    confirmCancelBtn.addEventListener('click', closeConfirmModal);
    confirmActionBtn.addEventListener('click', () => {
      if (typeof confirmCallback === 'function') {
        confirmCallback();
      }
      closeConfirmModal();
    });
    confirmModal?.addEventListener('click', (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });

    if (mediaModal) {
      mediaModalCancelBtn?.addEventListener('click', closeMediaModal);
      mediaModal.addEventListener('click', (e) => {
        if (e.target === mediaModal) closeMediaModal();
      });

      mediaModalBrowseBtn?.addEventListener('click', () => {
        mediaModalFileInput?.click();
      });

      mediaModalFileInput?.addEventListener('change', () => {
        const file = mediaModalFileInput.files?.[0];
        if (file) {
          selectedLocalFile = file;
          const normPath = 'media/' + file.name;
          if (mediaModalPathInput) mediaModalPathInput.value = normPath;
          if (mediaModalCurrentPath) mediaModalCurrentPath.textContent = normPath;

          const previewUrl = URL.createObjectURL(file);
          if (mediaModalPreview) mediaModalPreview.src = previewUrl;

          if (mediaModalDownloadWrap) mediaModalDownloadWrap.style.display = 'block';
        }
      });

      mediaModalDownloadBtn?.addEventListener('click', () => {
        if (selectedLocalFile) {
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = URL.createObjectURL(selectedLocalFile);
          downloadAnchor.download = selectedLocalFile.name;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
          showToast(`Copie téléchargée : ${selectedLocalFile.name} (à glisser dans media/)`);
        }
      });

      mediaModalPathInput?.addEventListener('input', () => {
        const val = mediaModalPathInput.value.trim();
        if (val) {
          if (mediaModalCurrentPath) mediaModalCurrentPath.textContent = val;
          if (mediaModalPreview) mediaModalPreview.src = val;
        }
      });

      mediaModalSaveBtn?.addEventListener('click', () => {
        if (editingMediaTarget) {
          const { secIdx, itemIdx } = editingMediaTarget;
          const sections = currentContent.sections || [];
          const card = sections[secIdx]?.items?.[itemIdx];
          if (card) {
            let path = (mediaModalPathInput?.value || '').trim();
            if (!path) path = 'media/_placeholder.png';
            if (!path.startsWith('media/') && !path.startsWith('http://') && !path.startsWith('https://') && !path.startsWith('data:')) {
              path = 'media/' + path;
            }
            card.image = path;
            if (selectedLocalFile) {
              card._tempPreview = URL.createObjectURL(selectedLocalFile);
            } else {
              delete card._tempPreview;
            }
            renderPage();
            showToast(`Image définie : ${path}`);
          }
        }
        closeMediaModal();
      });
    }

    if (detailLinkModal) {
      detailLinkCancelBtn?.addEventListener('click', closeDetailLinkModal);
      detailLinkOkBtn?.addEventListener('click', applyDetailLink);
      detailLinkModal.addEventListener('click', (e) => {
        if (e.target === detailLinkModal) closeDetailLinkModal();
      });
      [detailLinkText, detailLinkUrl].forEach((input) => {
        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyDetailLink();
          }
        });
      });
    }

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-href]');
      if (link && !document.activeElement?.isContentEditable) {
        e.preventDefault();
        const targetUrl = (link.getAttribute('data-href') || '').trim();
        if (targetUrl) {
          if (/^(javascript|vbscript|data):/i.test(targetUrl)) {
            console.warn('Protocole non autorisé bloqué :', targetUrl);
            return;
          }
          const isDownload = link.hasAttribute('download') || /\.(zip|rar|7z|tar|gz|pdf)$/i.test(targetUrl);
          if (isDownload) {
            const a = document.createElement('a');
            a.href = targetUrl;
            const dlVal = link.getAttribute('download');
            a.download = (dlVal && dlVal !== 'true') ? dlVal : (targetUrl.split('/').pop() || 'download');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else if (link.hasAttribute('data-external') || /^https?:\/\//i.test(targetUrl)) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          } else if (/^mailto:/i.test(targetUrl)) {
            window.location.href = targetUrl;
          } else {
            window.location.href = targetUrl;
          }
          return;
        }
      }

      if (e.target.closest('#cardDetailCloseBtn')) {
        closeAdminCardDetail();
      } else if (e.target.id === 'cardDetailModal') {
        closeAdminCardDetail();
      } else if (e.target.closest('#detailCardPrevBtn') || e.target.closest('#detailCardSidePrevBtn')) {
        e.preventDefault();
        navigateAdminDetail(-1);
      } else if (e.target.closest('#detailCardNextBtn') || e.target.closest('#detailCardSideNextBtn')) {
        e.preventDefault();
        navigateAdminDetail(1);
      }
    });

    window.addEventListener('keydown', (e) => {
      const detailModal = document.getElementById('cardDetailModal');
      const isModalOpen = detailModal && detailModal.classList.contains('is-open');

      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        if (detailLinkModal && detailLinkModal.classList.contains('is-active')) {
          closeDetailLinkModal();
          return;
        }
        closeAdminCardDetail();
      } else if (e.key === 'ArrowLeft') {
        if (document.activeElement && document.activeElement.isContentEditable) return;
        e.preventDefault();
        navigateAdminDetail(-1);
      } else if (e.key === 'ArrowRight') {
        if (document.activeElement && document.activeElement.isContentEditable) return;
        e.preventDefault();
        navigateAdminDetail(1);
      }
    });

    document.addEventListener('input', (e) => {
      if (!activeDetailCard) return;
      if (e.target.id === 'detailCardLongText') {
        activeDetailCard.card.details = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardTitle') {
        const val = e.target.innerText.trim();
        activeDetailCard.card.code = val;
        activeDetailCard.card.title = val;
      } else if (e.target.id === 'detailCardDesc') {
        activeDetailCard.card.desc = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardType') {
        activeDetailCard.card.type = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardStatus') {
        activeDetailCard.card.version = e.target.innerText.trim();
      }
    });
  }

  function setupAppDelegation() {
    appEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('[data-action="insert-detail-link"]')) {
        e.preventDefault();
        saveDetailLinkSelection();
      }
    });

    appEl.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const secIdx = parseInt(target.getAttribute('data-sec-idx'), 10);
      const itemIdx = parseInt(target.getAttribute('data-item-idx'), 10);

      if (action === 'insert-detail-link') {
        e.preventDefault();
        openDetailLinkModal();
        return;
      }

      if (action === 'open-card-detail') {
        e.preventDefault();
        openAdminCardDetail(secIdx, itemIdx);
        return;
      }

      if (isPreviewMode) return;
      const sections = currentContent.sections || [];
      const currentSec = sections[secIdx];

      // --- ACTIONS CARTES ---
      if (action === 'edit-card-media') {
        showMediaModal(secIdx, itemIdx);
        return;
      } else if (action === 'move-card-prev') {
        if (!currentSec || itemIdx <= 0) return;
        const temp = currentSec.items[itemIdx];
        currentSec.items[itemIdx] = currentSec.items[itemIdx - 1];
        currentSec.items[itemIdx - 1] = temp;
        renderPage();
      } else if (action === 'move-card-next') {
        if (!currentSec || itemIdx >= currentSec.items.length - 1) return;
        const temp = currentSec.items[itemIdx];
        currentSec.items[itemIdx] = currentSec.items[itemIdx + 1];
        currentSec.items[itemIdx + 1] = temp;
        renderPage();
      } else if (action === 'toggle-card-visibility') {
        if (!currentSec || !currentSec.items[itemIdx]) return;
        currentSec.items[itemIdx].visible = !currentSec.items[itemIdx].visible;
        renderPage();
        showToast(currentSec.items[itemIdx].visible ? 'Carte rendue visible' : 'Carte masquée');
      } else if (action === 'toggle-card-full') {
        if (!currentSec || !currentSec.items[itemIdx]) return;
        const currentVal = currentSec.items[itemIdx].full === true || currentSec.items[itemIdx].hasDetail === true;
        currentSec.items[itemIdx].full = !currentVal;
        currentSec.items[itemIdx].hasDetail = !currentVal;
        renderPage();
        showToast(!currentVal ? 'Vue détaillée activée (FULL)' : 'Vue détaillée désactivée (STANDARD)');
      } else if (action === 'toggle-card-media') {
        if (!currentSec || !currentSec.items[itemIdx]) return;
        const currentMedia = currentSec.items[itemIdx].showMedia !== false;
        currentSec.items[itemIdx].showMedia = !currentMedia;
        renderPage();
        showToast(!currentMedia ? 'Image affichée' : 'Image masquée (carte compacte)');
      } else if (action === 'delete-card') {
        if (!currentSec || !currentSec.items[itemIdx]) return;
        const cardTitle = currentSec.items[itemIdx].title || 'cette carte';
        showConfirmModal(
          'SUPPRIMER LA CARTE ?',
          `Voulez-vous vraiment supprimer définitivement "${cardTitle}" ?`,
          () => {
            currentSec.items.splice(itemIdx, 1);
            renderPage();
            showToast('Carte supprimée.');
          }
        );
      } else if (action === 'add-card') {
        if (!currentSec) return;
        const newItem = {
          id: 'card_' + Date.now(),
          title: 'NOUVELLE CARTE',
          code: 'CODE',
          desc: 'Description du projet ou du service.',
          type: 'IDENTITÉ',
          status: 'ACTIF',
          image: 'media/_placeholder.png',
          visible: true
        };
        currentSec.items.push(newItem);
        renderPage();
        showToast('Nouvelle carte ajoutée !');
      }
      // --- ACTIONS SECTIONS ---
      else if (action === 'move-sec-prev') {
        if (secIdx <= 0) return;
        const temp = sections[secIdx];
        sections[secIdx] = sections[secIdx - 1];
        sections[secIdx - 1] = temp;
        renderPage();
      } else if (action === 'move-sec-next') {
        if (secIdx >= sections.length - 1) return;
        const temp = sections[secIdx];
        sections[secIdx] = sections[secIdx + 1];
        sections[secIdx + 1] = temp;
        renderPage();
      } else if (action === 'toggle-sec-visibility') {
        if (!currentSec) return;
        currentSec.visible = currentSec.visible === false ? true : false;
        renderPage();
        showToast(currentSec.visible ? 'Section rendue visible' : 'Section masquée');
      } else if (action === 'delete-sec') {
        if (!currentSec) return;
        const secTitle = currentSec.title || 'cette section';
        showConfirmModal(
          'SUPPRIMER LA SECTION ?',
          `Voulez-vous vraiment supprimer la section "${secTitle}" et toutes ses cartes ?`,
          () => {
            sections.splice(secIdx, 1);
            renderPage();
            showToast('Section supprimée.');
          }
        );
      } else if (action === 'add-section') {
        // Calcule la lettre suivante (A=65, B=66, C=67...)
        const nextLetter = String.fromCharCode(65 + sections.length);
        const newSec = {
          id: 'sec_' + Date.now(),
          letter: nextLetter,
          title: 'NOUVELLE SECTION',
          visible: true,
          items: [
            {
              id: 'card_' + Date.now(),
              title: 'PREMIÈRE CARTE',
              code: 'CODE',
              desc: 'Description de la réalisation...',
              type: 'R&D',
              status: 'EN COURS',
              visible: true
            }
          ]
        };
        sections.push(newSec);
        renderPage();
        showToast(`Section ${nextLetter} ajoutée !`);
      }
    });

    // Édition directe inline
    appEl.addEventListener('input', (e) => {
      const target = e.target;
      if (!target.classList.contains('cms-editable')) return;
      const field = target.getAttribute('data-field');
      const action = target.getAttribute('data-action');
      const secIdx = parseInt(target.getAttribute('data-sec-idx'), 10);
      const itemIdx = parseInt(target.getAttribute('data-item-idx'), 10);
      const plateIdx = parseInt(target.getAttribute('data-plate-idx'), 10);
      const footerKey = target.getAttribute('data-footer-key');
      const val = target.innerText.trim();

      if (footerKey) {
        currentContent.footer = currentContent.footer || {};
        currentContent.footer[footerKey] = val;
        const colNum = footerKey.replace('col', '');
        const inputEl = document.getElementById('footerCol' + colNum);
        if (inputEl) inputEl.value = val;
      } else if (action === 'edit-sec-letter') {
        if (currentContent.sections[secIdx]) {
          currentContent.sections[secIdx].letter = val;
        }
      } else if (action === 'edit-sec-title') {
        if (currentContent.sections[secIdx]) {
          currentContent.sections[secIdx].title = val;
        }
      } else if (field === 'site-cell1-title') {
        currentContent.site = currentContent.site || {};
        currentContent.site.cell1Title = val;
        const inputEl = document.getElementById('cell1Title');
        if (inputEl) inputEl.value = val;
      } else if (field === 'site-cell1-body') {
        currentContent.site = currentContent.site || {};
        const textVal = target.innerText.replace(/\r\n/g, '\n');
        currentContent.site.cell1Body = textVal;
        const inputEl = document.getElementById('cell1Body');
        if (inputEl) inputEl.value = textVal;
      } else if (field === 'site-cell2-title') {
        currentContent.site = currentContent.site || {};
        currentContent.site.cell2Title = val;
        const inputEl = document.getElementById('cell2Title');
        if (inputEl) inputEl.value = val;
      } else if (field === 'site-cell2-body') {
        currentContent.site = currentContent.site || {};
        const textVal = target.innerText.replace(/\r\n/g, '\n');
        currentContent.site.cell2Body = textVal;
        const inputEl = document.getElementById('cell2Body');
        if (inputEl) inputEl.value = textVal;
      } else if (field === 'site-hero-claim') {
        currentContent.site = currentContent.site || {};
        const textVal = target.innerText.replace(/\r\n/g, '\n');
        currentContent.site.heroClaim = textVal;
        const inputEl = document.getElementById('heroClaim');
        if (inputEl) inputEl.value = textVal;
      } else if (field && !isNaN(secIdx) && !isNaN(itemIdx)) {
        const sec = currentContent.sections[secIdx];
        if (sec && sec.items[itemIdx]) {
          sec.items[itemIdx][field] = val;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();