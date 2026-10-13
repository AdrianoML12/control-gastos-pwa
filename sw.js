// Cargar perfil guardado localmente o usar uno por defecto
let userProfile = JSON.parse(localStorage.getItem('hotmart_user_profile')) || { name: 'Adriano' };

document.addEventListener('DOMContentLoaded', () => {
  updateProfileUI();

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('profile-name-input').value.trim();
      if (newName) {
        userProfile.name = newName;
        localStorage.setItem('hotmart_user_profile', JSON.stringify(userProfile));
        updateProfileUI();
        closeProfileModal();
      }
    });
  }
});

function updateProfileUI() {
  const greetingEl = document.getElementById('user-greeting');
  const avatarEl = document.getElementById('user-avatar');
  
  if (greetingEl) {
    greetingEl.innerText = `Hola, ${userProfile.name}`;
  }
  if (avatarEl) {
    avatarEl.innerText = userProfile.name.charAt(0).toUpperCase();
  }
}

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const input = document.getElementById('profile-name-input');
  if (modal && input) {
    input.value = userProfile.name;
    modal.classList.remove('hidden');
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
}
const CACHE_NAME = 'gastos-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
