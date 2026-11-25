// Guarded Dark Mode Toggle Script
(function () {
    'use strict';
    var STORAGE_KEY = 'gnep-dark-mode';
    var btn = document.getElementById('dark-mode-toggle');
    if (!btn) return;

    function safeGetStorage(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSetStorage(key, val) {
        try { window.localStorage.setItem(key, val); } catch (e) {}
    }

    function setMode(dark) {
        if (dark) {
            document.body.classList.add('dark-mode');
            btn.textContent = '☀️';
            btn.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            btn.textContent = '🌙';
            btn.setAttribute('aria-pressed', 'false');
        }
        safeSetStorage(STORAGE_KEY, dark ? '1' : '0');
    }

    var saved = safeGetStorage(STORAGE_KEY);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(saved !== null ? saved === '1' : prefersDark);

    btn.addEventListener('click', function () {
        setMode(!document.body.classList.contains('dark-mode'));
    });
})();
