/**
 * BABYCARE STORE - FRONTEND SCRIPT (API INTEGRATED)
 */

// ==========================================
// 1. CONFIG & STATE
// ==========================================

// Ganti dengan URL Railway setelah deploy
const BASE_URL = 'http://localhost:3000/api';
// const BASE_URL = 'https://babycare-api.railway.app/api';

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('bc_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('bc_session')) || null;
let isLoginMode = true;
const ONGKIR = 20000;

// ==========================================
// 2. INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('bc_theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
    loadProducts();
    updateUI();
    checkAdminAccess();
});

// ==========================================
// 3. API HELPER
// ==========================================
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Koneksi ke server gagal' };
    }
}

// ==========================================
// 4. NAVIGASI
// ==========================================
function showSection(id) {
    const sections = ['shop', 'auth', 'cart', 'checkout', 'tracking', 'history'];
    sections.forEach(s => {
        const el = document.getElementById(s + '-section');
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(id + '-section');
    if (target) target.classList.remove('hidden');

    if (id === 'cart') renderCart();
    if (id === 'history') loadHistory();
    if (id === 'checkout') updateCheckoutTotal();
    window.scrollTo(0, 0);
}

function updateUI() {
    const cartCount = cart.reduce((total, item) => total + item.qty, 0);
    const cartCountEl = document.getElementById('cart-count');
    const authBtnEl = document.getElementById('auth-btn');
    if (cartCountEl) cartCountEl.textContent = cartCount;
    if (authBtnEl) authBtnEl.textContent = currentUser ? 'Logout' : 'Login';
}

function checkAdminAccess() {
    const adminContainer = document.getElementById('admin-panel-link');
    if (!adminContainer) return;
    if (currentUser && currentUser.role === 'admin') {
        adminContainer.innerHTML = `
            <a href="admin.html" class="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase shadow-lg hover:bg-red-700 transition">
                <i class="fas fa-user-shield"></i> Admin Panel
            </a>`;
    } else {
        adminContainer.innerHTML = '';
    }
}

// ==========================================
// 5. PRODUK
// ==========================================
async function loadProducts() {
    const result = await apiFetch('/products');
    if (result.success) {
        allProducts = result.data;
    } else {
        // Fallback ke data.json lokal
        console.warn('Gagal load dari API, fallback ke data.json lokal');
        try {
            const res = await fetch('data.json');
            allProducts = await res.json();
        } catch (e) {
            allProducts = [];
        }
    }
    renderProducts(allProducts);
}

function renderProducts(data) {
    const container = document.getElementById('product-container');
    if (!container) return;
    if (data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20 opacity-30 italic">Produk tidak ditemukan.</div>`;
        return;
    }
    container.innerHTML = data.map(p => `
        <div class="bg-white dark:bg-navy rounded-2xl overflow-hidden shadow-lg group border dark:border-slate-800 transition hover:shadow-2xl">
            <div class="relative overflow-hidden">
                <img src="${p.image}" class="w-full h-56 object-cover group-hover:scale-110 transition duration-500">
                <span class="absolute top-4 left-4 bg-gold text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">${p.category}</span>
            </div>
            <div class="p-6">
                <h3 class="text-md font-bold mb-1">${p.name}</h3>
                <p class="text-[11px] opacity-60 mb-5 line-clamp-2 h-8 leading-relaxed">${p.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-black text-navy dark:text-white">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
                    <button onclick="addToCart(${p.id})" class="bg-navy dark:bg-gold text-white p-3 rounded-xl text-sm active:scale-75 transition shadow-lg">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const q = document.getElementById('product-search').value.toLowerCase();
    renderProducts(allProducts.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
}

function filterCategory(cat) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-gold', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-slate-800');
    });
    event.currentTarget.classList.add('bg-gold', 'text-white');
    event.currentTarget.classList.remove('bg-gray-200', 'dark:bg-slate-800');
    renderProducts(cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat));
}

// ==========================================
// 6. KERANJANG
// ==========================================
function addToCart(id) {
    if (!currentUser) return showSection('auth');
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    const item = cart.find(i => i.id === id);
    item ? item.qty++ : cart.push({ ...product, qty: 1 });
    saveCart();
    showToast("Berhasil ditambahkan!");
}
function updateQty(index, change) {
    if (cart[index].qty + change > 0) cart[index].qty += change;
    else cart.splice(index, 1);
    saveCart();
    renderCart();
}
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('bc_cart', JSON.stringify(cart));
    updateUI();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let subtotal = 0;
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center py-20 opacity-30 italic">Keranjang belanja kosong.</p>`;
        document.getElementById('cart-total').textContent = "Rp 0";
        return;
    }
    container.innerHTML = cart.map((item, index) => {
        subtotal += item.price * item.qty;
        return `
            <div class="flex justify-between items-center bg-white dark:bg-navy p-5 rounded-xl shadow-sm border dark:border-slate-800">
                <div class="flex-1">
                    <div class="text-xs font-black uppercase tracking-tighter text-gold mb-1">${item.name}</div>
                    <div class="text-[11px] font-bold opacity-60 italic">Rp ${Number(item.price).toLocaleString('id-ID')} / unit</div>
                </div>
                <div class="flex items-center space-x-3 mx-6 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                    <button onclick="updateQty(${index}, -1)" class="text-gold font-black w-6 h-6 hover:scale-125 transition">-</button>
                    <span class="text-xs font-bold w-5 text-center">${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)" class="text-gold font-black w-6 h-6 hover:scale-125 transition">+</button>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 transition px-2"><i class="fas fa-trash-alt"></i></button>
            </div>`;
    }).join('');
    document.getElementById('cart-total').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
}

// ==========================================
// 7. CHECKOUT (TERINTEGRASI API)
// ==========================================
function updateCheckoutTotal() {
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    document.getElementById('checkout-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('checkout-grand-total').textContent = `Rp ${(subtotal + ONGKIR).toLocaleString('id-ID')}`;
    document.getElementById('qris-area').classList.add('hidden');
}

function toggleQRISInfo() {
    const val = document.getElementById('checkout-payment').value;
    val === 'QRIS' ? document.getElementById('qris-area').classList.remove('hidden') : document.getElementById('qris-area').classList.add('hidden');
}

document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return showToast("Keranjang kosong!");

    const btn = e.target.querySelector('button[type=submit]');
    btn.textContent = 'Memproses...';
    btn.disabled = true;

    const payload = {
        user_email: currentUser.email,
        customer_name: document.getElementById('checkout-name').value,
        customer_phone: document.getElementById('checkout-phone').value,
        customer_address: document.getElementById('checkout-address').value,
        payment_method: document.getElementById('checkout-payment').value,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))
    };

    const result = await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    btn.textContent = 'Pesan Sekarang';
    btn.disabled = false;

    if (result.success) {
        cart = [];
        saveCart();
        alert(`Pesanan Berhasil!\nNo. Resi: ${result.data.resi}\nTotal: Rp ${result.data.total.toLocaleString('id-ID')}`);
        showSection('history');
    } else {
        // Fallback ke localStorage jika API tidak tersedia
        const resi = 'BC-' + Math.floor(100000 + Math.random() * 900000);
        const history = JSON.parse(localStorage.getItem('bc_history')) || [];
        history.push({
            resi, user: currentUser.email, ...payload,
            status: 'Pending',
            date: new Date().toLocaleDateString('id-ID'),
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0) + ONGKIR
        });
        localStorage.setItem('bc_history', JSON.stringify(history));
        cart = []; saveCart();
        alert(`Pesanan Berhasil! (offline)\nResi: ${resi}`);
        showSection('history');
    }
};

// ==========================================
// 8. RIWAYAT PESANAN (DARI API)
// ==========================================
async function loadHistory() {
    if (!currentUser) return;
    const list = document.getElementById('history-list');
    list.innerHTML = `<p class="text-center opacity-40 italic py-10">Memuat riwayat...</p>`;

    const result = await apiFetch(`/orders/user/${encodeURIComponent(currentUser.email)}`);
    let orders = [];

    if (result.success) {
        orders = result.data;
    } else {
        // Fallback ke localStorage
        orders = (JSON.parse(localStorage.getItem('bc_history')) || []).filter(o => o.user === currentUser.email);
    }

    if (orders.length === 0) {
        list.innerHTML = `<p class="text-center py-20 opacity-30 italic font-bold">Belum ada pesanan.</p>`;
        return;
    }

    list.innerHTML = [...orders].reverse().map(o => `
        <div class="bg-white dark:bg-navy p-6 rounded-2xl shadow-sm border-l-8 border-gold flex justify-between items-center animate-fade">
            <div>
                <div class="text-[10px] opacity-40 font-black mb-1">${o.order_date || o.date || '-'}</div>
                <div class="flex items-center gap-2">
                    <span class="font-black text-xl tracking-tighter uppercase">${o.resi}</span>
                    <button onclick="copyToClipboard('${o.resi}')" class="text-gold bg-gold/10 p-2 rounded-lg hover:bg-gold hover:text-white transition shadow-sm">
                        <i class="fas fa-copy text-xs"></i>
                    </button>
                </div>
                <div class="mt-2 text-xs font-bold">Total: <span class="text-gold">Rp ${Number(o.total).toLocaleString('id-ID')}</span></div>
            </div>
            <div class="text-right">
                <span class="bg-gold text-white px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-md mb-2 inline-block">${o.status}</span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 9. LACAK PESANAN (DARI API)
// ==========================================
async function trackPackage() {
    const resiInput = document.getElementById('tracking-input').value.trim();
    const resultDiv = document.getElementById('tracking-result');
    if (!resiInput) return showToast("Masukkan nomor resi!");
    resultDiv.innerHTML = `<p class="text-center opacity-40 italic py-6">Mencari resi...</p>`;

    const result = await apiFetch(`/orders/track/${resiInput}`);

    if (result.success) {
        const o = result.data;
        resultDiv.innerHTML = `
            <div class="p-10 bg-white dark:bg-navy rounded-2xl shadow-2xl border-t-8 border-gold animate-fade text-center">
                <div class="text-[10px] font-black opacity-40 uppercase mb-3 tracking-widest">Update Status</div>
                <h3 class="text-4xl font-black text-gold uppercase mb-6 tracking-tighter">${o.status}</h3>
                <div class="space-y-2 text-left text-xs border-t dark:border-slate-800 pt-6">
                    <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Penerima:</span><b class="uppercase">${o.customer_name}</b></div>
                    <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Resi:</span><b>${o.resi}</b></div>
                    <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Tgl Pesan:</span><b>${o.order_date}</b></div>
                </div>
            </div>`;
    } else {
        // Fallback ke localStorage
        const history = JSON.parse(localStorage.getItem('bc_history')) || [];
        const found = history.find(h => h.resi.toLowerCase() === resiInput.toLowerCase());
        if (found) {
            resultDiv.innerHTML = `
                <div class="p-10 bg-white dark:bg-navy rounded-2xl shadow-2xl border-t-8 border-gold animate-fade text-center">
                    <div class="text-[10px] font-black opacity-40 uppercase mb-3 tracking-widest">Update Status</div>
                    <h3 class="text-4xl font-black text-gold uppercase mb-6 tracking-tighter">${found.status}</h3>
                    <div class="space-y-2 text-left text-xs border-t dark:border-slate-800 pt-6">
                        <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Penerima:</span><b class="uppercase">${found.customerName || '-'}</b></div>
                        <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Resi:</span><b>${found.resi}</b></div>
                        <div class="flex justify-between"><span class="opacity-50 uppercase font-bold">Tgl Pesan:</span><b>${found.date || '-'}</b></div>
                    </div>
                </div>`;
        } else {
            resultDiv.innerHTML = `<div class="p-8 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl font-bold border-2 border-dashed border-red-200">Maaf, nomor resi tidak terdaftar!</div>`;
        }
    }
}

// ==========================================
// 10. AUTH (TERINTEGRASI API)
// ==========================================
function handleAuthAction() {
    if (currentUser) {
        localStorage.removeItem('bc_session');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        location.reload();
    } else {
        showSection('auth');
    }
}

document.getElementById('auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-password').value;

    if (isLoginMode) {
        const result = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('bc_session', JSON.stringify(currentUser));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', currentUser.role);
            showSection('shop');
            updateUI();
            checkAdminAccess();
            showToast("Selamat Datang!");
        } else {
            // Fallback login lama
            const ADMIN_EMAIL = "admin@babycare.com";
            const users = JSON.parse(localStorage.getItem('bc_users')) || [];
            let u;
            if (email === ADMIN_EMAIL) {
                u = { email: ADMIN_EMAIL, role: 'admin' };
            } else {
                u = users.find(user => user.email.toLowerCase() === email);
                if (u) u.role = 'customer';
            }
            if (u) {
                currentUser = u;
                localStorage.setItem('bc_session', JSON.stringify(u));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', u.role);
                showSection('shop'); updateUI(); checkAdminAccess();
                showToast("Selamat Datang!");
            } else {
                alert("Email atau password salah.");
            }
        }
    } else {
        const result = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success) {
            isLoginMode = true;
            toggleAuthMode();
            alert("Berhasil daftar! Silakan masuk.");
        } else {
            // Fallback register lama
            const users = JSON.parse(localStorage.getItem('bc_users')) || [];
            if (users.some(u => u.email.toLowerCase() === email)) {
                return alert("Email sudah terdaftar!");
            }
            users.push({ email, role: 'customer' });
            localStorage.setItem('bc_users', JSON.stringify(users));
            isLoginMode = true;
            toggleAuthMode();
            alert("Berhasil daftar! Silakan masuk.");
        }
    }
};

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').textContent = isLoginMode ? 'Login Akun' : 'Daftar Akun';
}

// ==========================================
// 11. UTILS
// ==========================================
function showToast(m) {
    const t = document.getElementById('toast');
    if (t) { t.textContent = m; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 2500); }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast("Nomor resi disalin!"));
}

document.getElementById('dark-mode-toggle').onclick = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('bc_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};
