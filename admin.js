const PRODUCTS_KEY = 'hanna_products';
const SESSION_KEY = 'hanna_session';
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

(function checkAuth() {
    if (localStorage.getItem(SESSION_KEY) !== 'true') {
        window.location.href = 'login.html';
    }
})();

// --- Product storage (local fallback + API sync) ---
function getLocalProducts() {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveLocalProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// --- API calls ---
async function apiRequest(action, data) {
    if (!API_URL) {
        return { local: true };
    }
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action, ...data })
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: 'Error de conexión: ' + err.message };
    }
}

async function fetchAllFromAPI() {
    const local = getLocalProducts();
    if (!API_URL) return local;
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.success && json.products && json.products.length > 0) {
            const merged = json.products.map(p => {
                const lp = local.find(l => l.id === p.id);
                if (lp && lp.image) p.image = driveDirectUrl(lp.image);
                if (p.image) p.image = driveDirectUrl(p.image);
                return p;
            });
            saveLocalProducts(merged);
            return merged;
        }
    } catch (e) {}
    return local;
}

// --- Render ---
function renderTable() {
    const products = getLocalProducts();
    const tbody = document.getElementById('products-tbody');
    const empty = document.getElementById('empty-state');

    document.getElementById('stat-total').textContent = products.length;
    document.getElementById('stat-men').textContent = products.filter(p => p.category === 'men').length;
    document.getElementById('stat-women').textContent = products.filter(p => p.category === 'women').length;
    document.getElementById('stat-smart').textContent = products.filter(p => p.category === 'smart').length;

    if (products.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = products.map(p => {
        const catLabel = { men: 'Hombre', women: 'Mujer', smart: 'Smart' }[p.category] || p.category;
        const oldHtml = p.oldPrice ? `<span class="old-price-cell">$${p.oldPrice.toLocaleString('es-CO')}</span>` : '-';
        const badgeHtml = p.badge || '-';
        const skuHtml = p.sku ? `<code style="font-size:11px;background:#f5f5f5;padding:2px 6px;border-radius:3px;">${p.sku}</code>` : '-';
        return `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.brand}</td>
                <td>${skuHtml}</td>
                <td><span class="category-tag">${catLabel}</span></td>
                <td class="price-cell">$${p.price.toLocaleString('es-CO')}</td>
                <td>${oldHtml}</td>
                <td>${badgeHtml}</td>
                <td>${p.featured ? '<span style="color:#b59410;"><i class="fa-solid fa-star"></i></span>' : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editProduct(${p.id})"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
                        <button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="fa-regular fa-trash-can"></i> Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Modal ---
let editingId = null;

function openModal(product) {
    document.getElementById('modal-title').textContent = product ? 'Editar Producto' : 'Nuevo Producto';
    document.getElementById('modal-submit').textContent = product ? 'Guardar Cambios' : 'Guardar Producto';
    document.getElementById('product-id').value = product ? product.id : '';
    document.getElementById('product-name').value = product ? (product.name || '') : '';
    document.getElementById('product-brand').value = product ? (product.brand || '') : '';
    document.getElementById('product-sku').value = product ? (product.sku || '') : '';
    document.getElementById('product-price').value = product ? product.price : '';
    document.getElementById('product-oldprice').value = product ? (product.oldPrice || '') : '';
    document.getElementById('product-category').value = product ? (product.category || 'men') : 'men';
    document.getElementById('product-badge').value = product ? (product.badge || '') : '';
    document.getElementById('product-image').value = product ? (product.image || '') : '';
    document.getElementById('product-image-data').value = product ? (product.image || '') : '';
    document.getElementById('product-material').value = product ? (product.material || '') : '';
    document.getElementById('product-movement').value = product ? (product.movement || '') : '';
    document.getElementById('product-water').value = product ? (product.water || '') : '';
    document.getElementById('product-warranty').value = product ? (product.warranty || '2') : '2';
    document.getElementById('product-featured').checked = product ? !!product.featured : false;
    document.getElementById('product-sku').dispatchEvent(new Event('input'));
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    editingId = null;
}

// --- Image upload: redimensiona, comprime y sube a Drive ---
function resizeImageFile(file, maxW, quality, callback) {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > maxW || h > maxW) {
                if (w > h) { h = Math.round(h * maxW / w); w = maxW; }
                else { w = Math.round(w * maxW / h); h = maxW; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = () => callback('');
        img.src = reader.result;
    };
    reader.onerror = () => callback('');
    reader.readAsDataURL(file);
}

async function uploadImageToDrive(dataUrl, fileName) {
    if (!API_URL) return dataUrl; // fallback: usa data URL si no hay API
    try {
        const base64 = dataUrl.split(',')[1];
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'uploadImage', imageData: base64, fileName })
        });
        const json = await res.json();
        if (json.success && json.imageUrl) return json.imageUrl;
    } catch (e) {
        console.warn('Error subiendo a Drive, usando data URL:', e);
    }
    return dataUrl; // fallback
}

function autoImageFromSku() {
    const sku = document.getElementById('product-sku').value.trim();
    document.getElementById('sku-filename').textContent = sku || 'sku';
    if (sku) {
        document.getElementById('product-image').value = 'images/' + sku + '.jpg';
        document.getElementById('product-image-data').value = 'images/' + sku + '.jpg';
        document.getElementById('image-preview').src = 'images/' + sku + '.jpg';
        document.getElementById('image-preview').style.display = 'block';
    }
}

async function handleImageSelect(input) {
    const file = input.files[0];
    if (!file) return;
    const preview = document.getElementById('image-preview');
    preview.style.display = 'block';
    const dataUrl = await new Promise(resolve => resizeImageFile(file, 300, 0.8, resolve));
    if (dataUrl) {
        preview.src = dataUrl;
        document.getElementById('product-image-data').value = dataUrl;
        document.getElementById('product-image').value = '';
    }
}

// --- CRUD ---
async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const imageDataUrl = document.getElementById('product-image-data').value.trim();
    const sku = document.getElementById('product-sku').value.trim();

    // Subir imagen a Drive si es data URL
    let imageUrl = imageDataUrl;
    if (imageDataUrl.startsWith('data:')) {
        const fileName = (sku || 'producto') + '.webp';
        imageUrl = await uploadImageToDrive(imageDataUrl, fileName);
    }

    const data = {
        name: document.getElementById('product-name').value.trim(),
        brand: document.getElementById('product-brand').value.trim(),
        price: parseInt(document.getElementById('product-price').value),
        oldPrice: document.getElementById('product-oldprice').value
            ? parseInt(document.getElementById('product-oldprice').value)
            : null,
        category: document.getElementById('product-category').value,
        badge: document.getElementById('product-badge').value,
        sku: sku,
        image: imageUrl,
        material: document.getElementById('product-material').value.trim() || 'Estándar',
        movement: document.getElementById('product-movement').value.trim() || 'Estándar',
        water: document.getElementById('product-water').value.trim() || '30m',
        warranty: parseInt(document.getElementById('product-warranty').value) || 2,
        featured: document.getElementById('product-featured').checked,
    };

    // Guardar en localStorage (con imagen completa)
    if (id) {
        data.id = parseInt(id);
        let products = getLocalProducts();
        const idx = products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...data };
            saveLocalProducts(products);
        }
    } else {
        let products = getLocalProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        data.id = newId;
        products.push(data);
        saveLocalProducts(products);
    }

    console.log('DEBUG IMAGEN:', {
        imageLength: (data.image || '').length,
        imageStart: (data.image || '').substring(0, 80),
        isDataUrl: (data.image || '').startsWith('data:'),
        productName: data.name,
        productId: data.id
    });

    await apiRequest(id ? 'update' : 'create', data);

    closeModal();
    renderTable();
}

function editProduct(id) {
    const products = getLocalProducts();
    const product = products.find(p => p.id === id);
    if (product) openModal(product);
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto definitivamente?')) return;
    let products = getLocalProducts();
    products = products.filter(p => p.id !== id);
    saveLocalProducts(products);
    await apiRequest('delete', { id });
    renderTable();
}

// --- Tab switching ---
function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
    if (tab === 'banners') renderBanners();
    if (tab === 'menu') renderMenuForm();
    if (tab === 'settings') renderSettingsForm();
}

// ========== BANNERS ==========
const BANNERS_KEY = 'hanna_banners';

const defaultBanners = [
    { id: 1, image: '', title: 'Nueva Colección 2026', subtitle: 'Elegancia que Trasciende', cta: 'Comprar Ahora', link: '#', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { id: 2, image: '', title: 'Hasta 40% OFF', subtitle: 'Lujo a tu Alcance', cta: 'Ver Ofertas', link: '#', bg: 'linear-gradient(135deg, #2d1b00, #1a0f00)' },
    { id: 3, image: '', title: 'Smart Watches', subtitle: 'Tecnología en tu Muñeca', cta: 'Explorar', link: '#', bg: 'linear-gradient(135deg, #0a1628, #1a2a4a)' }
];

function getBanners() {
    const data = localStorage.getItem(BANNERS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveBanners(list) {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(list));
}

function renderBanners() {
    const list = getBanners();
    const grid = document.getElementById('banner-grid');
    const empty = document.getElementById('banner-empty');
    if (list.length === 0) {
        if (grid) grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = list.map(b => `
        <div class="banner-card">
            ${b.image ? `<img class="banner-card-img" src="${driveDirectUrl(b.image)}">` : `<div class="banner-card-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:13px;">Sin imagen</div>`}
            <div class="banner-card-body">
                <h4>${b.title || 'Sin título'}</h4>
                <p>${b.subtitle || ''} ${b.cta ? '&middot; ' + b.cta : ''}</p>
                <div class="banner-card-actions">
                    <button class="btn-edit" onclick="editBanner(${b.id})"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
                    <button class="btn-delete" onclick="deleteBanner(${b.id})"><i class="fa-regular fa-trash-can"></i> Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openBannerModal(banner) {
    document.getElementById('banner-id').value = banner ? banner.id : '';
    document.getElementById('banner-modal-title').textContent = banner ? 'Editar Banner' : 'Nuevo Banner';
    document.getElementById('banner-modal-submit').textContent = banner ? 'Guardar Cambios' : 'Guardar Banner';
    document.getElementById('banner-image').value = (banner && banner.image && !banner.image.startsWith('data:')) ? banner.image : '';
    document.getElementById('banner-image-data').value = (banner && banner.image && banner.image.startsWith('data:')) ? banner.image : '';
    document.getElementById('banner-title').value = banner ? (banner.title || '') : '';
    document.getElementById('banner-subtitle').value = banner ? (banner.subtitle || '') : '';
    document.getElementById('banner-cta').value = banner ? (banner.cta || '') : '';
    document.getElementById('banner-link').value = banner ? (banner.link || '') : '';
    document.getElementById('banner-bg').value = banner ? (banner.bg || '') : '';
    const fileInput = document.getElementById('banner-image-upload');
    if (fileInput) fileInput.value = '';
    updateBannerPreview();
    document.getElementById('bannerModalOverlay').classList.add('active');
}

async function handleBannerImageSelect(input) {
    const file = input.files[0];
    if (!file) return;
    const dataUrl = await new Promise(resolve => resizeImageFile(file, 800, 0.85, resolve));
    if (dataUrl) {
        document.getElementById('banner-image-data').value = dataUrl;
        document.getElementById('banner-image').value = '';
        const preview = document.getElementById('banner-preview');
        preview.src = dataUrl;
        preview.style.display = 'block';
    }
}

function closeBannerModal() {
    document.getElementById('bannerModalOverlay').classList.remove('active');
}

function updateBannerPreview() {
    const src = document.getElementById('banner-image').value.trim();
    const hidden = document.getElementById('banner-image-data').value;
    const preview = document.getElementById('banner-preview');
    const finalSrc = hidden || src;
    if (finalSrc) {
        preview.src = driveDirectUrl(finalSrc);
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

async function saveBanner(e) {
    e.preventDefault();
    const id = document.getElementById('banner-id').value;
    const imgFromText = document.getElementById('banner-image').value.trim();
    const imgFromData = document.getElementById('banner-image-data').value;

    // Subir imagen a Drive si es data URL
    let imageUrl = imgFromData || imgFromText;
    if (imgFromData.startsWith('data:')) {
        imageUrl = await uploadImageToDrive(imgFromData, 'banner-' + Date.now() + '.webp');
    }

    const data = {
        image: imageUrl,
        title: document.getElementById('banner-title').value.trim(),
        subtitle: document.getElementById('banner-subtitle').value.trim(),
        cta: document.getElementById('banner-cta').value.trim(),
        link: document.getElementById('banner-link').value.trim(),
        bg: document.getElementById('banner-bg').value.trim()
    };

    let list = getBanners();
    if (id) {
        data.id = parseInt(id);
        const idx = list.findIndex(b => b.id === parseInt(id));
        if (idx !== -1) list[idx] = { ...list[idx], ...data };
    } else {
        data.id = list.length > 0 ? Math.max(...list.map(b => b.id)) + 1 : 1;
        list.push(data);
    }
    saveBanners(list);
    closeBannerModal();
    renderBanners();
}

function editBanner(id) {
    const list = getBanners();
    const banner = list.find(b => b.id === id);
    if (banner) openBannerModal(banner);
}

function deleteBanner(id) {
    if (!confirm('¿Eliminar este banner?')) return;
    let list = getBanners();
    list = list.filter(b => b.id !== id);
    saveBanners(list);
    renderBanners();
}

// ========== CONFIGURACIÓN ==========
const SETTINGS_KEY = 'hanna_settings';

const defaultSettings = {
    warranty: '2 años de garantía internacional en todos nuestros relojes. Cubre defectos de fábrica.',
    payments: 'Aceptamos tarjetas de crédito, débito, transferencia bancaria, Mercado Pago y PayU.',
    about: 'ACCESORIOS HANNA es una tienda de accesorios y relojería con sede en Colombia. Nos apasiona ofrecer diseños exclusivos que combinan elegancia clásica con tendencias modernas.',
    programs: 'Club Elite|#\nPrograma de Amigos|#\nEstudiantes|#',
    collaborators: 'Influencers|#\nAfiliados|#',
    social: 'facebook|#\ninstagram|#\nyoutube|#\ntiktok|#\npinterest|#',
    offer_end: ''
};

function getSettings() {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { ...defaultSettings };
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function renderSettingsForm() {
    const s = getSettings();
    document.getElementById('set-warranty').value = s.warranty || '';
    document.getElementById('set-payments').value = s.payments || '';
    document.getElementById('set-about').value = s.about || '';
    document.getElementById('set-programs').value = s.programs || '';
    document.getElementById('set-collaborators').value = s.collaborators || '';
    document.getElementById('set-social').value = s.social || '';
    const el = document.getElementById('set-offer-end');
    if (el && s.offer_end) el.value = s.offer_end;
}

function saveSettingsForm() {
    const settings = {
        warranty: document.getElementById('set-warranty').value.trim(),
        payments: document.getElementById('set-payments').value.trim(),
        about: document.getElementById('set-about').value.trim(),
        programs: document.getElementById('set-programs').value.trim(),
        collaborators: document.getElementById('set-collaborators').value.trim(),
        social: document.getElementById('set-social').value.trim(),
        offer_end: document.getElementById('set-offer-end').value || ''
    };
    saveSettings(settings);
    alert('Configuración guardada correctamente.');
}

// --- Logout ---
function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
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

function saveNav(nav) {
    localStorage.setItem(NAV_KEY, JSON.stringify(nav));
}

function navToText(nav) {
    return nav.map(dept => {
        if (!dept.columns || dept.columns.length === 0) return dept.name;
        return dept.name + '\n' + dept.columns.map(col =>
            '  ' + col.title + ': ' + (col.links || []).join(', ')
        ).join('\n');
    }).join('\n');
}

function textToNav(text) {
    const lines = text.split('\n');
    const nav = [];
    let currentDept = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (!line.startsWith('  ') && !line.startsWith('\t')) {
            currentDept = { name: trimmed, columns: [] };
            nav.push(currentDept);
        } else if (currentDept && trimmed.includes(':')) {
            const idx = trimmed.indexOf(':');
            const title = trimmed.slice(0, idx).trim();
            const itemsStr = trimmed.slice(idx + 1).trim();
            const links = itemsStr ? itemsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
            currentDept.columns.push({ title, links });
        }
    }
    return nav;
}

function renderMenuForm() {
    const textarea = document.getElementById('menu-editor');
    const nav = getNav();
    textarea.value = navToText(nav);
    renderMenuPreview(nav);
}

function saveMenuForm() {
    const textarea = document.getElementById('menu-editor');
    const nav = textToNav(textarea.value);
    saveNav(nav);
    renderMenuPreview(nav);
    alert('Menú guardado correctamente');
}

function renderMenuPreview(nav) {
    const container = document.getElementById('menu-preview-nav');
    if (!container) return;

    function deptHref(name) {
        const lower = name.toLowerCase();
        const cat = ({ hombre: 'men', mujer: 'women', inteligentes: 'smart', smart: 'smart' })[lower] || null;
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

    container.innerHTML = '<ul class="nav-list" style="justify-content:center;padding:8px 16px;">' +
        nav.map(dept => {
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
        }).join('') +
        '</ul>';
}

// --- Init ---
(async function init() {
    // Ensure default banners exist
    if (!localStorage.getItem(BANNERS_KEY)) {
        saveBanners(defaultBanners);
    }
    // Ensure default nav exists
    if (!localStorage.getItem(NAV_KEY)) {
        saveNav(defaultNav);
    }
    const products = await fetchAllFromAPI();
    saveLocalProducts(products);
    renderTable();
})();
