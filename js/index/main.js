(function () {
  const { getContent, applyTheme } = window.storageUtils;
  const { buildPageHTML } = window.templates;
  const { CanvasAnimation } = window;

  let currentContent = null;

  async function render() {
    currentContent = await getContent();
    if (applyTheme && currentContent.theme) {
      applyTheme(currentContent.theme);
    }
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = buildPageHTML(currentContent);
    initAnimation();
    setupCardDetailListeners();
  }
  let activeAnimation = null;

  function initAnimation() {
    const field = document.getElementById('field');
    if (!field) return;
    const canvas = field.querySelector('canvas');
    if (!canvas) return;
    try {
      if (activeAnimation && typeof activeAnimation.destroy === 'function') {
        activeAnimation.destroy();
      }
      activeAnimation = new CanvasAnimation(canvas);
      activeAnimation.init(field);
    } catch (error) {
      console.error('Erreur initialisation animation:', error);
    }
  }

  let currentDetailList = [];
  let currentDetailIndex = -1;

  function getDetailCardsList() {
    const sections = currentContent?.sections || [];
    const list = [];
    sections.forEach((sec, secIdx) => {
      if (sec.visible === false) return;
      const items = sec.items || [];
      const visibleItems = items.filter(it => it.visible !== false);
      visibleItems.forEach((card, sectionDisplayIdx) => {
        if (card.full === true || card.hasDetail === true) {
          list.push({
            card,
            secIdx,
            secLetter: sec.letter || '',
            secTitle: sec.title || '',
            sectionDisplayIdx
          });
        }
      });
    });
    return list;
  }

  function updateNavArrows(index) {
    const hasPrev = index > 0;
    const hasNext = index < currentDetailList.length - 1;

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

  function displayCardDetailByIndex(index) {
    if (index < 0 || index >= currentDetailList.length) return;
    currentDetailIndex = index;
    const item = currentDetailList[index];
    const card = item.card;

    const idxEl = document.getElementById('detailCardIdx');
    const secTagEl = document.getElementById('detailCardSecTag');
    const titleEl = document.getElementById('detailCardTitle');
    const imageEl = document.getElementById('detailCardImage');
    const codeEl = document.getElementById('detailCardCode');
    const descEl = document.getElementById('detailCardDesc');
    const typeEl = document.getElementById('detailCardType');
    const statusEl = document.getElementById('detailCardStatus');
    const longTextEl = document.getElementById('detailCardLongText');

    if (idxEl) idxEl.textContent = String(item.sectionDisplayIdx + 1).padStart(2, '0');
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
      imageEl.src = card.image || 'media/_placeholder.png';
      imageEl.alt = card.title || card.code || 'Preview';
    }
    if (codeEl) codeEl.textContent = card.code || 'PROJECT';
    if (descEl) descEl.textContent = card.desc || '';
    if (typeEl) typeEl.textContent = card.type || 'IDENTITY';
    if (statusEl) statusEl.textContent = card.version || card.status || card.phase || 'v 0.1.0';
    if (longTextEl) {
      const raw = card.details || card.desc || 'Detailed presentation of the project currently in preparation at BRICEMG studio.';
      const formatDetailHtml = (window.storageUtils && window.storageUtils.formatDetailHtml) || window.formatDetailHtml;
      if (typeof formatDetailHtml === 'function') {
        longTextEl.innerHTML = formatDetailHtml(raw);
      } else {
        longTextEl.textContent = raw;
      }
    }

    updateNavArrows(index);
  }

  function navigateDetail(direction) {
    const nextIndex = currentDetailIndex + direction;
    if (nextIndex >= 0 && nextIndex < currentDetailList.length) {
      displayCardDetailByIndex(nextIndex);
    }
  }

  function openCardDetail(card, index) {
    const modal = document.getElementById('cardDetailModal');
    if (!modal || !card) return;

    currentDetailList = getDetailCardsList();
    const foundIdx = currentDetailList.findIndex(entry => entry.card.id === card.id || entry.card === card);
    const targetIdx = foundIdx !== -1 ? foundIdx : 0;

    displayCardDetailByIndex(targetIdx);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCardDetail() {
    const modal = document.getElementById('cardDetailModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentDetailIndex = -1;
  }

  function setupCardDetailListeners() {
    const app = document.getElementById('app');
    if (!app) return;

    app.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-action="open-card-detail"]');
      if (trigger) {
        e.preventDefault();
        const cardId = trigger.getAttribute('data-card-id');
        const secIdx = parseInt(trigger.getAttribute('data-sec-idx'), 10);
        const itemIdx = parseInt(trigger.getAttribute('data-item-idx'), 10);
        const displayIdx = parseInt(trigger.getAttribute('data-display-idx'), 10);

        let foundCard = null;
        let cardIndex = !isNaN(displayIdx) ? displayIdx : itemIdx;

        // 1. Recherche prioritaire par ID exact de la carte si présent
        if (cardId && currentContent?.sections) {
          for (const sec of currentContent.sections) {
            const found = (sec.items || []).find(it => it.id === cardId);
            if (found) {
              foundCard = found;
              break;
            }
          }
        }

        // 2. Repli par secIdx / itemIdx réel
        if (!foundCard && !isNaN(secIdx) && currentContent?.sections?.[secIdx]?.items?.[itemIdx]) {
          foundCard = currentContent.sections[secIdx].items[itemIdx];
        }

        if (foundCard) {
          openCardDetail(foundCard, cardIndex);
        }
      }

      // Fermeture
      if (e.target.closest('#cardDetailCloseBtn')) {
        closeCardDetail();
      }

      // Navigation précédente
      if (e.target.closest('#detailCardPrevBtn') || e.target.closest('#detailCardSidePrevBtn')) {
        e.preventDefault();
        navigateDetail(-1);
      }

      // Navigation suivante
      if (e.target.closest('#detailCardNextBtn') || e.target.closest('#detailCardSideNextBtn')) {
        e.preventDefault();
        navigateDetail(1);
      }
    });

    const modal = document.getElementById('cardDetailModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeCardDetail();
        }
      });
    }

    // Clics sur les liens furtifs (téléchargements et liens sans aperçu d'URL dans la barre d'état du navigateur)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-href]');
      if (!link) return;
      e.preventDefault();
      const targetUrl = (link.getAttribute('data-href') || '').trim();
      if (!targetUrl) return;

      // Protection contre les protocoles dangereux (javascript:, vbscript:, data:)
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
    });

    window.addEventListener('keydown', (e) => {
      const modalEl = document.getElementById('cardDetailModal');
      const isOpen = modalEl && modalEl.classList.contains('is-open');

      // Déclenchement au clavier (Entrée / Espace) sur les cartes et liens furtifs
      if (e.key === 'Enter' || e.key === ' ') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.matches('[data-action="open-card-detail"]') || activeEl.matches('[data-href]'))) {
          e.preventDefault();
          activeEl.click();
          return;
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        closeCardDetail();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateDetail(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateDetail(1);
      }
    });
  }

  render();
})();