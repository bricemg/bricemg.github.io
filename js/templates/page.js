// Template builders for HTML generation with WYSIWYG CMS support
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

function buildCardVisitorHTML(card, index, secIdx) {
  const imgSrc = card.image || 'media/_placeholder.png';
  return `
    <a class="cell tool" data-tool="${sanitize(card.id)}" data-card-id="${sanitize(card.id)}" data-sec-idx="${secIdx ?? ''}" data-item-idx="${index}" data-action="open-card-detail" href="javascript:void(0);" target="_self">
      <div class="cell-top">
        <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
        <span class="cue"></span>
      </div>
      <div class="name">${sanitize(card.title)}</div>
      <div class="card-media">
        <img src="${sanitize(imgSrc)}" alt="${sanitize(card.title)}" loading="lazy" />
      </div>
      <div class="cell-body">
        <div class="meta">
          <span class="code">${sanitize(card.code)}</span>
          <span class="desc">${sanitize(card.desc)}</span>
        </div>
        <dl class="dates">
          <div><dt>TYPE</dt><dd>${sanitize(card.type)}</dd></div>
          <div><dt>STATUT</dt><dd>${sanitize(card.status || card.phase || 'ACTIF')}</dd></div>
        </dl>
        <div class="go">VOIR EN DÉTAIL<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
      </div>
    </a>
  `;
}

function buildCardEditableHTML(card, index, secIdx, totalCards) {
  const isHidden = card.visible === false;
  const imgSrc = card._tempPreview || card.image || 'media/_placeholder.png';
  return `
    <div class="cell tool cms-card ${isHidden ? 'cms-card--hidden' : ''}" 
         data-sec-idx="${secIdx}" 
         data-item-idx="${index}" 
         data-item-id="${sanitize(card.id)}">
      <div class="cms-card-toolbar">
        <button type="button" class="cms-tool-btn" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Ouvrir la vue détaillée & rédiger les notes">🔍 DÉTAILS</button>
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
      <div class="name cms-editable" contenteditable="true" spellcheck="false" data-field="title" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.title)}</div>
      <div class="card-media cms-card-media" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour changer l'image">
        <img src="${sanitize(imgSrc)}" alt="${sanitize(card.title)}" loading="lazy" />
        <div class="cms-media-overlay" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}">
          <span class="cms-media-btn">📷 CHANGER L'IMAGE</span>
          <span class="cms-media-badge">${sanitize(imgSrc)}</span>
        </div>
      </div>
      <div class="cell-body">
        <div class="meta">
          <span class="code cms-editable" contenteditable="true" spellcheck="false" data-field="code" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.code)}</span>
          <span class="desc cms-editable" contenteditable="true" spellcheck="false" data-field="desc" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.desc)}</span>
        </div>
        <dl class="dates">
          <div>
            <dt>TYPE</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="type" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.type)}</dd>
          </div>
          <div>
            <dt>STATUT</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="status" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.status || card.phase || 'ACTIF')}</dd>
          </div>
        </dl>
        <div class="go cms-btn-detail-trigger" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" style="cursor: pointer;">VOIR EN DÉTAIL<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
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

  const defaultPlates = [
    {
      letter: 'F',
      label: 'INFO',
      items: [
        { title: 'ÉTAT', desc: "CRÉATION D'UNE BASE VISUELLE ET D'UNE PREMIÈRE VERSION D'EXPOSITION." },
        { title: 'FOCUS', desc: "DESIGN, DÉVELOPPEMENT, EXPÉRIMENTATION ET STORYTELLING." }
      ]
    },
    {
      letter: 'G',
      label: 'APPROCHE',
      items: [
        { title: 'PRINCIPE', desc: "CLARTÉ, RYTHME, STRUCTURE ET PLAINES DE COULEUR." },
        { title: 'MOOD', desc: "MINIMAL, CALME, MODERNE, UN PEU TECHNIQUE ET CURIEUX." }
      ]
    },
    {
      letter: 'H',
      label: 'CONTACT',
      hasDot: true,
      text: 'POUR UN PROJET, UNE COLLABORATION, OU UNE DISCUSSION.',
      emailPrefix: 'ÉCRIS ',
      email: site.email || 'bonjour@bricemg.dev'
    }
  ];

  const plates = content && content.plates && content.plates.length >= 3 ? content.plates : defaultPlates;
  const plateF = plates[0] || defaultPlates[0];
  const plateG = plates[1] || defaultPlates[1];
  const plateH = plates[2] || defaultPlates[2];

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
      <div class="row row--three">
        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top"><span class="dot idx">${sanitize(plateF.letter || 'F')}</span></div>
          <div class="label">${sanitize(plateF.label || 'INFO')}</div>
          <div class="cell-body">
            ${(plateF.items || []).map(it => `
              <div class="meta">
                <b>${sanitize(it.title)}</b>
                <span>${sanitize(it.desc)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top"><span class="dot idx">${sanitize(plateG.letter || 'G')}</span></div>
          <div class="label">${sanitize(plateG.label || 'APPROCHE')}</div>
          <div class="cell-body">
            ${(plateG.items || []).map(it => `
              <div class="meta">
                <b>${sanitize(it.title)}</b>
                <span>${sanitize(it.desc)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top">
            <span class="dot idx">${sanitize(plateH.letter || 'H')}</span>
            <span class="rdot"></span>
          </div>
          <div class="label">${sanitize(plateH.label || 'CONTACT')}</div>
          <div class="cell-body">
            <div class="meta">
              <span>${sanitize(plateH.text || '')}</span><br />
              <span>${sanitize(plateH.emailPrefix || 'ÉCRIS ')}</span> 
              <a class="mailto" href="mailto:${sanitize(plateH.email || site.email || '')}">${sanitize(plateH.email || site.email || '')}</a>
            </div>
          </div>
        </div>
      </div>
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
              <span class="card-detail-cue"></span>
            </div>
            <div class="card-detail-tags">
              <span class="card-detail-tag" id="detailCardType">IDENTITÉ</span>
              <span class="card-detail-tag highlight" id="detailCardStatus">ACTIF</span>
            </div>
          </div>

          <h2 class="card-detail-title ${isEditable ? 'cms-editable' : ''}" id="detailCardTitle" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="title"' : ''}>TITRE</h2>

          <div class="card-detail-media">
            <img id="detailCardImage" src="media/_placeholder.png" alt="Aperçu du projet" />
          </div>

          <div class="card-detail-meta-row">
            <div class="card-detail-meta-item">
              <span class="meta-label">CODE PROJET</span>
              <span class="meta-val ${isEditable ? 'cms-editable' : ''}" id="detailCardCode" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="code"' : ''}>CODE</span>
            </div>
            <div class="card-detail-meta-item">
              <span class="meta-label">SYNTHÈSE</span>
              <span class="meta-val ${isEditable ? 'cms-editable' : ''}" id="detailCardDesc" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="desc"' : ''}>Description synthétique.</span>
            </div>
          </div>

          <div class="card-detail-section-title">PRÉSENTATION DU PROJET & NOTES</div>
          
          <div class="card-detail-text ${isEditable ? 'cms-editable' : ''}" id="detailCardLongText" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="details"' : ''}>
          </div>
          ${isEditable ? '<div class="cms-card-edit-hint" style="text-align: left; margin-top: 8px;">✎ Les notes ci-dessus sont éditables directement au clavier et sauvegardées pour cette carte.</div>' : ''}
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