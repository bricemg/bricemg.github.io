(function () {
  // Template builders for HTML generation with WYSIWYG CMS support
  const sanitize = (window.storageUtils && window.storageUtils.sanitize) || window.sanitize || function (str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  };

  function getSectionsList(content) {
  if (content && content.sections && Array.isArray(content.sections) && content.sections.length > 0) {
    return content.sections;
  }
  const cards = (content && content.cards) || [];
  const projects = (content && content.projects) || [];
  return [
    {
      id: 'atelier',
      letter: 'A',
      title: 'ATELIER',
      visible: true,
      items: cards.map(c => ({ ...c, visible: c.visible !== false, status: c.status || 'ACTIF' }))
    },
    {
      id: 'projets',
      letter: 'B',
      title: 'PROJETS',
      visible: true,
      items: projects.map(p => ({ ...p, visible: p.visible !== false, status: p.status || p.phase || 'EN COURS' }))
    }
  ];
}

const FALLBACK_MEDIA_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='100%25' height='100%25' fill='%23120f24'/%3E%3Cpath d='M0 0l800 500M800 0L0 500' stroke='%232c1f51' stroke-width='1.5' stroke-dasharray='8 8'/%3E%3Ccircle cx='400' cy='250' r='44' fill='none' stroke='%23e17f0e' stroke-width='2'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%23afa6e3' font-family='monospace' font-size='13' letter-spacing='3'%3EBRICEMG / MEDIA%3C/text%3E%3C/svg%3E";
window.FALLBACK_MEDIA_SVG = FALLBACK_MEDIA_SVG;

function buildCardVisitorHTML(card, index, secIdx) {
  const imgSrc = card.image || 'media/_placeholder.png';
  const displayTitle = card.code || card.title || 'BRAND';
  const displayVersion = card.version || card.status || card.phase || 'v 0.1.0';
  const isFull = card.full === true || card.hasDetail === true;

  if (isFull) {
    return `
      <a class="cell tool tool--has-detail" data-tool="${sanitize(card.id)}" data-card-id="${sanitize(card.id)}" data-sec-idx="${secIdx ?? ''}" data-item-idx="${index}" data-action="open-card-detail" href="javascript:void(0);" target="_self">
        <div class="cell-top">
          <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
          <span class="cue"></span>
        </div>
        <div class="card-media">
          <img src="${sanitize(imgSrc)}" alt="${sanitize(displayTitle)}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
        </div>
        <div class="cell-body">
          <div class="card-content-block">
            <div class="name">${sanitize(displayTitle)}</div>
            <div class="desc">${sanitize(card.desc || '')}</div>
          </div>
          <dl class="dates">
            <div><dt>TYPE</dt><dd>${sanitize(card.type || 'IDENTITÉ')}</dd></div>
            <div><dt>VERSION</dt><dd>${sanitize(displayVersion)}</dd></div>
          </dl>
          <div class="go">VOIR EN DÉTAIL<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
        </div>
      </a>
    `;
  }

  return `
    <div class="cell tool tool--standard" data-tool="${sanitize(card.id)}" data-card-id="${sanitize(card.id)}" data-sec-idx="${secIdx ?? ''}" data-item-idx="${index}">
      <div class="cell-top">
        <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
        <span class="cue"></span>
      </div>
      <div class="card-media">
        <img src="${sanitize(imgSrc)}" alt="${sanitize(displayTitle)}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
      </div>
      <div class="cell-body">
        <div class="card-content-block">
          <div class="name">${sanitize(displayTitle)}</div>
          <div class="desc">${sanitize(card.desc || '')}</div>
        </div>
        <dl class="dates">
          <div><dt>TYPE</dt><dd>${sanitize(card.type || 'IDENTITÉ')}</dd></div>
          <div><dt>VERSION</dt><dd>${sanitize(displayVersion)}</dd></div>
        </dl>
      </div>
    </div>
  `;
}

function buildCardEditableHTML(card, index, secIdx, totalCards) {
  const isHidden = card.visible === false;
  const isFull = card.full === true || card.hasDetail === true;
  const imgSrc = card._tempPreview || card.image || 'media/_placeholder.png';
  const displayTitle = card.code || card.title || 'BRAND';
  const displayVersion = card.version || card.status || card.phase || 'v 0.1.0';
  return `
    <div class="cell tool cms-card ${isHidden ? 'cms-card--hidden' : ''} ${isFull ? 'tool--has-detail' : 'tool--standard'}" 
         data-sec-idx="${secIdx}" 
         data-item-idx="${index}" 
         data-item-id="${sanitize(card.id)}">
      <div class="cms-card-toolbar">
        ${isFull ? `<button type="button" class="cms-tool-btn" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Ouvrir la vue détaillée & rédiger les notes">🔍 DÉTAILS</button>` : ''}
        <button type="button" class="cms-tool-btn cms-btn-toggle-full ${isFull ? 'is-full-active' : ''}" data-action="toggle-card-full" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Activer / désactiver la vue détaillée">${isFull ? 'FULL' : 'STANDARD'}</button>
        <button type="button" class="cms-tool-btn cms-btn-move-card" data-action="move-card-prev" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Déplacer à gauche" ${index === 0 ? 'disabled' : ''}>◄</button>
        <button type="button" class="cms-tool-btn cms-btn-move-card" data-action="move-card-next" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Déplacer à droite" ${index === totalCards - 1 ? 'disabled' : ''}>►</button>
        <button type="button" class="cms-tool-btn cms-btn-toggle-card ${isHidden ? 'is-off' : ''}" data-action="toggle-card-visibility" data-sec-idx="${secIdx}" data-item-idx="${index}">
          ${isHidden ? 'MASQUÉ' : 'VISIBLE'}
        </button>
        <button type="button" class="cms-tool-btn cms-btn-delete-card" data-action="delete-card" data-sec-idx="${secIdx}" data-item-idx="${index}">✖</button>
      </div>
      <div class="cell-top">
        <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
        ${isHidden ? '<span class="cms-tag-hidden">MASQUÉ</span>' : '<span class="cue"></span>'}
      </div>
      <div class="card-media cms-card-media" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour changer l'image">
        <img src="${sanitize(imgSrc)}" alt="${sanitize(displayTitle)}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
        <div class="cms-media-overlay" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}">
          <span class="cms-media-btn">📷 CHANGER L'IMAGE</span>
          <span class="cms-media-badge">${sanitize(imgSrc)}</span>
        </div>
      </div>
      <div class="cell-body">
        <div class="card-content-block">
          <div class="name cms-editable" contenteditable="true" spellcheck="false" data-field="code" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(displayTitle)}</div>
          <div class="desc cms-editable" contenteditable="true" spellcheck="false" data-field="desc" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.desc || '')}</div>
        </div>
        <dl class="dates">
          <div>
            <dt>TYPE</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="type" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.type || 'IDENTITÉ')}</dd>
          </div>
          <div>
            <dt>VERSION</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="version" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(displayVersion)}</dd>
          </div>
        </dl>
        ${isFull ? `<div class="go cms-btn-detail-trigger" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" style="cursor: pointer;">VOIR EN DÉTAIL<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>` : ''}
      </div>
    </div>
  `;
}

function buildPageHTML(content, options = {}) {
  const isEditable = Boolean(options.isEditable);
  const site = (content && content.site) || {};
  const siteTitleParts = (site.title || 'BRICEMG / STUDIO').split(' / ');
  const siteNamespace = siteTitleParts[0] || 'BRICEMG';
  const siteType = siteTitleParts[1] || 'STUDIO';

  const footer = (content && content.footer) || {
    col1: siteNamespace,
    col2: site.subtitle || 'DESIGN / CODE / VISION',
    col3: 'DESIGN / CODE / VISION',
    col4: site.email || 'bonjour@bricemg.dev',
    col5: '© 2026'
  };

  const sections = getSectionsList(content);
  let sectionsHTML = '';

  sections.forEach((sec, secIdx) => {
    const isSectionHidden = sec.visible === false;
    if (!isEditable && isSectionHidden) return;

    const items = sec.items || [];
    const visibleItems = items.filter(i => i.visible !== false);

    if (isEditable) {
      sectionsHTML += `
        <div class="bar cms-bar ${isSectionHidden ? 'cms-bar--hidden' : ''}" data-sec-idx="${secIdx}">
          <div class="cms-bar-left">
            <span class="dot bar-letter cms-editable" contenteditable="true" spellcheck="false" data-action="edit-sec-letter" data-sec-idx="${secIdx}">${sanitize(sec.letter || 'A')}</span>
            <h2 class="bar-title cms-editable" contenteditable="true" spellcheck="false" data-action="edit-sec-title" data-sec-idx="${secIdx}">${sanitize(sec.title || 'SECTION')}</h2>
            <span class="count">/ ${items.length}</span>
            ${isSectionHidden ? '<span class="cms-sec-hidden-pill">SECTION MASQUÉE</span>' : ''}
          </div>
          <div class="cms-sec-actions">
            <button type="button" class="cms-sec-btn" data-action="move-sec-prev" data-sec-idx="${secIdx}" ${secIdx === 0 ? 'disabled' : ''}>Monter</button>
            <button type="button" class="cms-sec-btn" data-action="move-sec-next" data-sec-idx="${secIdx}" ${secIdx === sections.length - 1 ? 'disabled' : ''}>Descendre</button>
            <button type="button" class="cms-sec-btn ${isSectionHidden ? 'is-off' : ''}" data-action="toggle-sec-visibility" data-sec-idx="${secIdx}">${isSectionHidden ? 'Rendre visible' : 'Masquer'}</button>
            <button type="button" class="cms-sec-btn cms-sec-btn--delete" data-action="delete-sec" data-sec-idx="${secIdx}">Supprimer</button>
          </div>
        </div>
        <div class="row cms-cards-grid" data-sec-idx="${secIdx}">
          ${items.map((card, cardIdx) => buildCardEditableHTML(card, cardIdx, secIdx, items.length)).join('')}
          <div class="cell cell--add cms-card-add" data-action="add-card" data-sec-idx="${secIdx}">
            <div class="cms-card-add-inner">
              <span class="cms-add-icon">+</span>
              <span class="cms-add-text">AJOUTER UNE CARTE</span>
            </div>
          </div>
        </div>
      `;
    } else {
      sectionsHTML += `
        <div class="bar">
          <span class="dot">${sanitize(sec.letter || 'A')}</span>
          <h2>${sanitize(sec.title || 'SECTION')}</h2>
          <span class="count">/ ${visibleItems.length}</span>
        </div>
        <div class="row">
          ${visibleItems.map((card, idx) => buildCardVisitorHTML(card, idx, secIdx)).join('')}
        </div>
      `;
    }
  });

  // Bouton d'ajout de section complète (affiché uniquement en mode édition)
  const addSectionRowHTML = isEditable ? `
    <div class="cms-add-section-wrapper">
      <button type="button" class="cms-btn-add-section" data-action="add-section">
        + AJOUTER UNE NOUVELLE SECTION
      </button>
    </div>
  ` : '';

  return `
    <div class="sheet ${isEditable ? 'sheet--editable' : ''}">
      <div class="row row--three">
        <div class="cell">
          <div class="cell-top"><span class="dot title">${sanitize(siteNamespace)}</span></div>
          <div class="cell-body">
            <div class="meta">
              <b>${sanitize(siteType)}</b>
              ${sanitize(site.subtitle || 'DESIGN / CODE / VISION')}<br />
              INDEX V0.1<br />
              LANGUAGE : FR
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-top"><span class="dot title">NOUS</span></div>
          <div class="cell-body">
            <div class="meta">
              <b>CRÉER</b>
              ${sanitize(site.intro || '')}
            </div>
            <div class="meta">
              <b>RÉFLEXION</b>
              PENSER, CONCEVOIR ET DÉVELOPPER DE A À Z
            </div>
            <div class="meta">
              <b>OBJECTIF</b>
              ${sanitize(site.about || '')}
            </div>
          </div>
        </div>
        <div class="cell cell--play" id="field">
          <div class="play" aria-hidden="true"><canvas></canvas></div>
          <div class="cell-body">
            <p class="claim">${sanitize(site.heroClaim || '')}</p>
          </div>
        </div>
      </div>
      ${sectionsHTML}
      ${addSectionRowHTML}
      <div class="foot">
        <span>${sanitize(footer.col1 || 'BRICEMG')}</span>
        <span>${sanitize(footer.col2 || '')}</span>
        <span>${sanitize(footer.col3 || '')}</span>
        <span>${sanitize(footer.col4 || '')}</span>
        <span>${sanitize(footer.col5 || '© 2026')}</span>
      </div>
    </div>
    ${buildCardDetailModalHTML(isEditable)}
    ${!isEditable ? '<a href="admin.html" class="cms-link">CMS</a>' : ''}
  `;
}

function buildCardDetailModalHTML(isEditable) {
  return `
    <div id="cardDetailModal" class="card-detail-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="card-detail-dialog">
        <div class="cell card-detail-card">
          <button type="button" class="card-detail-close-btn" id="cardDetailCloseBtn" aria-label="Fermer la vue détaillée">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="cell-top">
            <div class="card-detail-index-wrap">
              <span class="dot idx" id="detailCardIdx">01</span>
              <span class="cue"></span>
            </div>
          </div>

          <div class="card-detail-media">
            <img id="detailCardImage" src="media/_placeholder.png" alt="Aperçu du projet" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
          </div>

          <div class="card-content-block">
            <h2 class="card-detail-title ${isEditable ? 'cms-editable' : ''}" id="detailCardTitle" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="code"' : ''}>BRAND</h2>
            <div class="desc ${isEditable ? 'cms-editable' : ''}" id="detailCardDesc" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="desc"' : ''}>Logo, charte graphique, guidelines, visual system.</div>
          </div>

          <dl class="dates card-detail-dates">
            <div><dt>TYPE</dt><dd class="${isEditable ? 'cms-editable' : ''}" id="detailCardType" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="type"' : ''}>Identité</dd></div>
            <div><dt>VERSION</dt><dd class="${isEditable ? 'cms-editable' : ''}" id="detailCardStatus" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="version"' : ''}>v 0.1.3</dd></div>
          </dl>

          <div class="card-detail-section-title"></div>
          
          <div class="card-detail-text ${isEditable ? 'cms-editable' : ''}" id="detailCardLongText" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="details"' : ''}>
          </div>
          ${isEditable ? '<div class="cms-card-edit-hint" style="text-align: left; margin-top: 8px;">✎ Notes éditables. Lien : &lt;a href="https://exemple.com"&gt;Texte cliquable&lt;/a&gt; — ou coller une URL https://…</div>' : ''}
        </div>
      </div>
    </div>
  `;
}

  window.templates = {
    buildCardHTML: buildCardVisitorHTML,
    buildProjectHTML: buildCardVisitorHTML,
    buildCardDetailModalHTML,
    buildPageHTML
  };
})();