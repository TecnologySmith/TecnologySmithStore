// =============================================
//  TECNOLOGYSMITH STORE — script.js
// =============================================

// --- CONFIGURACIÓN (editar aquí) ---
const WEBHOOK  = "TU_WEBHOOK_AQUI";   // URL de tu Google Apps Script
const LINK_MP  = "https://mpago.la/XXXXXXX"; // Link de pago MercadoPago
const SHEET_URL = "https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1";
const PEDIDOS_URL = "https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Pedidos";
const WHATSAPP_NUM = "573222117202";

// --- ESTADO ---
let productosData = [];
let carrito = [];

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  renderSkeletons(8);
  cargarProductos();
  document.getElementById("buscar").addEventListener("input", filtrar);
  document.getElementById("filtro").addEventListener("change", filtrar);
});

// =============================================
//  CARGA DE PRODUCTOS
// =============================================

function cargarProductos() {
  fetch(SHEET_URL)
    .then(r => r.json())
    .then(data => {
      productosData = data;
      renderProductos(data);
      cargarCategorias(data);
      actualizarContador(data.length);
    })
    .catch(() => {
      document.getElementById("productos").innerHTML = "";
      mostrarEmpty(true);
    });
}

function renderSkeletons(n) {
  const grid = document.getElementById("productos");
  grid.innerHTML = Array.from({ length: n }, () => `
    <div class="product-card" style="pointer-events:none;">
      <div class="product-img-wrap" style="background:var(--surface-2);">
        <div class="skeleton" style="width:80%;height:80%;"></div>
      </div>
      <div class="product-body" style="gap:12px;">
        <div class="skeleton" style="height:18px;width:50%;"></div>
        <div class="skeleton" style="height:22px;width:85%;"></div>
        <div class="skeleton" style="height:28px;width:55%;margin-top:4px;"></div>
        <div class="skeleton" style="height:38px;width:100%;margin-top:8px;border-radius:8px;"></div>
      </div>
    </div>
  `).join("");
}

// =============================================
//  RENDER DE PRODUCTOS
// =============================================

function renderProductos(data) {
  const grid = document.getElementById("productos");

  if (!data.length) {
    grid.innerHTML = "";
    mostrarEmpty(true);
    return;
  }

  mostrarEmpty(false);
  actualizarContador(data.length);

  grid.innerHTML = data.map(p => {
    const precio = Number(p.precio).toLocaleString("es-CO");
    return `
      <article class="product-card">
        <div class="product-img-wrap">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        </div>
        <div class="product-body">
          <span class="category-badge">${p.categoria}</span>
          <h3 class="product-name">${p.nombre}</h3>
          <p class="product-price"><small>$</small>${precio}</p>
          <div class="card-actions">
            <button class="btn btn-secondary" onclick="verDetalles('${p.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Ver
            </button>
            <button class="btn btn-primary" onclick="comprarProducto('${p.id}')">
              Comprar
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function actualizarContador(n) {
  const el = document.getElementById("productCount");
  if (el) el.textContent = `${n} producto${n !== 1 ? "s" : ""}`;
}

function mostrarEmpty(show) {
  const el = document.getElementById("emptyState");
  if (el) el.style.display = show ? "block" : "none";
}

// =============================================
//  FILTROS
// =============================================

function cargarCategorias(data) {
  const cats = [...new Set(data.map(p => p.categoria).filter(Boolean))];
  const select = document.getElementById("filtro");
  select.innerHTML = `<option value="">Todas las categorías</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

function filtrar() {
  const texto = document.getElementById("buscar").value.toLowerCase();
  const cat = document.getElementById("filtro").value;
  const filtrados = productosData.filter(p =>
    p.nombre.toLowerCase().includes(texto) && (!cat || p.categoria === cat)
  );
  renderProductos(filtrados);
}

// =============================================
//  CARRITO
// =============================================

function agregarCarrito(id) {
  const p = productosData.find(x => x.id == id);
  if (!p) return;
  carrito.push(p);
  actualizarBadge();
  mostrarToast(`✓ "${p.nombre}" añadido al carrito`);
}

function actualizarBadge() {
  const badge = document.getElementById("count");
  badge.textContent = carrito.length;
  badge.classList.remove("bump");
  requestAnimationFrame(() => badge.classList.add("bump"));
  setTimeout(() => badge.classList.remove("bump"), 300);
}

function comprarProducto(id) {
  const p = productosData.find(x => x.id == id);
  if (!p) return;
  carrito = [p];
  actualizarBadge();
  abrirCarrito();
}

// =============================================
//  MODAL CARRITO
// =============================================

function verCarrito() {
  if (carrito.length === 0) {
    mostrarToast("Tu carrito está vacío");
    return;
  }
  abrirCarrito();
}

function abrirCarrito() {
  let total = 0;
  const itemsHTML = carrito.map(p => {
    total += parseInt(p.precio);
    const precio = Number(p.precio).toLocaleString("es-CO");
    return `
      <div class="cart-item">
        <span class="cart-item-name">${p.nombre}</span>
        <span class="cart-item-price">$${precio}</span>
      </div>
    `;
  }).join("");

  const totalFmt = total.toLocaleString("es-CO");

  abrirModal(`
    <button class="modal-close" onclick="cerrarModal()">✕</button>
    <h2 class="cart-modal-title">Finalizar pedido</h2>

    <div class="cart-items">${itemsHTML}</div>

    <div class="cart-total-row">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-value">$${totalFmt}</span>
    </div>

    <hr class="form-divider">

    <div class="form-group">
      <label>Nombre completo</label>
      <input id="fNombre" placeholder="Ej: Juan García" autocomplete="name">
    </div>
    <div class="form-group">
      <label>WhatsApp / Teléfono</label>
      <input id="fTelefono" type="tel" placeholder="Ej: 3001234567" autocomplete="tel">
    </div>
    <div class="form-group">
      <label>Dirección de entrega</label>
      <input id="fDireccion" placeholder="Calle, barrio, ciudad" autocomplete="street-address">
    </div>
    <div class="form-group">
      <label>Notas adicionales <span style="font-weight:400;text-transform:none;letter-spacing:0;">(opcional)</span></label>
      <textarea id="fNota" rows="3" placeholder="Instrucciones especiales..."></textarea>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
      <button class="btn btn-green btn-lg" onclick="finalizarCompra('${encodeURIComponent(carrito.map(p => `${p.nombre} - $${Number(p.precio).toLocaleString('es-CO')}`).join('\n'))}', ${total})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.527 5.847L0 24l6.278-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.877 9.877 0 0 1-5.032-1.375l-.36-.214-3.732.896.938-3.636-.234-.374A9.868 9.868 0 0 1 2.106 12C2.106 6.534 6.534 2.106 12 2.106S21.894 6.534 21.894 12 17.466 21.894 12 21.894z"/></svg>
        Confirmar por WhatsApp
      </button>
      <button class="btn btn-danger btn-lg" onclick="cerrarModal()">Cancelar</button>
    </div>
  `);
}

// =============================================
//  FINALIZAR COMPRA
// =============================================

function finalizarCompra(listaEnc, total) {
  const nombre   = document.getElementById("fNombre").value.trim();
  const telefono = document.getElementById("fTelefono").value.trim();
  const direccion = document.getElementById("fDireccion").value.trim();
  const nota     = document.getElementById("fNota").value.trim();

  if (!nombre || !telefono || !direccion) {
    mostrarToast("⚠️ Por favor completa todos los campos");
    return;
  }

  const lista    = decodeURIComponent(listaEnc);
  const totalFmt = Number(total).toLocaleString("es-CO");

  const mensaje = `🛍️ *PEDIDO NUEVO*\n\n👤 *Nombre:* ${nombre}\n📞 *Tel:* ${telefono}\n📍 *Dirección:* ${direccion}\n\n🧾 *Detalle:*\n${lista}\n\n💰 *Total:* $${totalFmt}${nota ? `\n\n📝 *Nota:* ${nota}` : ""}`;

  // Notificación al webhook
  if (WEBHOOK !== "TU_WEBHOOK_AQUI") {
    fetch(WEBHOOK, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, direccion, productos: lista, total, nota })
    });
  }

  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(mensaje)}`);

  if (LINK_MP !== "https://mpago.la/XXXXXXX") {
    setTimeout(() => window.open(LINK_MP), 1500);
  }

  carrito = [];
  actualizarBadge();
  cerrarModal();
  mostrarToast("✅ Pedido enviado por WhatsApp");
}

// =============================================
//  MODAL DETALLE DE PRODUCTO
// =============================================

function verDetalles(id) {
  const p = productosData.find(x => x.id == id);
  if (!p) return;

  const imagenes = [p.imagen, p.imagen2, p.imagen3].filter(x => x && x.trim() !== "");
  let current = 0;
  const precio = Number(p.precio).toLocaleString("es-CO");

  const dotsHTML = imagenes.length > 1
    ? `<div style="display:flex;justify-content:center;gap:6px;margin-top:10px;">
        ${imagenes.map((_, i) => `<span id="dot-${i}" style="width:7px;height:7px;border-radius:50%;background:${i === 0 ? "var(--cyan)" : "var(--border)"};display:inline-block;transition:background 0.2s;"></span>`).join("")}
       </div>`
    : "";

  const carouselHTML = imagenes.length > 1
    ? `<button class="carousel-nav carousel-prev" onclick="cambiarImg(-1)">❮</button>
       <button class="carousel-nav carousel-next" onclick="cambiarImg(1)">❯</button>`
    : "";

  abrirModal(`
    <button class="modal-close" onclick="cerrarModal()">✕</button>
    <div class="modal-img-carousel">
      <img id="imgDetalle" src="${imagenes[0]}" alt="${p.nombre}">
      ${carouselHTML}
    </div>
    ${dotsHTML}
    <div style="margin-top:20px;">
      <span class="category-badge" style="margin-bottom:12px;">${p.categoria}</span>
      <h2 class="modal-product-title">${p.nombre}</h2>
      <p class="modal-product-desc">${p.descripcion || "Sin descripción disponible."}</p>
      <p class="modal-product-price"><small style="font-size:1rem;">$</small>${precio}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary btn-lg" onclick="agregarCarrito('${p.id}'); cerrarModal()">
          + Carrito
        </button>
        <button class="btn btn-primary btn-lg" onclick="comprarProducto('${p.id}')">
          Comprar ahora
        </button>
      </div>
    </div>
  `);

  const updateDots = () => {
    imagenes.forEach((_, i) => {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) dot.style.background = i === current ? "var(--cyan)" : "var(--border)";
    });
  };

  window.cambiarImg = function(dir) {
    current = (current + dir + imagenes.length) % imagenes.length;
    const img = document.getElementById("imgDetalle");
    if (img) img.src = imagenes[current];
    updateDots();
  };
}

// =============================================
//  MODAL HELPERS
// =============================================

function abrirModal(html) {
  const modal   = document.getElementById("modal");
  const content = document.getElementById("modalContent");
  content.innerHTML = html;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function cerrarModal(e) {
  // Si se pasa un evento, solo cerrar si hizo click en el backdrop
  if (e && e.target !== document.getElementById("modal")) return;
  const modal = document.getElementById("modal");
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

// ESC para cerrar modal
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModal();
});

// =============================================
//  TOAST
// =============================================

let toastTimer;
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
