// Template builders for HTML generation with WYSIWYG CMS support

function getSectionsList(content) {
  if (content.sections && Array.isArray(content.sections) && content.sections.length > 0) {
    return content.sections;
  }
  const cards = content.cards || [];
  const projects = content.projects || [];
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

function buildCardVisitorHTML(card, index) {
  return `
    <a class="cell tool" data-tool="${sanitize(card.id)}" data-released="2026-10-05" href="#" target="_self">
      <div class="cell-top">
        <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
        <span class="cue"></span>
      </div>
      <div class="name">${sanitize(card.title)}</div>
      <div class="cell-body">
        <div class="meta">
          <span class="code">${sanitize(card.code)}</span>
          <span class="desc">${sanitize(card.desc)}</span>
        </div>
        <dl class="dates">
          <div><dt>TYPE</dt><dd>${sanitize(card.type)}</dd></div>
          <div><dt>STATUT</dt><dd>${sanitize(card.status || card.phase || 'ACTIF')}</dd></div>
        </dl>
        <div class="go">VOIR<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
      </div>
    </a>
  `;
}

function buildCardEditableHTML(card, index, secIdx, totalCards) {
  const isHidden = card.visible === false;
  return `
    <div class="cell tool cms-card ${isHidden ? 'cms-card--hidden' : ''}" 
         data-sec-idx="${secIdx}" 
         data-item-idx="${index}" 
         data-item-id="${sanitize(card.id)}">
      
      <div class="cms-card-toolbar">
        <button type="button" class="cms-tool-btn cms-btn-move-card" data-action="move-card-prev" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Déplacer à gauche" ${index === 0 ? 'disabled' : ''}>
          ◀
        </button>
        <button type="button" class="cms-tool-btn cms-btn-move-card" data-action="move-card-next" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Déplacer à droite" ${index === totalCards - 1 ? 'disabled' : ''}>
          ▶
        </button>
        <button type="button" class="cms-tool-btn cms-btn-toggle-card ${isHidden ? 'is-off' : ''}" data-action="toggle-card-visibility" data-sec-idx="${secIdx}" data-item-idx="${index}" title="${isHidden ? 'Rendre visible' : 'Masquer la carte'}">
          ${isHidden ? '✕ MASQUÉ' : '👁 VISIBLE'}
        </button>
        <button type="button" class="cms-tool-btn cms-btn-delete-card" data-action="delete-card" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Supprimer la carte">
          🗑
        </button>
      </div>

      <div class="cell-top">
        <span class="dot idx">${String(index + 1).padStart(2, '0')}</span>
        ${isHidden ? '<span class="cms-tag-hidden">MASQUÉ (non visible en FO)</span>' : '<span class="cue"></span>'}
      </div>

      <div class="name cms-editable" contenteditable="true" spellcheck="false" data-field="title" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour modifier le titre">${sanitize(card.title)}</div>

      <div class="cell-body">
        <div class="meta">
          <span class="code cms-editable" contenteditable="true" spellcheck="false" data-field="code" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour modifier le code">${sanitize(card.code)}</span>
          <span class="desc cms-editable" contenteditable="true" spellcheck="false" data-field="desc" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour modifier la description">${sanitize(card.desc)}</span>
        </div>
        <dl class="dates">
          <div>
            <dt>TYPE</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="type" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Modifier le type">${sanitize(card.type)}</dd>
          </div>
          <div>
            <dt>STATUT</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="status" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Modifier le statut">${sanitize(card.status || card.phase || 'ACTIF')}</dd>
          </div>
        </dl>
        <div class="cms-card-edit-hint">✎ ÉDITION DIRECTE</div>
      </div>
    </div>
  `;
}

function buildPageHTML(content, options = {}) {
  const isEditable = Boolean(options.isEditable);
  const siteTitleParts = (content.site.title || 'BRICEMG / STUDIO').split(' / ');
  const siteNamespace = siteTitleParts[0] || 'BRICEMG';
  const siteType = siteTitleParts[1] || 'STUDIO';

  const defaultPlates = (window.defaultContent && window.defaultContent.plates) || [
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
        { title: 'PRINCIPE', desc: "CLARTÉ, RÉPÉTITION, RYTHME, STRUCTURE ET PLAINES DE COULEUR." },
        { title: 'MOOD', desc: "MINIMAL, CALME, MODERNE, UN PEU TECHNIQUE ET CURIEUX." }
      ]
    },
    {
      letter: 'H',
      label: 'CONTACT',
      hasDot: true,
      text: 'POUR UN PROJET, UNE COLLABORATION, OU UNE DISCUSSION.',
      emailPrefix: 'ÉCRIS À',
      email: (content.site && content.site.email) || 'bonjour@bricemg.dev'
    }
  ];

  const plates = content.plates && content.plates.length >= 3 ? content.plates : defaultPlates;
  const plateF = plates[0] || defaultPlates[0];
  const plateG = plates[1] || defaultPlates[1];
  const plateH = plates[2] || defaultPlates[2];

  const footer = content.footer || {
    col1: siteNamespace,
    col2: (content.site && content.site.subtitle) || 'DESIGN / CODE / VISION',
    col3: 'DESIGN / CODE / VISION',
    col4: (content.site && content.site.email) || 'bonjour@bricemg.dev',
    col5: '© 2026'
  };

  const sections = getSectionsList(content);

  let sectionsHTML = '';

  sections.forEach((sec, secIdx) => {
    const isSectionHidden = sec.visible === false;

    // In visitor mode, skip hidden sections completely
    if (!isEditable && isSectionHidden) {
      return;
    }

    const items = sec.items || [];
    const visibleItems = items.filter(i => i.visible !== false);

    if (isEditable) {
      // CMS Mode Section Bar
      sectionsHTML += `
        <div class="bar cms-bar ${isSectionHidden ? 'cms-bar--hidden' : ''}" data-sec-idx="${secIdx}">
          <div class="cms-bar-left">
            <span class="dot bar-letter cms-editable" contenteditable="true" spellcheck="false" data-action="edit-sec-letter" data-sec-idx="${secIdx}" title="Cliquer pour changer la lettre">${sanitize(sec.letter || 'A')}</span>
            <h2 class="bar-title cms-editable" contenteditable="true" spellcheck="false" data-action="edit-sec-title" data-sec-idx="${secIdx}" title="Cliquer pour changer le titre de la section">${sanitize(sec.title || 'SECTION')}</h2>
            <span class="count">/ ${items.length} ${items.length !== visibleItems.length ? `(${visibleItems.length} visibles)` : ''}</span>
            ${isSectionHidden ? '<span class="cms-sec-hidden-pill">SECTION MASQUÉE</span>' : ''}
          </div>

          <div class="cms-sec-actions">
            <button type="button" class="cms-sec-btn" data-action="move-sec-prev" data-sec-idx="${secIdx}" title="Monter la section" ${secIdx === 0 ? 'disabled' : ''}>
              ▲ Monter
            </button>
            <button type="button" class="cms-sec-btn" data-action="move-sec-next" data-sec-idx="${secIdx}" title="Descendre la section" ${secIdx === sections.length - 1 ? 'disabled' : ''}>
              ▼ Descendre
            </button>
            <button type="button" class="cms-sec-btn ${isSectionHidden ? 'is-off' : ''}" data-action="toggle-sec-visibility" data-sec-idx="${secIdx}" title="${isSectionHidden ? 'Rendre la section visible' : 'Masquer la section'}">
              ${isSectionHidden ? '👁 Rendre visible' : '✕ Masquer section'}
            </button>
            <button type="button" class="cms-sec-btn cms-sec-btn--delete" data-action="delete-sec" data-sec-idx="${secIdx}" title="Supprimer la section">
              🗑 Supprimer
            </button>
          </div>
        </div>

        <div class="row cms-cards-grid" data-sec-idx="${secIdx}">
          ${items.map((card, cardIdx) => buildCardEditableHTML(card, cardIdx, secIdx, items.length)).join('')}
          <div class="cell cell--add cms-card-add" data-action="add-card" data-sec-idx="${secIdx}" title="Ajouter une nouvelle carte à cette section">
            <div class="cms-card-add-inner">
              <span class="cms-add-icon">+</span>
              <span class="cms-add-text">AJOUTER UNE CARTE</span>
              <span class="cms-add-sub">DANS CETTE SECTION</span>
            </div>
          </div>
        </div>
      `;
    } else {
      // Visitor Mode Section Bar
      sectionsHTML += `
        <div class="bar">
          <span class="dot">${sanitize(sec.letter || 'A')}</span>
          <h2>${sanitize(sec.title || 'SECTION')}</h2>
          <span class="count">/ ${visibleItems.length}</span>
        </div>
        <div class="row">
          ${visibleItems.map((card, idx) => buildCardVisitorHTML(card, idx)).join('')}
        </div>
      `;
    }
  });

  // Additional CMS button for adding new sections
  const addSectionRowHTML = isEditable ? `
    <div class="cms-add-section-wrapper">
      <button type="button" class="cms-btn-add-section" data-action="add-section">
        + AJOUTER UNE NOUVELLE SECTION (C, D, ...)
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
              ${sanitize(content.site.subtitle || 'DESIGN / CODE / VISION')}<br />
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
              ${sanitize(content.site.intro || '')}
            </div>
            <div class="meta">
              <b>RÉFLEXION</b>
              PENSER, CONCEVOIR ET DÉVELOPPER DE A À Z.
            </div>
            <div class="meta">
              <b>OBJECTIF</b>
              ${sanitize(content.site.about || '')}
            </div>
          </div>
        </div>

        <div class="cell cell--play" id="field">
          <div class="play" aria-hidden="true"><canvas></canvas></div>
          <div class="cell-body">
            <p class="claim">${sanitize(content.site.heroClaim || '')}</p>
          </div>
        </div>
      </div>

      ${sectionsHTML}

      ${addSectionRowHTML}

      <!-- Dynamic Plates F, G, H -->
      <div class="row row--three">
        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top">
            <span class="dot idx ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="0" data-field="letter" title="Modifier la lettre"' : ''}>${sanitize(plateF.letter || 'F')}</span>
          </div>
          <div class="label ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="0" data-field="label" title="Modifier le label"' : ''}>${sanitize(plateF.label || 'INFO')}</div>
          <div class="cell-body">
            ${(plateF.items || []).map((it, itIdx) => `
              <div class="meta">
                <b class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? `contenteditable="true" spellcheck="false" data-plate-idx="0" data-item-idx="${itIdx}" data-field="item-title" title="Modifier l'étiquette"` : ''}>${sanitize(it.title)}</b>
                <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? `contenteditable="true" spellcheck="false" data-plate-idx="0" data-item-idx="${itIdx}" data-field="item-desc" title="Modifier le texte"` : ''}>${sanitize(it.desc)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top">
            <span class="dot idx ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="1" data-field="letter" title="Modifier la lettre"' : ''}>${sanitize(plateG.letter || 'G')}</span>
          </div>
          <div class="label ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="1" data-field="label" title="Modifier le label"' : ''}>${sanitize(plateG.label || 'APPROCHE')}</div>
          <div class="cell-body">
            ${(plateG.items || []).map((it, itIdx) => `
              <div class="meta">
                <b class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? `contenteditable="true" spellcheck="false" data-plate-idx="1" data-item-idx="${itIdx}" data-field="item-title" title="Modifier l'étiquette"` : ''}>${sanitize(it.title)}</b>
                <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? `contenteditable="true" spellcheck="false" data-plate-idx="1" data-item-idx="${itIdx}" data-field="item-desc" title="Modifier le texte"` : ''}>${sanitize(it.desc)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cell plate ${isEditable ? 'cms-card' : ''}">
          <div class="cell-top">
            <span class="dot idx ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="2" data-field="letter" title="Modifier la lettre"' : ''}>${sanitize(plateH.letter || 'H')}</span>
            <span class="rdot"></span>
          </div>
          <div class="label ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="2" data-field="label" title="Modifier le label"' : ''}>${sanitize(plateH.label || 'CONTACT')}</div>
          <div class="cell-body">
            <div class="meta">
              <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="2" data-field="text" title="Modifier le texte de contact"' : ''}>${sanitize(plateH.text || 'POUR UN PROJET, UNE COLLABORATION, OU UNE DISCUSSION.')}</span><br />
              <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="2" data-field="emailPrefix" title="Modifier le préfixe"' : ''}>${sanitize(plateH.emailPrefix || 'ÉCRIS À')}</span> 
              <a class="mailto ${isEditable ? 'cms-editable' : ''}" href="mailto:${sanitize(plateH.email || content.site.email || 'bonjour@bricemg.dev')}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-plate-idx="2" data-field="email" title="Modifier l\'adresse email"' : ''}>${sanitize(plateH.email || content.site.email || 'bonjour@bricemg.dev')}</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic Footer -->
      <div class="foot">
        <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-footer-key="col1" title="Modifier la colonne 1 du footer"' : ''}>${sanitize(footer.col1 || 'BRICEMG')}</span>
        <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-footer-key="col2" title="Modifier la colonne 2 du footer"' : ''}>${sanitize(footer.col2 || 'DESIGN / CODE / VISION')}</span>
        <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-footer-key="col3" title="Modifier la colonne 3 du footer"' : ''}>${sanitize(footer.col3 || 'DESIGN / CODE / VISION')}</span>
        <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-footer-key="col4" title="Modifier l\'email du footer"' : ''}>${sanitize(footer.col4 || 'bonjour@bricemg.dev')}</span>
        <span class="${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-footer-key="col5" title="Modifier le copyright du footer"' : ''}>${sanitize(footer.col5 || '© 2026')}</span>
      </div>
    </div>

    ${!isEditable ? '<a href="admin.html" class="cms-link">CMS</a>' : ''}
  `;
}

window.templates = {
  buildCardHTML: buildCardVisitorHTML,
  buildProjectHTML: buildCardVisitorHTML,
  buildPageHTML
};
