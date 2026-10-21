(function () {
  const { ADMIN_SECRET, getContent, saveContent, exportContentJSON, applyTheme, isAuthenticated, setAuthenticated } = window.storageUtils;
  const { buildPageHTML } = window.templates;
  const { CanvasAnimation } = window;

  let currentContent = null;
  let confirmCallback = null;
  let isPreviewMode = false;
  let wasCollapsedBeforePreview = false;

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

  let editingMediaTarget = null;
  let selectedLocalFile = null;
  let activeDetailCard = null;

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
      const animation = new CanvasAnimation(canvas);
      animation.init(field);
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

  function openAdminCardDetail(secIdx, itemIdx) {
    const sections = currentContent?.sections || [];
    const sec = sections[secIdx];
    if (!sec || !sec.items || !sec.items[itemIdx]) return;
    const card = sec.items[itemIdx];

    activeDetailCard = { secIdx, itemIdx, card };

    const modal = document.getElementById('cardDetailModal');
    if (!modal) return;

    const idxEl = document.getElementById('detailCardIdx');
    const titleEl = document.getElementById('detailCardTitle');
    const imageEl = document.getElementById('detailCardImage');
    const codeEl = document.getElementById('detailCardCode');
    const descEl = document.getElementById('detailCardDesc');
    const typeEl = document.getElementById('detailCardType');
    const statusEl = document.getElementById('detailCardStatus');
    const longTextEl = document.getElementById('detailCardLongText');

    if (idxEl) idxEl.textContent = String(itemIdx + 1).padStart(2, '0');
    if (titleEl) titleEl.textContent = card.title || 'NOUVELLE CARTE';
    if (imageEl) {
      imageEl.src = card._tempPreview || card.image || 'media/_placeholder.png';
      imageEl.alt = card.title || 'Aperçu';
    }
    if (codeEl) codeEl.textContent = card.code || 'CODE';
    if (descEl) descEl.textContent = card.desc || '';
    if (typeEl) typeEl.textContent = card.type || 'IDENTITÉ';
    if (statusEl) statusEl.textContent = card.status || card.phase || 'ACTIF';
    if (longTextEl) {
      longTextEl.textContent = card.details || card.desc || 'Présentation détaillée du projet et démarches de conception.';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAdminCardDetail() {
    const modal = document.getElementById('cardDetailModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeDetailCard = null;
    renderPage();
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

  const THEME_PRESETS = (window.adminForm && window.adminForm.THEME_PRESETS) || {
    default: { bg: '#e3e3e3', cell: '#f0f0f0', border: '#d8d8d8', text: '#2e2e2e', textSoft: '#585858', textFaint: '#9b9b9b', accent: '#d71921' },
    dark: { bg: '#0e0e0e', cell: '#181818', border: '#292929', text: '#e0e0e0', textSoft: '#a0a0a0', textFaint: '#666666', accent: '#ff3b30' },
    white: { bg: '#fbfbfb', cell: '#ffffff', border: '#e5e5e5', text: '#111111', textSoft: '#666666', textFaint: '#aaaaaa', accent: '#e60000' },
    warm: { bg: '#e8e2d5', cell: '#f4ede2', border: '#d8cfbe', text: '#2c2724', textSoft: '#6a625b', textFaint: '#9f958c', accent: '#c44520' },
    cyber: { bg: '#08100c', cell: '#0d1a14', border: '#163224', text: '#7fffa7', textSoft: '#4cd478', textFaint: '#227744', accent: '#00ff66' }
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

    currentContent.theme = {
      bg: document.getElementById('themeBg')?.value || '#e3e3e3',
      cell: document.getElementById('themeCell')?.value || '#f0f0f0',
      border: document.getElementById('themeBorder')?.value || '#d8d8d8',
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
    syncColorInput('Bg', theme.bg || '#e3e3e3');
    syncColorInput('Cell', theme.cell || '#f0f0f0');
    syncColorInput('Border', theme.border || '#d8d8d8');
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
    const claimEl = document.getElementById('heroClaim');
    const introEl = document.getElementById('intro');
    const aboutEl = document.getElementById('about');
    const emailEl = document.getElementById('email');

    if (titleEl) titleEl.value = site.title || 'BRICEMG / STUDIO';
    if (subtitleEl) subtitleEl.value = site.subtitle || 'DESIGN / CODE / VISION';
    if (claimEl) claimEl.value = site.heroClaim || '';
    if (introEl) introEl.value = site.intro || '';
    if (aboutEl) aboutEl.value = site.about || '';
    if (emailEl) emailEl.value = site.email || 'bonjour@bricemg.dev';

    const plates = currentContent.plates || [];
    const pF = plates[0] || {};
    const pG = plates[1] || {};
    const pH = plates[2] || {};

    const pFLabel = document.getElementById('plateFLabel');
    const pFText1 = document.getElementById('plateFText1');
    const pFText2 = document.getElementById('plateFText2');
    if (pFLabel) pFLabel.value = pF.label || 'INFO';
    if (pFText1) pFText1.value = pF.items?.[0]?.desc || '';
    if (pFText2) pFText2.value = pF.items?.[1]?.desc || '';

    const pGLabel = document.getElementById('plateGLabel');
    const pGText1 = document.getElementById('plateGText1');
    const pGText2 = document.getElementById('plateGText2');
    if (pGLabel) pGLabel.value = pG.label || 'APPROCHE';
    if (pGText1) pGText1.value = pG.items?.[0]?.desc || '';
    if (pGText2) pGText2.value = pG.items?.[1]?.desc || '';

    const pHLabel = document.getElementById('plateHLabel');
    const pHText = document.getElementById('plateHText');
    if (pHLabel) pHLabel.value = pH.label || 'CONTACT';
    if (pHText) pHText.value = pH.text || '';

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
    currentContent.site = {
      title: document.getElementById('siteTitle')?.value.trim() || 'BRICEMG / STUDIO',
      subtitle: document.getElementById('siteSubtitle')?.value.trim() || 'DESIGN / CODE / VISION',
      heroClaim: document.getElementById('heroClaim')?.value.trim() || '',
      intro: document.getElementById('intro')?.value.trim() || '',
      about: document.getElementById('about')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || 'bonjour@bricemg.dev'
    };

    currentContent.plates = currentContent.plates || [];
    if (currentContent.plates[0]) {
      currentContent.plates[0].label = document.getElementById('plateFLabel')?.value.trim() || 'INFO';
      if (!currentContent.plates[0].items) currentContent.plates[0].items = [{ title: 'ÉTAT', desc: '' }, { title: 'FOCUS', desc: '' }];
      if (currentContent.plates[0].items[0]) currentContent.plates[0].items[0].desc = document.getElementById('plateFText1')?.value.trim() || '';
      if (currentContent.plates[0].items[1]) currentContent.plates[0].items[1].desc = document.getElementById('plateFText2')?.value.trim() || '';
    }
    if (currentContent.plates[1]) {
      currentContent.plates[1].label = document.getElementById('plateGLabel')?.value.trim() || 'APPROCHE';
      if (!currentContent.plates[1].items) currentContent.plates[1].items = [{ title: 'PRINCIPE', desc: '' }, { title: 'MOOD', desc: '' }];
      if (currentContent.plates[1].items[0]) currentContent.plates[1].items[0].desc = document.getElementById('plateGText1')?.value.trim() || '';
      if (currentContent.plates[1].items[1]) currentContent.plates[1].items[1].desc = document.getElementById('plateGText2')?.value.trim() || '';
    }
    if (currentContent.plates[2]) {
      currentContent.plates[2].label = document.getElementById('plateHLabel')?.value.trim() || 'CONTACT';
      currentContent.plates[2].text = document.getElementById('plateHText')?.value.trim() || '';
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
    const themeProps = ['Bg', 'Cell', 'Border', 'Text', 'TextSoft', 'TextFaint', 'Accent'];
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

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        const preset = THEME_PRESETS[presetKey];
        if (preset) {
          syncColorInput('Bg', preset.bg);
          syncColorInput('Cell', preset.cell);
          syncColorInput('Border', preset.border);
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
      'siteTitle', 'siteSubtitle', 'heroClaim', 'intro', 'about', 'email',
      'plateFLabel', 'plateFText1', 'plateFText2',
      'plateGLabel', 'plateGText1', 'plateGText2',
      'plateHLabel', 'plateHText',
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

    document.addEventListener('click', (e) => {
      if (e.target.closest('#cardDetailCloseBtn')) {
        closeAdminCardDetail();
      } else if (e.target.id === 'cardDetailModal') {
        closeAdminCardDetail();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const detailModal = document.getElementById('cardDetailModal');
        if (detailModal && detailModal.classList.contains('is-open')) {
          closeAdminCardDetail();
        }
      }
    });

    document.addEventListener('input', (e) => {
      if (!activeDetailCard) return;
      if (e.target.id === 'detailCardLongText') {
        activeDetailCard.card.details = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardTitle') {
        activeDetailCard.card.title = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardCode') {
        activeDetailCard.card.code = e.target.innerText.trim();
      } else if (e.target.id === 'detailCardDesc') {
        activeDetailCard.card.desc = e.target.innerText.trim();
      }
    });
  }

  function setupAppDelegation() {
    appEl.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.getAttribute('data-action');
      const secIdx = parseInt(target.getAttribute('data-sec-idx'), 10);
      const itemIdx = parseInt(target.getAttribute('data-item-idx'), 10);

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
      } else if (!isNaN(plateIdx)) {
        currentContent.plates = currentContent.plates || [];
        const plate = currentContent.plates[plateIdx];
        if (plate) {
          if (field === 'letter') plate.letter = val;
          else if (field === 'label') {
            plate.label = val;
            const inputId = plateIdx === 0 ? 'plateFLabel' : (plateIdx === 1 ? 'plateGLabel' : 'plateHLabel');
            const labEl = document.getElementById(inputId);
            if (labEl) labEl.value = val;
          } else if (field === 'text') {
            plate.text = val;
            const txtEl = document.getElementById('plateHText');
            if (txtEl) txtEl.value = val;
          } else if (field === 'emailPrefix') plate.emailPrefix = val;
          else if (field === 'email') plate.email = val;
          else if (field === 'item-title') {
            if (plate.items && plate.items[itemIdx]) plate.items[itemIdx].title = val;
          } else if (field === 'item-desc') {
            if (plate.items && plate.items[itemIdx]) {
              plate.items[itemIdx].desc = val;
              const inputId = plateIdx === 0 ? (itemIdx === 0 ? 'plateFText1' : 'plateFText2') : (itemIdx === 0 ? 'plateGText1' : 'plateGText2');
              const descEl = document.getElementById(inputId);
              if (descEl) descEl.value = val;
            }
          }
        }
      } else if (action === 'edit-sec-letter') {
        if (currentContent.sections[secIdx]) {
          currentContent.sections[secIdx].letter = val;
        }
      } else if (action === 'edit-sec-title') {
        if (currentContent.sections[secIdx]) {
          currentContent.sections[secIdx].title = val;
        }
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