(function () {
  // Template builders for HTML generation with WYSIWYG CMS support
  const sanitize = (window.storageUtils && window.storageUtils.sanitize) || window.sanitize || function (str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  };

  // Auto-linkify: preserves existing <a href> tags, turns plain emails into mailto: and plain URLs into clickable links
  function autoLinkify(str) {
    if (str === null || str === undefined) return '';
    const source = String(str);
    // 1. Extract existing <a> tags and replace with tokens
    const links = [];
    const withTokens = source.replace(
      /<a\s+href\s*=\s*(["'])((?:https?:\/\/|mailto:)[^"'<>\s]+)\1[^>]*>([\s\S]*?)<\/a>/gi,
      (_, _quote, href, label) => {
        const token = `%%LINK_${links.length}%%`;
        links.push({ href, label });
        return token;
      }
    );
    // 2. Sanitize the rest (escapes any remaining HTML)
    let html = sanitize(withTokens);
    // 3. Convert plain emails to mailto links
    html = html.replace(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>');
    // 4. Convert plain URLs to clickable links
    html = html.replace(/(https?:\/\/[^\s<]+)/gi, (match) => {
      const trailing = match.match(/[.,;:!?)]+$/);
      const suffix = trailing ? trailing[0] : '';
      const url = suffix ? match.slice(0, -suffix.length) : match;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${suffix}`;
    });
    // 5. Restore extracted <a> tags
    links.forEach((link, i) => {
      const isMail = link.href.startsWith('mailto:');
      const attrs = isMail ? '' : ' target="_blank" rel="noopener noreferrer"';
      html = html.split(`%%LINK_${i}%%`).join(
        `<a href="${sanitize(link.href)}"${attrs}>${sanitize(link.label)}</a>`
      );
    });
    return html;
  }

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
        title: 'WORKSHOP',
        visible: true,
        items: cards.map(c => ({ ...c, visible: c.visible !== false, status: c.status || 'ACTIVE' }))
      },
      {
        id: 'projets',
        letter: 'B',
        title: 'PROJECTS',
        visible: true,
        items: projects.map(p => ({ ...p, visible: p.visible !== false, status: p.status || p.phase || 'IN PROGRESS' }))
      }
    ];
  }

  const FALLBACK_MEDIA_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='100%25' height='100%25' fill='%23120f24'/%3E%3Cpath d='M0 0l800 500M800 0L0 500' stroke='%232c1f51' stroke-width='1.5' stroke-dasharray='8 8'/%3E%3Ccircle cx='400' cy='250' r='44' fill='none' stroke='%23e17f0e' stroke-width='2'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%23afa6e3' font-family='monospace' font-size='13' letter-spacing='3'%3EBRICEMG / MEDIA%3C/text%3E%3C/svg%3E";
  window.FALLBACK_MEDIA_SVG = FALLBACK_MEDIA_SVG;

  function buildCardVisitorHTML(card, displayIndex, secIdx, realIndex) {
    const itemIdx = (realIndex !== undefined && realIndex !== null) ? realIndex : displayIndex;
    const imgSrc = card.image || 'media/_placeholder.png';
    const displayTitle = card.code || card.title || 'BRAND';
    const displayVersion = card.version || card.status || card.phase || 'v 0.1.0';
    const isFull = card.full === true || card.hasDetail === true;
    const hasMedia = card.showMedia !== false;

    const mediaHTML = hasMedia ? `
        <div class="card-media">
          <img src="${sanitize(imgSrc)}" alt="${sanitize(displayTitle)}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
        </div>` : '';

    if (isFull) {
      return `
      <a class="cell tool tool--has-detail ${!hasMedia ? 'tool--no-media' : ''}" data-tool="${sanitize(card.id)}" data-card-id="${sanitize(card.id)}" data-sec-idx="${secIdx ?? ''}" data-item-idx="${itemIdx}" data-display-idx="${displayIndex}" data-action="open-card-detail" href="javascript:void(0);" target="_self">
        <div class="cell-top">
          <span class="dot idx">${String(displayIndex + 1).padStart(2, '0')}</span>
          <span class="cue"></span>
        </div>
        ${mediaHTML}
        <div class="cell-body">
          <div class="card-content-block">
            <div class="name">${sanitize(displayTitle)}</div>
            <div class="desc">${sanitize(card.desc || '')}</div>
          </div>
          <dl class="dates">
            <div><dt>TYPE</dt><dd>${sanitize(card.type || 'IDENTITY')}</dd></div>
            <div><dt>VERSION</dt><dd>${sanitize(displayVersion)}</dd></div>
          </dl>
          <div class="go">VIEW DETAILS<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>
        </div>
      </a>
    `;
    }

    return `
    <div class="cell tool tool--standard ${!hasMedia ? 'tool--no-media' : ''}" data-tool="${sanitize(card.id)}" data-card-id="${sanitize(card.id)}" data-sec-idx="${secIdx ?? ''}" data-item-idx="${itemIdx}" data-display-idx="${displayIndex}">
      <div class="cell-top">
        <span class="dot idx">${String(displayIndex + 1).padStart(2, '0')}</span>
        <span class="cue"></span>
      </div>
      ${mediaHTML}
      <div class="cell-body">
        <div class="card-content-block">
          <div class="name">${sanitize(displayTitle)}</div>
          <div class="desc">${sanitize(card.desc || '')}</div>
        </div>
        <dl class="dates">
          <div><dt>TYPE</dt><dd>${sanitize(card.type || 'IDENTITY')}</dd></div>
          <div><dt>VERSION</dt><dd>${sanitize(displayVersion)}</dd></div>
        </dl>
      </div>
    </div>
  `;
  }

  function buildCardEditableHTML(card, index, secIdx, totalCards) {
    const isHidden = card.visible === false;
    const isFull = card.full === true || card.hasDetail === true;
    const hasMedia = card.showMedia !== false;
    const imgSrc = card._tempPreview || card.image || 'media/_placeholder.png';
    const displayTitle = card.code || card.title || 'BRAND';
    const displayVersion = card.version || card.status || card.phase || 'v 0.1.0';

    const mediaHTML = hasMedia ? `
      <div class="card-media cms-card-media" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Cliquer pour changer l'image">
        <img src="${sanitize(imgSrc)}" alt="${sanitize(displayTitle)}" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
        <div class="cms-media-overlay" data-action="edit-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}">
          <span class="cms-media-btn">📷 CHANGER L'IMAGE</span>
          <span class="cms-media-badge">${sanitize(imgSrc)}</span>
        </div>
      </div>` : '';

    return `
    <div class="cell tool cms-card ${isHidden ? 'cms-card--hidden' : ''} ${isFull ? 'tool--has-detail' : 'tool--standard'} ${!hasMedia ? 'tool--no-media' : ''}" 
         data-sec-idx="${secIdx}" 
         data-item-idx="${index}" 
         data-item-id="${sanitize(card.id)}">
      <div class="cms-card-toolbar">
        ${isFull ? `<button type="button" class="cms-tool-btn" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Ouvrir la vue détaillée & rédiger les notes">🔍 DÉTAILS</button>` : ''}
        <button type="button" class="cms-tool-btn cms-btn-toggle-full ${isFull ? 'is-full-active' : ''}" data-action="toggle-card-full" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Activer / désactiver la vue détaillée">${isFull ? 'FULL' : 'STANDARD'}</button>
        <button type="button" class="cms-tool-btn cms-btn-toggle-media ${!hasMedia ? 'is-off' : ''}" data-action="toggle-card-media" data-sec-idx="${secIdx}" data-item-idx="${index}" title="Afficher / Masquer l'image">${hasMedia ? 'IMG ON' : 'IMG OFF'}</button>
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
      ${mediaHTML}
      <div class="cell-body">
        <div class="card-content-block">
          <div class="name cms-editable" contenteditable="true" spellcheck="false" data-field="code" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(displayTitle)}</div>
          <div class="desc cms-editable" contenteditable="true" spellcheck="false" data-field="desc" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.desc || '')}</div>
        </div>
        <dl class="dates">
          <div>
            <dt>TYPE</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="type" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(card.type || 'IDENTITY')}</dd>
          </div>
          <div>
            <dt>VERSION</dt>
            <dd class="cms-editable" contenteditable="true" spellcheck="false" data-field="version" data-sec-idx="${secIdx}" data-item-idx="${index}">${sanitize(displayVersion)}</dd>
          </div>
        </dl>
        ${isFull ? `<div class="go cms-btn-detail-trigger" data-action="open-card-detail" data-sec-idx="${secIdx}" data-item-idx="${index}" style="cursor: pointer;">VIEW DETAILS<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5H8.5V7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></div>` : ''}
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
          ${visibleItems.map((card, visibleIdx) => {
          const realIdx = items.indexOf(card);
          return buildCardVisitorHTML(card, visibleIdx, secIdx, realIdx !== -1 ? realIdx : visibleIdx);
        }).join('')}
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

    // Définition des contenus des 2 premières cellules du header
    const cell1Title = site.cell1Title || siteNamespace || 'BRICEMG';
    const defaultCell1Body = `${siteType || 'STUDIO'}\n${site.subtitle || 'DESIGN / CODE / VISION'}\n\nINDEX V0.1\nLANGUAGE : EN`;
    const cell1Body = site.cell1Body !== undefined ? site.cell1Body : defaultCell1Body;

    const cell2Title = site.cell2Title || 'ABOUT';
    const defaultCell2Body = `CREATE\n${site.intro || 'I create interfaces, visual identities, and web experiences that bring meaning to an idea.'}\n\nTHINKING\nDESIGN, CRAFT AND DEVELOP FROM END TO END\n\nOBJECTIVE\n${site.about || 'I craft and build projects at the crossroads of design, product, and code.'}`;
    const cell2Body = site.cell2Body !== undefined ? site.cell2Body : defaultCell2Body;

    function formatMetaLines(rawText) {
      if (!rawText) return '';
      // Séparation par groupes (séparés par un ou plusieurs sauts de ligne vides)
      const normalized = String(rawText).replace(/\r\n/g, '\n');
      const groupBlocks = normalized.split(/\n\s*\n/);
      const transform = isEditable ? sanitize : autoLinkify;

      return groupBlocks.map(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return '';
        const linesHTML = lines.map((line, idx) => {
          const cls = idx === 0 ? 'meta-line--primary' : 'meta-line--sub';
          return `<span class="${cls}">${transform(line)}</span>`;
        }).join('');
        return `<div class="meta-group">${linesHTML}</div>`;
      }).join('');
    }

    return `
    <div class="sheet ${isEditable ? 'sheet--editable' : ''}">
      <div class="row row--three">
        <div class="cell">
          <div class="cell-top">
            <h1 class="dot title ${isEditable ? 'cms-editable' : ''}" style="margin: 0; font-weight: inherit;" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="site-cell1-title"' : ''}>${sanitize(cell1Title)}</h1>
          </div>
          <div class="cell-body">
            <div class="cell-meta-list ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="site-cell1-body"' : ''}>
              ${formatMetaLines(cell1Body)}
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="cell-top">
            <h2 class="dot title ${isEditable ? 'cms-editable' : ''}" style="margin: 0; font-weight: inherit;" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="site-cell2-title"' : ''}>${sanitize(cell2Title)}</h2>
          </div>
          <div class="cell-body">
            <div class="cell-meta-list ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="site-cell2-body"' : ''}>
              ${formatMetaLines(cell2Body)}
            </div>
          </div>
        </div>
        <div class="cell cell--play" id="field">
          <div class="play" aria-hidden="true"><canvas></canvas></div>
          <div class="cell-body">
            <p class="claim ${isEditable ? 'cms-editable' : ''}" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="site-hero-claim"' : ''}>${sanitize(site.heroClaim || '')}</p>
          </div>
        </div>
      </div>
      ${sectionsHTML}
      ${addSectionRowHTML}
      <div class="foot">
        <span>${sanitize(footer.col1 || 'BRICEMG')}</span>
        <span>${sanitize(footer.col2 || '')}</span>
        <span>${sanitize(footer.col3 || '')}</span>
        <span>${autoLinkify(footer.col4 || '')}</span>
        <span>${sanitize(footer.col5 || '© 2026')}</span>
      </div>
    </div>
    ${buildCardDetailModalHTML(isEditable)}
  `;
  }

  // Pour remettre le lien discret vers le CMS en bas à droite :
  // ${!isEditable ? '<a href="noAdmin.html" class="cms-link">CMS</a>' : ''} sous ${buildCardDetailModalHTML(isEditable)} ^

  function buildCardDetailModalHTML(isEditable) {
    return `
    <div id="cardDetailModal" class="card-detail-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="card-detail-dialog">
        <!-- Flèches latérales grand écran -->
        <button type="button" class="card-detail-side-arrow card-detail-side-arrow--prev" id="detailCardSidePrevBtn" aria-label="Contenu précédent" title="Précédent (Flèche gauche)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button type="button" class="card-detail-side-arrow card-detail-side-arrow--next" id="detailCardSideNextBtn" aria-label="Contenu suivant" title="Suivant (Flèche droite)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div class="cell card-detail-card">
          <!-- Actions d'en-tête (flèches universelles + fermeture) -->
          <div class="card-detail-header-actions">
            <!-- <button type="button" class="card-detail-nav-btn" id="detailCardPrevBtn" aria-label="Contenu précédent" title="Précédent (Flèche gauche)">
            //   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            //     <polyline points="15 18 9 12 15 6"></polyline>
            //   </svg>
            // </button>
            // <button type="button" class="card-detail-nav-btn" id="detailCardNextBtn" aria-label="Contenu suivant" title="Suivant (Flèche droite)">
            //   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            //     <polyline points="9 18 15 12 9 6"></polyline>
            //   </svg>
            --> </button>
            <button type="button" class="card-detail-close-btn" id="cardDetailCloseBtn" aria-label="Fermer la vue détaillée" title="Fermer (Échap)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="cell-top">
            <div class="card-detail-index-wrap">
              <span class="dot idx" id="detailCardIdx">01</span>
              <span class="cue"></span>
              <span class="card-detail-sec-tag" id="detailCardSecTag" style="display: none;"></span>
            </div>
          </div>

          <div class="card-detail-media">
            <img id="detailCardImage" src="media/_placeholder.png" alt="Project preview" onerror="this.onerror=null; this.src='${FALLBACK_MEDIA_SVG}';" />
          </div>

          <div class="card-content-block">
            <h2 class="card-detail-title ${isEditable ? 'cms-editable' : ''}" id="detailCardTitle" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="code"' : ''}>BRAND</h2>
            <div class="desc ${isEditable ? 'cms-editable' : ''}" id="detailCardDesc" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="desc"' : ''}>Logo, brand guidelines, visual system.</div>
          </div>

          <dl class="dates card-detail-dates">
            <div><dt>TYPE</dt><dd class="${isEditable ? 'cms-editable' : ''}" id="detailCardType" ${isEditable ? 'contenteditable="true" spellcheck="false" data-field="type"' : ''}>IDENTITY</dd></div>
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