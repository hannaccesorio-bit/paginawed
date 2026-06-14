const PRODUCTS_KEY = 'hanna_products';

const defaultProducts = [
    { id: 1, name: 'Cronógrafo Clásico Plateado', brand: 'HANNA', category: 'men', price: 196000, oldPrice: null, badge: 'Nuevo', material: 'Acero inoxidable', movement: 'Cuarzo japonés', water: '50m', warranty: 2, image: '' },
    { id: 2, name: 'Dama Elegante Dorado', brand: 'HANNA', category: 'women', price: 156800, oldPrice: 196000, badge: '-20%', material: 'Acero dorado', movement: 'Cuarzo suizo', water: '30m', warranty: 2, image: '' },
    { id: 3, name: 'Deportivo SMT Cronógrafo', brand: 'HANNA', category: 'men', price: 230000, oldPrice: null, badge: 'Nuevo', material: 'Acero + silicona', movement: 'Mecánico automático', water: '100m', warranty: 3, image: '' },
    { id: 4, name: 'Smart Watch Pro Serie 5', brand: 'HANNA Tech', category: 'smart', price: 320000, oldPrice: 380000, badge: '-16%', material: 'Aluminio + cristal', movement: 'Digital', water: 'IP68', warranty: 1, image: '' },
    { id: 5, name: 'Submariner Edición Limitada', brand: 'HANNA', category: 'men', price: 450000, oldPrice: null, badge: 'Nuevo', material: 'Acero 316L', movement: 'Automático', water: '200m', warranty: 5, image: '' },
    { id: 6, name: 'Dama Cristal Swarovski', brand: 'HANNA', category: 'women', price: 210000, oldPrice: 250000, badge: '-16%', material: 'Acero + cristales', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 7, name: 'Smart Watch Air Ligero', brand: 'HANNA Tech', category: 'smart', price: 180000, oldPrice: 220000, badge: '-18%', material: 'Polímero ligero', movement: 'Digital', water: 'IP67', warranty: 1, image: '' },
    { id: 8, name: 'Clásico Vintage Retro', brand: 'HANNA', category: 'men', price: 175000, oldPrice: null, badge: 'Nuevo', material: 'Cuero + acero', movement: 'Mecánico manual', water: '30m', warranty: 2, image: '' },
    { id: 9, name: 'Dama Dorado Rosa', brand: 'HANNA', category: 'women', price: 265000, oldPrice: null, badge: '', material: 'Acero rosa', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 10, name: 'Smart Watch Ultra Titanium', brand: 'HANNA Tech', category: 'smart', price: 520000, oldPrice: 650000, badge: '-20%', material: 'Titanio', movement: 'Digital + GPS', water: '100m', warranty: 2, image: '' },
    { id: 11, name: 'Cronógrafo Plateado Militar', brand: 'HANNA', category: 'men', price: 145000, oldPrice: 170000, badge: '-15%', material: 'Acero cepillado', movement: 'Cuarzo', water: '100m', warranty: 2, image: '' },
    { id: 12, name: 'Dama Minimalista Blanca', brand: 'HANNA', category: 'women', price: 189000, oldPrice: null, badge: 'Nuevo', material: 'Cerámica blanca', movement: 'Cuarzo', water: '30m', warranty: 3, image: '' },
    { id: 13, name: 'Ejecutivo Gold Edición', brand: 'HANNA', category: 'men', price: 380000, oldPrice: 420000, badge: '-10%', material: 'Acero bañado en oro', movement: 'Automático', water: '50m', warranty: 3, image: '' },
    { id: 14, name: 'Smart Watch Sport GPS', brand: 'HANNA Tech', category: 'smart', price: 260000, oldPrice: 310000, badge: '-16%', material: 'Plástico resistente', movement: 'Digital', water: '50m', warranty: 1, image: '' },
    { id: 15, name: 'Aviador Edición Vuelo', brand: 'HANNA', category: 'men', price: 310000, oldPrice: null, badge: '', material: 'Acero + cuero', movement: 'Automático', water: '50m', warranty: 3, image: '' },
    { id: 16, name: 'Dama Esfera Madreperla', brand: 'HANNA', category: 'women', price: 240000, oldPrice: 280000, badge: '-14%', material: 'Acero inoxidable', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 17, name: 'Buceador Profesional 300M', brand: 'HANNA', category: 'men', price: 520000, oldPrice: null, badge: 'Nuevo', material: 'Titanio + caucho', movement: 'Automático', water: '300m', warranty: 5, image: '' },
    { id: 18, name: 'Smart Watch Mujer Rosa', brand: 'HANNA Tech', category: 'smart', price: 195000, oldPrice: 240000, badge: '-19%', material: 'Aleación rosa', movement: 'Digital', water: 'IP65', warranty: 1, image: '' },
    { id: 19, name: 'Clásico Esfera Azul', brand: 'HANNA', category: 'men', price: 165000, oldPrice: null, badge: '', material: 'Acero + cuero azul', movement: 'Cuarzo', water: '50m', warranty: 2, image: '' },
    { id: 20, name: 'Dama Pulsera Malla Milano', brand: 'HANNA', category: 'women', price: 220000, oldPrice: null, badge: 'Nuevo', material: 'Malla milanesa', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 21, name: 'Deportivo G-Shock Estilo', brand: 'HANNA', category: 'men', price: 125000, oldPrice: 150000, badge: '-17%', material: 'Resina', movement: 'Cuarzo digital', water: '200m', warranty: 2, image: '' },
    { id: 22, name: 'Smart Watch Pro Max', brand: 'HANNA Tech', category: 'smart', price: 580000, oldPrice: 700000, badge: '-17%', material: 'Acero inoxidable', movement: 'Digital + LTE', water: '5ATM', warranty: 2, image: '' },
    { id: 23, name: 'Esqueleto Automático', brand: 'HANNA', category: 'men', price: 420000, oldPrice: null, badge: 'Nuevo', material: 'Acero + cristal zafiro', movement: 'Automático calibre vista', water: '50m', warranty: 3, image: '' },
    { id: 24, name: 'Dama Perlas Blancas', brand: 'HANNA', category: 'women', price: 285000, oldPrice: null, badge: '', material: 'Acero + perlas', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 25, name: 'Cronógrafo Diamante Negro', brand: 'HANNA', category: 'men', price: 490000, oldPrice: 550000, badge: '-11%', material: 'Acero negro PVD', movement: 'Cuarzo cronógrafo', water: '100m', warranty: 3, image: '' },
    { id: 26, name: 'Smart Watch Kids', brand: 'HANNA Tech', category: 'smart', price: 120000, oldPrice: null, badge: 'Nuevo', material: 'Silicona color', movement: 'Digital', water: 'IP65', warranty: 1, image: '' },
    { id: 27, name: 'Clásico Tissot Estilo', brand: 'HANNA', category: 'men', price: 350000, oldPrice: 390000, badge: '-10%', material: 'Acero inoxidable', movement: 'Automático', water: '100m', warranty: 3, image: '' },
    { id: 28, name: 'Dama Zafiro Azul', brand: 'HANNA', category: 'women', price: 198000, oldPrice: null, badge: 'Nuevo', material: 'Cerámica azul', movement: 'Cuarzo', water: '50m', warranty: 2, image: '' },
    { id: 29, name: 'Militar Digital Resistente', brand: 'HANNA', category: 'men', price: 98000, oldPrice: 130000, badge: '-25%', material: 'Resina resistente', movement: 'Digital', water: '100m', warranty: 1, image: '' },
    { id: 30, name: 'Smart Watch Ejecutivo', brand: 'HANNA Tech', category: 'smart', price: 340000, oldPrice: 400000, badge: '-15%', material: 'Acero dorado', movement: 'Digital + NFC', water: 'IP68', warranty: 2, image: '' },
    { id: 31, name: 'Dama Corazón Rubí', brand: 'HANNA', category: 'women', price: 320000, oldPrice: null, badge: 'Nuevo', material: 'Acero + rubíes', movement: 'Cuarzo', water: '30m', warranty: 2, image: '' },
    { id: 32, name: 'Edición Limitada Carbono', brand: 'HANNA', category: 'men', price: 680000, oldPrice: 850000, badge: '-20%', material: 'Fibra de carbono', movement: 'Automático', water: '200m', warranty: 5, image: '' },
];

const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : '';

function driveDirectUrl(url) {
    if (!url) return url;
    if (!url.includes('drive.google.com')) return url;
    // Formato 1: /d/FILE_ID
    let m = url.match(/\/d\/([^/?#]+)/);
    if (m) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    // Formato 2: uc?export=view&id=FILE_ID (ya es directo)
    if (url.includes('uc?export=view')) return url;
    // Formato 3: file/d/FILE_ID/view
    m = url.match(/\/file\/d\/([^/?#]+)/);
    if (m) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    return url;
}

let products = [];
let currentCategory = 'all';
let currentFilter = null;
let searchQuery = '';

function formatPrice(n) {
    return '$ ' + n.toLocaleString('es-CO');
}

// --- API calls ---
async function fetchProductsFromAPI() {
    let data = localStorage.getItem(PRODUCTS_KEY);
    // Fix old Google Drive URLs on load
    if (data) {
        let fixed = JSON.parse(data).map(p => {
            if (p.image) p.image = driveDirectUrl(p.image);
            return p;
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(fixed));
        data = localStorage.getItem(PRODUCTS_KEY);
    }
    if (!API_URL) {
        if (data) {
            products = JSON.parse(data);
        } else {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
            products = defaultProducts;
        }
        renderProducts();
        return;
    }
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.success && json.products && json.products.length > 0) {
            const localProducts = data ? JSON.parse(data) : [];
            products = json.products.map(p => {
                const lp = localProducts.find(l => l.id === p.id);
                if (lp && lp.image) p.image = driveDirectUrl(lp.image);
                if (p.image) p.image = driveDirectUrl(p.image);
                return p;
            });
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        } else {
            products = data ? JSON.parse(data) : [];
        }
    } catch (err) {
        products = data ? JSON.parse(data) : defaultProducts;
    }
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const resultsInfo = document.getElementById('results-info');

    let filtered = [...products];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            (p.material && p.material.toLowerCase().includes(q))
        );
    }

    if (currentCategory === 'featured') {
        filtered = filtered.filter(p => p.featured);
    } else if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (currentFilter) {
        switch (currentFilter.type) {
            case 'category':
                filtered = filtered.filter(p => p.category === currentFilter.value);
                break;
            case 'brand':
                filtered = filtered.filter(p => p.brand.toLowerCase().includes(currentFilter.value.toLowerCase()));
                break;
            case 'keyword':
                const kw = currentFilter.value.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(kw) ||
                    p.brand.toLowerCase().includes(kw) ||
                    (p.material && p.material.toLowerCase().includes(kw))
                );
                break;
            case 'badge':
                filtered = filtered.filter(p => p.badge && p.badge.toLowerCase() === currentFilter.value.toLowerCase());
                break;
            case 'discounted':
                filtered = filtered.filter(p => p.oldPrice && p.oldPrice > 0);
                break;
        }
    }

    const count = filtered.length;
    const filterLabel = currentFilter ? {
        'category': 'Categoría: ' + currentFilter.value,
        'brand': 'Marca: ' + currentFilter.value,
        'keyword': currentFilter.value,
        'badge': currentFilter.value,
        'discounted': 'Rebajas'
    }[currentFilter.type] : null;
    const filterHtml = currentFilter
        ? `${count} resultado${count !== 1 ? 's' : ''} en <strong>${filterLabel}</strong> &middot; <a href="#" onclick="clearFilter();return false;" style="color:#b59410;font-size:12px;">Limpiar filtro</a>`
        : `${count} producto${count !== 1 ? 's' : ''}`;
    const showing = (searchQuery ? `<span>${count} resultado${count !== 1 ? 's' : ''} para "<strong>${searchQuery}</strong>"</span>` : filterHtml);
    if (resultsInfo) resultsInfo.innerHTML = showing;

    if (count === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#999;">
            <i class="fa-regular fa-clock" style="font-size:48px;display:block;margin-bottom:16px;color:#ddd;"></i>
            <p style="font-size:16px;">No encontramos productos que coincidan con tu búsqueda.</p>
            <button onclick="clearSearch()" style="margin-top:12px;padding:8px 20px;background:#111;color:#fff;border:none;border-radius:6px;cursor:pointer;">Ver todos</button>
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const badgeClass = p.badge === 'Nuevo' ? 'new' : '';
        const badgeHtml = p.badge ? `<div class="product-badge ${badgeClass}">${p.badge}</div>` : '';
        const oldHtml = p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : '';
        const discountHtml = p.oldPrice
            ? `<span class="discount">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`
            : '';
        const imgSrc = driveDirectUrl(p.image);
        const hasImg = imgSrc && imgSrc.length > 5;
        const imgHtml = hasImg
            ? `<img src="${imgSrc}" alt="${p.name}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentNode.innerHTML='<i class=\\'fa-regular fa-clock fa-4x\\'></i>'">`
            : `<i class="fa-regular fa-clock fa-4x"></i>`;
        return `
            <div class="product-card" onclick="openDetail(${p.id})">
                ${badgeHtml}
                <div class="product-image">${imgHtml}</div>
                <div class="product-brand">${p.brand}</div>
                <h3>${p.name}</h3>
                <div class="product-price">
                    ${oldHtml}
                    <span class="current">${formatPrice(p.price)}</span>
                    ${discountHtml}
                </div>
                <button class="btn-add" onclick="event.stopPropagation();addToCart(${p.id})">Añadir al carrito</button>
            </div>
        `;
    }).join('');
}

// ========== NAV FILTERS ==========
function getCategoryForNav(name) {
    const map = { 'hombre': 'men', 'mujer': 'women', 'inteligentes': 'smart', 'smart': 'smart' };
    return map[name.toLowerCase()] || null;
}

function filterNavCategory(cat) {
    currentFilter = { type: 'category', value: cat };
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
    scrollToProducts();
}

function filterNavBrand(brand) {
    currentFilter = { type: 'brand', value: brand };
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
    scrollToProducts();
}

function filterNavKeyword(keyword) {
    currentFilter = { type: 'keyword', value: keyword };
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
    scrollToProducts();
}

function filterNavBadge(badge) {
    currentFilter = { type: 'badge', value: badge };
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
    scrollToProducts();
}

function filterNavDiscounted() {
    currentFilter = { type: 'discounted', value: true };
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
    scrollToProducts();
}

function clearFilter() {
    currentFilter = null;
    currentCategory = 'all';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.tab-btn[data-tab="all"]');
    if (btn) btn.classList.add('active');
    renderProducts();
    scrollToProducts();
}

function scrollToProducts() {
    const el = document.getElementById('productsGrid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterByCategory(category) {
    currentCategory = category;
    currentFilter = null;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${category}"]`);
    if (btn) btn.classList.add('active');
    renderProducts();
}

function switchTab(category) {
    filterByCategory(category);
}

function switchTab(category) {
    filterByCategory(category);
}

function handleSearch(e) {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    searchQuery = input.value.trim();
    renderProducts();
}

function clearSearch() {
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    currentFilter = null;
    currentCategory = 'all';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector('.tab-btn[data-tab="all"]');
    if (btn) btn.classList.add('active');
    renderProducts();
}

// --- Product Detail Modal ---
function openDetail(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('detail-overlay').classList.add('active');
    const container = document.getElementById('detail-container');
    const catLabel = { men: 'Hombre', women: 'Mujer', smart: 'Smart' }[p.category] || p.category;
    const imgSrc = driveDirectUrl(p.image);
    const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${p.name}" style="max-width:80%;max-height:80%;object-fit:contain;" onerror="this.style.display='none';this.parentNode.innerHTML='<i class=\\'fa-regular fa-clock fa-5x\\' style=\\'color:#ddd;\\'></i>'">`
        : `<i class="fa-regular fa-clock fa-5x" style="color:#ddd;"></i>`;
    container.innerHTML = `
        <div class="detail-image">
            ${imgHtml}
            ${p.badge ? `<div class="detail-badge ${p.badge === 'Nuevo' ? 'new' : ''}">${p.badge}</div>` : ''}
        </div>
        <div class="detail-info">
            <div class="detail-brand">${p.brand}</div>
            <h2 class="detail-title">${p.name}</h2>
            <div class="detail-price">
                ${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ''}
                <span class="current">${formatPrice(p.price)}</span>
                ${p.oldPrice ? `<span class="discount">-${Math.round((1 - p.price / p.oldPrice) * 100)}% OFF</span>` : ''}
            </div>
            <div class="detail-cta">
                <button class="btn-add" onclick="addToCart(${p.id})" style="flex:1;">Añadir al carrito</button>
                <button class="btn-buy" onclick="buyNow(${p.id})">Comprar ahora</button>
            </div>
            <div class="detail-specs">
                <h4>Especificaciones</h4>
                <div class="specs-grid">
                    <div class="spec"><span class="spec-label">Categoría</span><span class="spec-value">${catLabel}</span></div>
                    <div class="spec"><span class="spec-label">Material</span><span class="spec-value">${p.material}</span></div>
                    <div class="spec"><span class="spec-label">Movimiento</span><span class="spec-value">${p.movement}</span></div>
                    <div class="spec"><span class="spec-label">Resistencia agua</span><span class="spec-value">${p.water}</span></div>
                    <div class="spec"><span class="spec-label">Garantía</span><span class="spec-value">${p.warranty} años</span></div>
                    <div class="spec"><span class="spec-label">Marca</span><span class="spec-value">${p.brand}</span></div>
                </div>
            </div>
            <div class="detail-features">
                <h4>Características</h4>
                <ul>
                    <li>Pago 100% seguro con PayU</li>
                    <li>Envío gratis en pedidos > $150.000</li>
                    <li>30 días de garantía de devolución</li>
                    <li>Producto original con garantía de fábrica</li>
                </ul>
            </div>
        </div>
    `;
}

function closeDetail() {
    document.getElementById('detail-overlay').classList.remove('active');
}

// --- Cart ---
let cart = [];
let total = 0;

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('active');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    total += product.price;
    updateCartUI();
    toggleCart();
}

function updateQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }
    total += delta * item.price;
    item.qty = newQty;
    updateCartUI();
}

function removeFromCart(index) {
    total -= cart[index].price * cart[index].qty;
    cart.splice(index, 1);
    updateCartUI();
}

function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    cart = [{ ...product, qty: 1 }];
    total = product.price;
    updateCartUI();
    toggleCart();
}

function checkout() {
    if (cart.length === 0) return;
    document.getElementById('checkout-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('checkout-total').textContent = formatPrice(total);
    document.getElementById('checkout-overlay').classList.add('active');
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}

function closeCheckout() {
    document.getElementById('checkout-overlay').classList.remove('active');
}

function generateInvoicePDF(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(181, 148, 16);
    doc.text('ACCESORIOS HANNA', pageW / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Elegancia que Inspira', pageW / 2, y, { align: 'center' });
    y += 8;
    doc.setDrawColor(200);
    doc.line(15, y, pageW - 15, y);
    y += 8;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Factura de Pedido #' + order.id, 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.text('Fecha: ' + new Date().toLocaleDateString('es-CO'), 15, y);
    y += 6;
    doc.text('Cliente: ' + order.name, 15, y);
    y += 5;
    doc.text('Email: ' + order.email, 15, y);
    y += 5;
    doc.text('Telefono: ' + order.phone, 15, y);
    y += 5;
    doc.text('Direccion: ' + order.address + (order.city ? ', ' + order.city : ''), 15, y);
    y += 10;
    doc.setDrawColor(200);
    doc.line(15, y, pageW - 15, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Producto', 15, y);
    doc.text('Cant.', 130, y, { align: 'right' });
    doc.text('Precio', 155, y, { align: 'right' });
    doc.text('Total', 195, y, { align: 'right' });
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.setDrawColor(220);
    doc.line(15, y, pageW - 15, y);
    y += 4;

    order.items.forEach((item, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(9);
        doc.text((i + 1) + '. ' + item.name + ' (' + item.brand + ')', 15, y);
        doc.text(String(item.qty), 130, y, { align: 'right' });
        doc.text(formatPrice(item.price), 155, y, { align: 'right' });
        doc.text(formatPrice(item.price * item.qty), 195, y, { align: 'right' });
        y += 6;
    });

    y += 4;
    doc.setDrawColor(200);
    doc.line(15, y, pageW - 15, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('TOTAL: ' + formatPrice(order.total), 195, y, { align: 'right' });
    y += 12;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Metodo de pago: Pago contra entrega (Efectivo / Transferencia / PayU)', 15, y);
    y += 5;
    doc.text('Envio: Gratis en pedidos mayores a $150.000', 15, y);
    y += 5;
    doc.text('Garantia: 30 dias de devolucion. Producto original con garantia de fabrica.', 15, y);

    return doc.output('datauristring');
}

async function submitOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('checkout-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

    const order = {
        id: Date.now(),
        name: document.getElementById('checkout-name').value.trim(),
        email: document.getElementById('checkout-email').value.trim(),
        phone: document.getElementById('checkout-phone').value.trim(),
        address: document.getElementById('checkout-address').value.trim(),
        city: document.getElementById('checkout-city').value.trim(),
        notes: document.getElementById('checkout-notes').value.trim(),
        items: cart.map(i => ({ id: i.id, name: i.name, brand: i.brand, sku: i.sku, price: i.price, qty: i.qty })),
        total: total
    };

    let emailSent = false;

    try {
        const pdfDataUrl = generateInvoicePDF(order);

        if (API_URL) {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'sendOrder',
                    order: order,
                    pdfBase64: pdfDataUrl.split(',')[1]
                })
            });
            const json = await res.json();
            emailSent = json.success;
        }
    } catch (err) {
        console.warn('API no disponible, el pedido se procesa localmente:', err);
    }

    const phone = order.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent('Hola ' + order.name + '! Tu pedido en ACCESORIOS HANNA por ' + formatPrice(total) + ' ha sido recibido. Pronto te contactaremos para coordinar la entrega. Gracias por tu compra!');
    window.open('https://wa.me/57' + phone + '?text=' + msg, '_blank');

    alert('Pedido #' + order.id + ' realizado con exito!\n\n' +
        'Recibiras la factura en PDF a:\n' +
        '- Tu correo: ' + order.email + '\n' +
        '- Correo de la empresa\n\n' +
        'Te contactaremos por WhatsApp para coordinar la entrega.');

    cart = [];
    total = 0;
    updateCartUI();
    closeCheckout();
    document.querySelector('#checkout-overlay form').reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-regular fa-file-lines"></i> Confirmar Pedido';
}

function updateCartUI() {
    document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cart-count-sidebar').textContent = cart.reduce((s, i) => s + i.qty, 0);

    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Tu carrito está vacío.</p>';
    } else {
        container.innerHTML = cart.map((item, i) => `
            <div class="cart-item">
                <div><div class="cart-item-name">${item.name}</div>
                <div style="font-size:12px;color:#999">${item.brand}</div></div>
                <div class="cart-item-right">
                    <div class="cart-qty">
                        <button onclick="updateQty(${i}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.qty}</span>
                        <button onclick="updateQty(${i}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
                    <span class="cart-item-remove" onclick="removeFromCart(${i})"><i class="fa-regular fa-trash-can"></i></span>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('cart-total').textContent = formatPrice(total);
}

// --- Carousel (desde banners) ---
const BANNERS_KEY = 'hanna_banners';
let currentSlide = 0;
let slides = [];
let carouselInterval = null;
const dotsContainer = document.getElementById('carouselDots');

const defaultBanners = [
    { image: '', title: 'Nueva Colección 2026', subtitle: 'Elegancia que Trasciende', cta: 'Comprar Ahora', link: '#', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { image: '', title: 'Hasta 40% OFF', subtitle: 'Lujo a tu Alcance', cta: 'Ver Ofertas', link: '#', bg: 'linear-gradient(135deg, #2d1b00, #1a0f00)' },
    { image: '', title: 'Smart Watches', subtitle: 'Tecnología en tu Muñeca', cta: 'Explorar', link: '#', bg: 'linear-gradient(135deg, #0a1628, #1a2a4a)' }
];

function loadBanners() {
    const data = localStorage.getItem(BANNERS_KEY);
    return data ? JSON.parse(data) : defaultBanners;
}

function renderCarousel() {
    const banners = loadBanners();
    const container = document.getElementById('carouselSlides');
    currentSlide = 0;
    dotsContainer.innerHTML = '';

    if (banners.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = banners.map((b, i) => {
        const bg = b.bg || 'linear-gradient(135deg, #1a1a2e, #16213e)';
        const imgHtml = b.image
            ? `<img src="${driveDirectUrl(b.image)}" style="max-width:60%;max-height:70%;object-fit:contain;" onerror="this.style.display='none';this.parentNode.innerHTML='<i class=\\'fa-regular fa-clock\\' style=\\'font-size:180px;color:rgba(255,255,255,0.15);\\'></i>'">`
            : `<i class="fa-regular fa-clock" style="font-size:180px;color:rgba(255,255,255,0.15);"></i>`;
        return `
            <div class="carousel-slide ${i === 0 ? 'active' : ''}" style="background: ${bg};">
                <div class="slide-content">
                    ${b.title ? `<span class="slide-tag">${b.title}</span>` : ''}
                    <h2>${b.subtitle || ''}</h2>
                    ${b.cta ? `<a href="${b.link || '#'}" class="slide-cta">${b.cta}</a>` : ''}
                </div>
                <div class="slide-image">${imgHtml}</div>
            </div>
        `;
    }).join('');

    slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    updateDots();
    if (carouselInterval) clearInterval(carouselInterval);
    if (slides.length > 1) carouselInterval = setInterval(nextSlide, 5000);
}

function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    updateDots();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function updateDots() {
    document.querySelectorAll('.carousel-dots span').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

// --- Countdown Timer ---
function startCountdown() {
    const s = getSettings();
    let end;
    if (s.offer_end) {
        end = new Date(s.offer_end);
    } else {
        end = new Date();
        end.setHours(23, 59, 59, 0);
    }
    const banner = document.getElementById('couponBanner');
    function tick() {
        const diff = end - new Date();
        if (diff <= 0) {
            if (banner) banner.style.display = 'none';
            return;
        }
        if (banner) banner.style.display = '';
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('countdown-timer').textContent =
            (d > 0 ? d + 'd ' : '') + `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    tick();
    setInterval(tick, 1000);
}
startCountdown();

// --- Newsletter ---
function handleNewsletter(e) {
    e.preventDefault();
    alert('¡Gracias por suscribirte! Recibirás tu código de 10% OFF en tu correo.');
    e.target.reset();
}

// ========== CONFIGURACIÓN DEL SITIO ==========
const SETTINGS_KEY = 'hanna_settings';

const defaultSettings = {
    warranty: '2 años de garantía internacional en todos nuestros relojes. Cubre defectos de fábrica.',
    payments: 'Aceptamos tarjetas de crédito, débito, transferencia bancaria, Mercado Pago y PayU.',
    about: 'ACCESORIOS HANNA es una tienda de accesorios y relojería con sede en Colombia. Nos apasiona ofrecer diseños exclusivos que combinan elegancia clásica con tendencias modernas. Nuestra visión es ser la marca líder en accesorios de moda en Colombia, reconocida por nuestra calidad, diseños exclusivos y compromiso con realzar la belleza y el estilo de cada persona.',
    programs: 'Club Elite|#\nPrograma de Amigos|#\nEstudiantes|#',
    collaborators: 'Influencers|#\nAfiliados|#',
    social: 'facebook|#\ninstagram|#\nyoutube|#\ntiktok|#\npinterest|#',
    offer_end: ''
};

function getSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { ...defaultSettings };
}

function applySettings() {
    const s = getSettings();

    const socialMap = {};
    s.social.split('\n').forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 2) socialMap[parts[0].trim().toLowerCase()] = parts[1].trim();
    });
    const iconMap = { facebook: 'fa-facebook', instagram: 'fa-instagram', youtube: 'fa-youtube', tiktok: 'fa-tiktok', pinterest: 'fa-pinterest' };
    const socialContainer = document.getElementById('footer-social');
    if (socialContainer) {
        const existingLinks = socialContainer.querySelectorAll('a:not(.keep)');
        existingLinks.forEach(el => el.remove());
        Object.keys(iconMap).forEach(platform => {
            const url = socialMap[platform] || '#';
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerHTML = `<i class="fa-brands ${iconMap[platform]}"></i>`;
            socialContainer.appendChild(a);
        });
    }

    const programsContainer = document.getElementById('footer-programs');
    if (programsContainer) {
        programsContainer.innerHTML = s.programs.split('\n').filter(l => l.trim()).map(line => {
            const parts = line.split('|');
            return `<a href="${parts[1] || '#'}">${parts[0] || line}</a>`;
        }).join('');
    }

    const collabContainer = document.getElementById('footer-collaborators');
    if (collabContainer) {
        collabContainer.innerHTML = s.collaborators.split('\n').filter(l => l.trim()).map(line => {
            const parts = line.split('|');
            return `<a href="${parts[1] || '#'}">${parts[0] || line}</a>`;
        }).join('');
    }

    const aboutContainer = document.getElementById('footer-about');
    if (aboutContainer) {
        aboutContainer.innerHTML = `<a href="#">${s.about ? s.about.substring(0, 120) + '...' : 'Quiénes Somos'}</a>`;
    }
}

// ========== MENÚ DE NAVEGACIÓN ==========
const NAV_KEY = 'hanna_nav';

const defaultNav = [
    { name: 'Nuevo', columns: [] },
    {
        name: 'Hombre', columns: [
            { title: 'Por Estilo', links: ['Clásicos', 'Deportivos', 'Casuales', 'Elegantes', 'Inteligentes'] },
            { title: 'Por Marca', links: ['Rolex', 'Omega', 'Seiko', 'Casio', 'Citizen'] },
            { title: 'Colecciones', links: ['Submariner', 'Speedmaster', 'Prospex', 'G-Shock'] }
        ]
    },
    {
        name: 'Mujer', columns: [
            { title: 'Por Estilo', links: ['Clásicos', 'Elegantes', 'Deportivos', 'Casuales'] },
            { title: 'Por Marca', links: ['Cartier', 'Chanel', 'Fossil', 'Michael Kors'] }
        ]
    },
    { name: 'Inteligentes', columns: [] },
    { name: 'Lujo', columns: [] },
    { name: 'Marcas', columns: [] },
    { name: 'Rebajas', columns: [] }
];

function getNav() {
    const data = localStorage.getItem(NAV_KEY);
    return data ? JSON.parse(data) : JSON.parse(JSON.stringify(defaultNav));
}

function renderNav() {
    const nav = getNav();
    const container = document.querySelector('.main-nav .nav-list');
    if (!container) return;

    function deptHref(name) {
        const lower = name.toLowerCase();
        const cat = getCategoryForNav(name);
        if (cat) return '?cat=' + cat;
        if (lower === 'nuevo') return '?badge=Nuevo';
        if (lower === 'rebajas') return '?discount=1';
        return '?q=' + encodeURIComponent(name);
    }

    function colHref(colTitle, link) {
        const t = colTitle.toLowerCase();
        const l = encodeURIComponent(link);
        if (t.includes('marca')) return '?brand=' + l;
        return '?q=' + l;
    }

    container.innerHTML = nav.map(dept => {
        if (!dept.columns || dept.columns.length === 0) {
            const isSale = dept.name.toLowerCase() === 'rebajas';
            return '<li' + (isSale ? ' style="margin-left:auto;"' : '') + '><a href="' + deptHref(dept.name) + '" target="_blank"' +
                (isSale ? ' class="sale-link"' : '') + '>' + dept.name +
                (isSale ? ' <i class="fa-solid fa-tag"></i>' : '') + '</a></li>';
        }
        return '<li class="has-dropdown"><a href="' + deptHref(dept.name) + '" target="_blank">' + dept.name + ' <i class="fa-solid fa-chevron-down"></i></a>' +
            '<div class="dropdown">' +
            dept.columns.map(col =>
                '<div class="dropdown-col">' +
                '<h4>' + col.title + '</h4>' +
                (col.links || []).map(link => '<a href="' + colHref(col.title, link) + '" target="_blank">' + link + '</a>').join('') +
                '</div>'
            ).join('') +
            '</div></li>';
    }).join('');
}

// --- Init ---
(function init() {
    // Load products from localStorage immediately
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) products = JSON.parse(stored);

    // Parse URL parameters for filtering
    const params = new URLSearchParams(window.location.search);
    if (params.has('cat')) filterNavCategory(params.get('cat'));
    else if (params.has('brand')) filterNavBrand(params.get('brand'));
    else if (params.has('q')) filterNavKeyword(params.get('q'));
    else if (params.has('badge')) filterNavBadge(params.get('badge'));
    else if (params.has('discount')) filterNavDiscounted();

    renderCarousel();
    applySettings();
    renderNav();
    fetchProductsFromAPI();
    if (API_URL) {
        setInterval(fetchProductsFromAPI, 30000);
    }
})();
window.addEventListener('storage', function (e) {
    if (e.key === BANNERS_KEY) renderCarousel();
    if (e.key === SETTINGS_KEY) { applySettings(); startCountdown(); }
    if (e.key === NAV_KEY) renderNav();
});
