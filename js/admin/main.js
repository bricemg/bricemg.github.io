// Admin authentication and initialization

(function () {
  const { ADMIN_SECRET, getContent, saveContent, applyTheme } = window.storageUtils;
  const { collectFormData, fillForm } = window.adminForm;

  // Apply theme on load for admin as well
  if (applyTheme) {
    applyTheme(getContent().theme);
  }

  function showAdmin() {
    document.getElementById('authPanel').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
  }

  function saveFromForm() {
    const content = getContent();
    const next = collectFormData(content);
    
    if (saveContent(next)) {
      const message = document.getElementById('saveMessage');
      message.classList.remove('hidden');
      setTimeout(() => {
        message.classList.add('hidden');
      }, 2000);
    } else {
      alert('Erreur lors de la sauvegarde.');
    }
  }

  function resetContent() {
    if (confirm('Êtes-vous sûr? Cela réinitialisera tout le contenu.')) {
      localStorage.removeItem(window.storageUtils.STORAGE_KEY);
      location.reload();
    }
  }

  // Event listeners
  document.getElementById('loginBtn').addEventListener('click', () => {
    const value = document.getElementById('secret').value.trim();
    if (value === ADMIN_SECRET) {
      showAdmin();
      fillForm(getContent());
    } else {
      alert('Clé incorrecte.');
    }
  });

  document.getElementById('saveBtn').addEventListener('click', saveFromForm);
  document.getElementById('resetBtn').addEventListener('click', resetContent);

  document.getElementById('secret').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('loginBtn').click();
    }
  });
})();
