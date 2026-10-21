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

  function initAnimation() {
    const field = document.getElementById('field');
    if (!field) return;
    const canvas = field.querySelector('canvas');
    if (!canvas) return;
    try {
      const animation = new CanvasAnimation(canvas);
      animation.init(field);
    } catch (error) {
      console.error('Erreur initialisation animation:', error);
    }
  }

  function openCardDetail(card, index) {
    const modal = document.getElementById('cardDetailModal');
    if (!modal || !card) return;

    const idxEl = document.getElementById('detailCardIdx');
    const titleEl = document.getElementById('detailCardTitle');
    const imageEl = document.getElementById('detailCardImage');
    const codeEl = document.getElementById('detailCardCode');
    const descEl = document.getElementById('detailCardDesc');
    const typeEl = document.getElementById('detailCardType');
    const statusEl = document.getElementById('detailCardStatus');
    const longTextEl = document.getElementById('detailCardLongText');

    if (idxEl) idxEl.textContent = String((index ?? 0) + 1).padStart(2, '0');
    if (titleEl) titleEl.textContent = card.title || 'SANS TITRE';
    if (imageEl) {
      imageEl.src = card.image || 'media/_placeholder.png';
      imageEl.alt = card.title || 'Aperçu';
    }
    if (codeEl) codeEl.textContent = card.code || 'PROJET';
    if (descEl) descEl.textContent = card.desc || '';
    if (typeEl) typeEl.textContent = card.type || 'PROJET';
    if (statusEl) statusEl.textContent = card.status || card.phase || 'ACTIF';
    if (longTextEl) {
      longTextEl.textContent = card.details || card.desc || 'Présentation détaillée du projet en cours de rédaction au sein du studio BRICEMG.';
    }

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

        let foundCard = null;
        let cardIndex = itemIdx;

        if (!isNaN(secIdx) && currentContent?.sections?.[secIdx]?.items?.[itemIdx]) {
          foundCard = currentContent.sections[secIdx].items[itemIdx];
        } else if (cardId && currentContent?.sections) {
          for (const sec of currentContent.sections) {
            const idx = (sec.items || []).findIndex(it => it.id === cardId);
            if (idx !== -1) {
              foundCard = sec.items[idx];
              cardIndex = idx;
              break;
            }
          }
        }

        if (foundCard) {
          openCardDetail(foundCard, cardIndex);
        }
      }

      if (e.target.closest('#cardDetailCloseBtn')) {
        closeCardDetail();
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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCardDetail();
      }
    });
  }

  render();
})();