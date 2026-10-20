(function () {
  const { getContent, applyTheme } = window.storageUtils;
  const { buildPageHTML } = window.templates;
  const { CanvasAnimation } = window;

  async function render() {
    const content = await getContent();
    if (applyTheme && content.theme) {
      applyTheme(content.theme);
    }
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = buildPageHTML(content);
    initAnimation();
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

  render();
})();