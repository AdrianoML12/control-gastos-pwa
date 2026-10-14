// Estado inicial de transacciones (con almacenamiento local)
let transactions = JSON.parse(localStorage.getItem('hotmart_transactions')) || [
  { type: 'income', amount: 5200.00, category: 'Sueldo', desc: 'Salario Tech Consulting', date: '2026-05-01' },
  { type: 'expense', amount: 480.50, category: 'Alimentación', desc: 'Supermercado Wong', date: '2026-05-02' }
];

let expenseChart = null;

// Inicialización al cargar la app
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  // Manejador del formulario de nueva transacción
  const formEl = document.getElementById('tx-form');
  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('tx-type').value;
      const amount = parseFloat(document.getElementById('tx-amount').value);
      const category = document.getElementById('tx-category').value;
      const desc = document.getElementById('tx-desc').value || category;

      if (!amount || amount <= 0) return;

      transactions.unshift({
        type,
        amount,
        category,
        desc,
        date: new Date().toISOString().split('T')[0]
      });

      saveAndRefresh();
      formEl.reset();
      
      // Intentar cerrar modal si existe
      closeModal();
    });
  }
});

// Guardar en localStorage y refrescar pantalla
function saveAndRefresh() {
  localStorage.setItem('hotmart_transactions', JSON.stringify(transactions));
  updateUI();
}

// Actualizar toda la interfaz (Balances, Listas y Gráficos)
function updateUI() {
  let totalBalance = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalBalance += t.amount;
      totalIncome += t.amount;
    } else {
      totalBalance -= t.amount;
      totalExpense += t.amount;
    }
  });

  // Actualizar textos en el DOM de forma segura
  const balEl = document.getElementById('total-balance');
  if (balEl) balEl.innerText = `S/. ${totalBalance.toFixed(2)}`;

  const incEl = document.getElementById('total-income');
  if (incEl) incEl.innerText = `+S/. ${totalIncome.toFixed(2)}`;

  const expEl = document.getElementById('total-expense');
  if (expEl) expEl.innerText = `-S/. ${totalExpense.toFixed(2)}`;

  renderTransactionList();
  renderChart();
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Renderizar la lista de movimientos recientes
function renderTransactionList() {
  const listEl = document.getElementById('tx-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  transactions.forEach((t, index) => {
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : '-';
    const colorClass = isIncome ? 'text-emerald-400' : 'text-gray-200';
    const iconName = isIncome ? 'briefcase' : 'shopping-bag';

    const li = document.createElement('li');
    li.className = 'py-3 flex items-center justify-between';
    li.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-300 border border-white/5">
          <i data-lucide="${iconName}" class="w-4 h-4 ${isIncome ? 'text-emerald-400' : 'text-amber-400'}"></i>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-100">${t.desc}</p>
          <p class="text-[10px] text-gray-500">${t.category} · ${t.date}</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-xs font-semibold ${colorClass}">${sign}S/. ${t.amount.toFixed(2)}</span>
        <button onclick="deleteTransaction(${index})" class="text-gray-600 hover:text-rose-400 transition">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

// Eliminar transacción
function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveAndRefresh();
}

// Renderizar Gráfico de Gastos con Chart.js
function renderChart() {
  const ctx = document.getElementById('expenseChart');
  if (!ctx) return;

  const categories = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Sin gastos'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#9ca3af', font: { size: 10 } } }
      }
    }
  });
}

// Navegación entre pestañas de la PWA
function switchTab(tabName) {
  const views = ['home', 'analytics', 'scan', 'profile'];
  views.forEach(view => {
    const el = document.getElementById(`view-${view}`);
    if (el) el.classList.add('hidden');

    const navBtn = document.getElementById(`nav-${view}`);
    if (navBtn) {
      navBtn.classList.remove('text-white');
      navBtn.classList.add('text-gray-500');
    }
  });

  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) activeView.classList.remove('hidden');

  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) {
    activeNav.classList.remove('text-gray-500');
    activeNav.classList.add('text-white');
  }
}

// Control de Modales (si aplica)
function openModal() {
  const modal = document.getElementById('tx-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('tx-modal');
  if (modal) modal.classList.add('hidden');
}

// --- LÓGICA DE PERFIL Y NOMBRE LOCAL ---

// Cargar perfil guardado o asignar valor por defecto
let userProfile = JSON.parse(localStorage.getItem('hotmart_user_profile')) || { name: 'Adriano' };

// Actualizar textos e inicial del avatar en la pantalla
function updateProfileUI() {
  const greetingEl = document.getElementById('user-greeting');
  const avatarEl = document.getElementById('user-avatar');
  const nameDisplay = document.getElementById('user-display-name');

  if (greetingEl) greetingEl.innerText = `Hola, ${userProfile.name}`;
  if (nameDisplay) nameDisplay.innerText = userProfile.name;
  if (avatarEl && userProfile.name) {
    avatarEl.innerText = userProfile.name.charAt(0).toUpperCase();
  }
}

// Abrir y cerrar el modal de perfil
function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const nameInput = document.getElementById('profile-name-input');
  if (modal) modal.classList.remove('hidden');
  if (nameInput) nameInput.value = userProfile.name;
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
}

// Escuchar el evento de guardado del formulario
document.addEventListener('DOMContentLoaded', () => {
  updateProfileUI();

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newNameInput = document.getElementById('profile-name-input');
      if (newNameInput && newNameInput.value.trim() !== '') {
        userProfile.name = newNameInput.value.trim();
        
        // Guardar en la memoria local del dispositivo (LocalStorage)
        localStorage.setItem('hotmart_user_profile', JSON.stringify(userProfile));
        
        updateProfileUI();
        closeProfileModal();
      }
    });
  }
});