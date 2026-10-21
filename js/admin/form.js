// Form utilities for admin panel

function collectFormData(content) {
  const next = JSON.parse(JSON.stringify(content));

  // Site info
  next.site.title = document.getElementById('siteTitle').value.trim() || 'BRICEMG / STUDIO';
  next.site.subtitle = document.getElementById('siteSubtitle').value.trim() || 'DESIGN / CODE / VISION';
  next.site.heroClaim = document.getElementById('heroClaim').value.trim();
  next.site.intro = document.getElementById('intro').value.trim();
  next.site.about = document.getElementById('about').value.trim();
  next.site.email = document.getElementById('email').value.trim();

  // Theme & colors
  next.theme = next.theme || {};
  next.theme.bg = document.getElementById('themeBg').value.trim() || '#e3e3e3';
  next.theme.cell = document.getElementById('themeCell').value.trim() || '#f0f0f0';
  next.theme.border = document.getElementById('themeBorder').value.trim() || '#d8d8d8';
  next.theme.text = document.getElementById('themeText').value.trim() || '#2e2e2e';
  next.theme.textSoft = document.getElementById('themeTextSoft').value.trim() || '#585858';
  next.theme.textFaint = document.getElementById('themeTextFaint').value.trim() || '#9b9b9b';
  next.theme.accent = document.getElementById('themeAccent').value.trim() || '#d71921';
  next.theme.borderRadius = document.getElementById('themeBorderRadiusRange') ? `${document.getElementById('themeBorderRadiusRange').value}px` : '22px';

  // Collect all card fields
  const cardFields = ['title', 'code', 'desc', 'type', 'status'];
  cardFields.forEach(field => {
    document.querySelectorAll(`.card-${field}`).forEach(el => {
      const index = parseInt(el.getAttribute('data-index'));
      next.cards[index][field] = el.value.trim();
    });
  });

  // Collect all project fields
  const projectFields = ['title', 'code', 'desc', 'type', 'phase'];
  projectFields.forEach(field => {
    document.querySelectorAll(`.project-${field}`).forEach(el => {
      const index = parseInt(el.getAttribute('data-index'));
      next.projects[index][field] = el.value.trim();
    });
  });

  return next;
}

function buildCardFieldsHTML(content) {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';

  content.cards.forEach((card, index) => {
    const section = document.createElement('div');
    section.className = 'card-section';

    section.innerHTML = `
      <div class="field-group-label">CARTE ${index + 1}</div>
      <div class="field">
        <label>Titre</label>
        <input class="card-title" data-index="${index}" type="text" value="${card.title}" />
      </div>
      <div class="field">
        <label>Code</label>
        <input class="card-code" data-index="${index}" type="text" value="${card.code}" />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="card-desc" data-index="${index}">${card.desc}</textarea>
      </div>
      <div class="field">
        <label>Type</label>
        <input class="card-type" data-index="${index}" type="text" value="${card.type}" />
      </div>
      <div class="field">
        <label>Statut</label>
        <input class="card-status" data-index="${index}" type="text" value="${card.status}" />
      </div>
    `;
    container.appendChild(section);
  });
}

function buildProjectFieldsHTML(content) {
  const container = document.getElementById('projectsContainer');
  container.innerHTML = '';

  content.projects.forEach((project, index) => {
    const section = document.createElement('div');
    section.className = 'project-section';

    section.innerHTML = `
      <div class="field-group-label">PROJET ${index + 1}</div>
      <div class="field">
        <label>Titre</label>
        <input class="project-title" data-index="${index}" type="text" value="${project.title}" />
      </div>
      <div class="field">
        <label>Code</label>
        <input class="project-code" data-index="${index}" type="text" value="${project.code}" />
      </div>
      <div class="field">
        <label>Description</label>
        <textarea class="project-desc" data-index="${index}">${project.desc}</textarea>
      </div>
      <div class="field">
        <label>Type</label>
        <input class="project-type" data-index="${index}" type="text" value="${project.type}" />
      </div>
      <div class="field">
        <label>Phase</label>
        <input class="project-phase" data-index="${index}" type="text" value="${project.phase}" />
      </div>
    `;
    container.appendChild(section);
  });
}

const THEME_PRESETS = {
  default: {
    bg: '#e3e3e3',
    cell: '#f0f0f0',
    border: '#d8d8d8',
    text: '#2e2e2e',
    textSoft: '#585858',
    textFaint: '#9b9b9b',
    accent: '#d71921'
  },
  dark: {
    bg: '#0e0e0e',
    cell: '#181818',
    border: '#292929',
    text: '#e0e0e0',
    textSoft: '#a0a0a0',
    textFaint: '#666666',
    accent: '#ff3b30'
  },
  white: {
    bg: '#fbfbfb',
    cell: '#ffffff',
    border: '#e5e5e5',
    text: '#111111',
    textSoft: '#666666',
    textFaint: '#aaaaaa',
    accent: '#e60000'
  },
  warm: {
    bg: '#e8e2d5',
    cell: '#f4ede2',
    border: '#d8cfbe',
    text: '#2c2724',
    textSoft: '#6a625b',
    textFaint: '#9f958c',
    accent: '#c44520'
  },
  cyber: {
    bg: '#08100c',
    cell: '#0d1a14',
    border: '#163224',
    text: '#7fffa7',
    textSoft: '#4cd478',
    textFaint: '#227744',
    accent: '#00ff66'
  }
};

function formatHex(val, fallback) {
  if (!val) return fallback;
  let str = val.trim();
  if (!str.startsWith('#')) str = '#' + str;
  return /^#[0-9A-Fa-f]{6}$/.test(str) ? str : fallback;
}

function syncColorInputs(prop, value) {
  const textInput = document.getElementById(`theme${prop}`);
  const pickerInput = document.getElementById(`theme${prop}Picker`);
  if (textInput) textInput.value = value;
  if (pickerInput) pickerInput.value = formatHex(value, '#000000');
}

function applyLiveTheme() {
  if (!window.storageUtils || !window.storageUtils.applyTheme) return;
  const currentTheme = {
    bg: document.getElementById('themeBg')?.value || '#e3e3e3',
    cell: document.getElementById('themeCell')?.value || '#f0f0f0',
    border: document.getElementById('themeBorder')?.value || '#d8d8d8',
    text: document.getElementById('themeText')?.value || '#2e2e2e',
    textSoft: document.getElementById('themeTextSoft')?.value || '#585858',
    textFaint: document.getElementById('themeTextFaint')?.value || '#9b9b9b',
    accent: document.getElementById('themeAccent')?.value || '#d71921'
  };
  window.storageUtils.applyTheme(currentTheme);
}

function setupThemeListeners() {
  const themeProps = ['Bg', 'Cell', 'Border', 'Text', 'TextSoft', 'TextFaint', 'Accent'];

  themeProps.forEach(prop => {
    const textInput = document.getElementById(`theme${prop}`);
    const pickerInput = document.getElementById(`theme${prop}Picker`);

    if (textInput && pickerInput) {
      pickerInput.oninput = () => {
        textInput.value = pickerInput.value;
        applyLiveTheme();
      };

      textInput.oninput = () => {
        const hex = formatHex(textInput.value, null);
        if (hex) pickerInput.value = hex;
        applyLiveTheme();
      };
    }
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.onclick = () => {
      const presetKey = btn.getAttribute('data-preset');
      const preset = THEME_PRESETS[presetKey];
      if (preset) {
        syncColorInputs('Bg', preset.bg);
        syncColorInputs('Cell', preset.cell);
        syncColorInputs('Border', preset.border);
        syncColorInputs('Text', preset.text);
        syncColorInputs('TextSoft', preset.textSoft || '#585858');
        syncColorInputs('TextFaint', preset.textFaint || '#9b9b9b');
        syncColorInputs('Accent', preset.accent);
        applyLiveTheme();
      }
    };
  });
}

function fillThemeFields(theme) {
  const current = theme || (window.defaultContent && window.defaultContent.theme) || THEME_PRESETS.default;
  syncColorInputs('Bg', current.bg || '#e3e3e3');
  syncColorInputs('Cell', current.cell || '#f0f0f0');
  syncColorInputs('Border', current.border || '#d8d8d8');
  syncColorInputs('Text', current.text || '#2e2e2e');
  syncColorInputs('TextSoft', current.textSoft || '#585858');
  syncColorInputs('TextFaint', current.textFaint || '#9b9b9b');
  const radiusRange = document.getElementById('themeBorderRadiusRange');
  const radiusVal = document.getElementById('themeBorderRadiusVal');
  if (radiusRange && current.borderRadius) {
    const num = parseInt(current.borderRadius, 10) || 22;
    radiusRange.value = num;
    if (radiusVal) radiusVal.textContent = `${num}px`;
  }
  setupThemeListeners();
}

function fillForm(content) {
  document.getElementById('siteTitle').value = content.site.title;
  document.getElementById('siteSubtitle').value = content.site.subtitle;
  document.getElementById('heroClaim').value = content.site.heroClaim;
  document.getElementById('intro').value = content.site.intro;
  document.getElementById('about').value = content.site.about;
  document.getElementById('email').value = content.site.email;

  fillThemeFields(content.theme);
  buildCardFieldsHTML(content);
  buildProjectFieldsHTML(content);
}

window.adminForm = {
  collectFormData,
  buildCardFieldsHTML,
  buildProjectFieldsHTML,
  fillForm,
  THEME_PRESETS
};
