let productosData = [];
let carrito = JSON.parse(localStorage.getItem('carrito_smith')) || [];

const CONFIG = {
    WEBHOOK: "TU_WEBHOOK_AQUI",
    LINK_MP: "https://mpago.la/XXXXXXX",
    WHATSAPP: "573222117202",
    SHEET_URL: "https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1"
};

// Formateador de moneda (Ingeniero, esto da mucha clase)
const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

// 🔥 INICIO
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    fetchProductos();
});

async function fetchProductos() {
    try {
        const response = await fetch(CONFIG.SHEET_URL);
        productosData = await response.json();
        document.getElementById("loader").style.display = "none";
        renderProductos(productosData);
        cargarCategorias(productosData);
    } catch (error) {
        console.error("Error cargando datos:", error);
        document.getElementById("loader").innerText = "Error al conectar con la base de datos.";
    }
}

function renderProductos(data) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = data.map(p => `
        <div class="product-card">
            <span class="category-badge">${p.categoria}</span>
            <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
            <h3>${p.nombre}</h3>
            <p class="price">${formatter.format(p.precio)}</p>
            <button class="button btn-outline" onclick="verDetalles('${p.id}')">Detalles</button>
            <button class="button btn-primary" onclick="agregarCarrito('${p.id}')">🛒 Agregar</button>
        </div>
    `).join('');
}

function agregarCarrito(id) {
    const p = productosData.find(x => x.id == id);
    carrito.push(p);
    saveAndSync();
    
    // Feedback visual rápido
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "¡Añadido! ✅";
    setTimeout(() => btn.innerText = originalText, 1500);
}

function saveAndSync() {
    localStorage.setItem('carrito_smith', JSON.stringify(carrito));
    actualizarContador();
}

function actualizarContador() {
    document.getElementById("count").innerText = carrito.length;
}

function verCarrito() {
    if (carrito.length === 0) return alert("El carrito está vacío, Ingeniero.");

    let total = carrito.reduce((sum, p) => sum + parseInt(p.precio), 0);
    let listaStr = carrito.map(p => `• ${p.nombre} (${formatter.format(p.precio)})`).join('\n');

    document.getElementById("modalContent").innerHTML = `
        <h2 style="color:var(--primary)">Confirmar Pedido</h2>
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 20px; font-size: 0.9rem;">
            ${carrito.map(p => `<p>✅ ${p.nombre} - <b>${formatter.format(p.precio)}</b></p>`).join('')}
        </div>
        <hr style="opacity:0.2">
        <h3>Total: ${formatter.format(total)}</h3>
        <input id="form-nombre" placeholder="Nombre completo">
        <input id="form-tel" placeholder="WhatsApp">
        <textarea id="form-nota" placeholder="Notas adicionales del pedido..."></textarea>
        <button class="button btn-primary" onclick="finalizarCompra()">Confirmar y Pagar</button>
        <button class="button" style="background:transparent" onclick="vaciarCarrito()">Vaciar Carrito</button>
    `;
    abrirModal();
}

function finalizarCompra() {
    const nombre = document.getElementById("form-nombre").value;
    const tel = document.getElementById("form-tel").value;
    const nota = document.getElementById("form-nota").value;

    if (!nombre || !tel) return alert("Por favor complete sus datos");

    const total = carrito.reduce((sum, p) => sum + parseInt(p.precio), 0);
    const lista = carrito.map(p => p.nombre).join(', ');

    const mensaje = `*NUEVO PEDIDO - TecnologySmith*%0A%0A👤 *Cliente:* ${nombre}%0A📞 *Tel:* ${tel}%0A🧾 *Items:* ${lista}%0A💰 *Total:* ${formatter.format(total)}%0A📝 *Nota:* ${nota}`;

    // Enviar a WhatsApp
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${mensaje}`);

    // Limpiar
    vaciarCarrito();
    cerrar();
    
    // Abrir link de pago tras breve delay
    setTimeout(() => window.open(CONFIG.LINK_MP), 2000);
}

function vaciarCarrito() {
    carrito = [];
    saveAndSync();
    cerrar();
}

// FUNCIONES DE MODAL
function abrirModal() { document.getElementById("modal").style.display = "flex"; }
function cerrar() { document.getElementById("modal").style.display = "none"; }

// FILTROS
document.getElementById("buscar").addEventListener("input", filtrar);
document.getElementById("filtro").addEventListener("change", filtrar);

function filtrar() {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const cat = document.getElementById("filtro").value;

    const filtrados = productosData.filter(p => 
        p.nombre.toLowerCase().includes(texto) && (cat === "" || p.categoria === cat)
    );
    renderProductos(filtrados);
}

function cargarCategorias(data) {
    const categorias = [...new Set(data.map(p => p.categoria))];
    const select = document.getElementById("filtro");
    categorias.forEach(c => {
        const opt = document.createElement("option");
        opt.value = opt.innerText = c;
        select.appendChild(opt);
    });
}

// 🔥 NUEVA FUNCIÓN VER DETALLES CORREGIDA
function verDetalles(id) {
    const p = productosData.find(x => x.id == id);
    if (!p) return;

    // 🖼️ GESTIÓN DE IMÁGENES (Obtenemos todas las disponibles)
    // Asumimos que en tu Excel las columnas se llaman: imagen, imagen2, imagen3
    const imagenes = [p.imagen, p.imagen2, p.imagen3].filter(x => x && x.trim() !== "");
    let currentIndex = 0;

    // 🎯 Generar HTML del Modal
    let html = `
        <div class="detalles-container">
            <div class="carrusel-container">
                <img id="imgDetalle" src="${imagenes[0]}" alt="${p.nombre}" class="img-principal-detalle">
                
                ${imagenes.length > 1 ? `
                    <button class="carrusel-btn prev" id="btnPrev">❮</button>
                    <button class="carrusel-btn next" id="btnNext">❯</button>
                    <div class="carrusel-indicador"><span id="currentImg">1</span> / ${imagenes.length}</div>
                ` : ''}
            </div>

            <div class="info-container">
                <span class="category-badge" style="position:static; display:inline-block; margin-bottom:10px;">${p.categoria}</span>
                <h2 class="detalle-titulo">${p.nombre}</h2>
                <p class="detalle-descripcion">${p.descripcion || 'Producto de alta tecnología seleccionado por TecnologySmith Store.'}</p>
                <h3 class="detalle-precio">${currency.format(p.precio)}</h3>
                
                <div class="acciones-detalle">
                    <button class="button btn-buy" onclick="comprarAhora('${p.id}')">Comprar Ahora</button>
                    <button class="button btn-cart" onclick="agregar('${p.id}')">Añadir al Carrito</button>
                </div>
            </div>
        </div>
    `;

    // Insertar y abrir modal
    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = html;
    document.getElementById("modal").style.display = "flex";

    // ⚙️ LÓGICA DEL CARRUSEL (Inyectada tras renderizar el HTML)
    if (imagenes.length > 1) {
        const imgElement = document.getElementById("imgDetalle");
        const currentTxt = document.getElementById("currentImg");

        const cambiarImagen = (direccion) => {
            currentIndex += direccion;
            
            // Lógica circular (Ingeniero, esto es clave)
            if (currentIndex < 0) currentIndex = imagenes.length - 1;
            if (currentIndex >= imagenes.length) currentIndex = 0;

            // Actualizar DOM con efecto suave
            imgElement.style.opacity = 0;
            setTimeout(() => {
                imgElement.src = imagenes[currentIndex];
                currentTxt.innerText = currentIndex + 1;
                imgElement.style.opacity = 1;
            }, 150);
        };

        // Asignar eventos a los botones
        document.getElementById("btnPrev").addEventListener("click", () => cambiarImagen(-1));
        document.getElementById("btnNext").addEventListener("click", () => cambiarImagen(1));
        
        // Soporte para teclado (Opcional, muy Pro)
        const handleKeyDown = (e) => {
            if (document.getElementById("modal").style.display === "flex") {
                if (e.key === "ArrowLeft") cambiarImagen(-1);
                if (e.key === "ArrowRight") cambiarImagen(1);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        
        // Limpiar evento al cerrar el modal para no saturar memoria
        const originalCerrar = window.cerrar;
        window.cerrar = () => {
            document.removeEventListener("keydown", handleKeyDown);
            originalCerrar();
            window.cerrar = originalCerrar; // Restaurar función original
        };
    }
}
