// Dark mode toggle script
(function() {
  const STORAGE_KEY = 'gnep-dark-mode';
  const btn = document.getElementById('dark-mode-toggle');
  if (!btn) return;
  const setMode = (dark) => {
    if (dark) {
      document.body.classList.add('dark-mode');
      btn.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      btn.textContent = '🌙';
    }
    localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
  };
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setMode(saved ? saved === '1' : prefersDark);
  btn.addEventListener('click', () => setMode(!document.body.classList.contains('dark-mode')));
})();
