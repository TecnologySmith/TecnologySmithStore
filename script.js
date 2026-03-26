// --- CONFIGURACIÓN ---
let productosData = [];
let carrito = [];

const WEBHOOK = "TU_WEBHOOK_AQUI";
const LINK_MP = "https://mpago.la/XXXXXXX";

// 🔥 CARGAR PRODUCTOS DESDE GOOGLE SHEETS
fetch("https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1")
    .then(r => r.json())
    .then(data => {
        productosData = data;
        renderProductos(data);
        cargarCategorias(data);
    });

// 🎯 RENDERIZADO DE CATÁLOGO
function renderProductos(data) {
    let html = "";

    data.forEach(p => {
        // Formato de miles para la vista principal
        let precioFormat = Number(p.precio).toLocaleString('es-CO');

        html += `
        <div class="product-card">
            <div class="category-badge">${p.categoria}</div>
            <img src="${p.imagen}">
            <h3>${p.nombre}</h3>
            <p>$${precioFormat}</p>

            <button class="button" onclick="verDetalles('${p.id}')">Ver detalles</button>
            <button class="button" onclick="agregarCarrito('${p.id}')">Agregar</button>
            <button class="button" onclick="comprarProducto('${p.id}')">Comprar</button>
        </div>
        `;
    });

    document.getElementById("productos").innerHTML = html;
}

// 🛒 AGREGAR AL CARRITO
function agregarCarrito(id) {
    let p = productosData.find(x => x.id == id);
    carrito.push(p);
    document.getElementById("count").innerText = carrito.length;
}

// 💥 COMPRA DIRECTA (BOTÓN RÁPIDO)
function comprarDirecto(id) {
    let p = productosData.find(x => x.id == id);
    let precioFormat = Number(p.precio).toLocaleString('es-CO');

    let msg = `🛍️ QUIERO COMPRAR\nProducto: ${p.nombre}\nCategoría: ${p.categoria}\nPrecio: $${precioFormat}`;

    window.open("https://wa.me/573222117202?text=" + encodeURIComponent(msg));
}

// 🔍 FILTROS DE BÚSQUEDA
document.getElementById("buscar").addEventListener("input", filtrar);
document.getElementById("filtro").addEventListener("change", filtrar);

function filtrar() {
    let texto = document.getElementById("buscar").value.toLowerCase();
    let cat = document.getElementById("filtro").value;

    let filtrados = productosData.filter(p => {
        return p.nombre.toLowerCase().includes(texto) &&
            (cat == "" || p.categoria == cat);
    });

    renderProductos(filtrados);
}

// 🏷️ CARGAR CATEGORÍAS DINÁMICAS
function cargarCategorias(data) {
    let categorias = [...new Set(data.map(p => p.categoria))];
    let html = `<option value="">Todas</option>`;
    categorias.forEach(c => {
        html += `<option>${c}</option>`;
    });
    document.getElementById("filtro").innerHTML = html;
}

// 🛒 VER Y GESTIONAR CARRITO
function verCarrito() {
    if (carrito.length == 0) {
        alert("Carrito vacío");
        return;
    }

    let total = 0;
    let listaCuerpo = "";

    carrito.forEach(p => {
        total += parseInt(p.precio);
        // Formato de miles para cada item en el desglose
        let pUnitario = Number(p.precio).toLocaleString('es-CO');
        listaCuerpo += `${p.nombre} - $${pUnitario}\n`;
    });

    // Formato de miles para el total final
    let totalFormat = total.toLocaleString('es-CO');

    let html = `
    <h2>Finalizar compra</h2>

    <input id="nombre" placeholder="Nombre">
    <input id="telefono" placeholder="Teléfono">
    <input id="direccion" placeholder="Dirección">
    <textarea id="nota" placeholder="Nota"></textarea>

    <pre>${listaCuerpo}</pre>
    <h3>Total: $${totalFormat}</h3>

    <button class="button" onclick="finalizarCompra('${encodeURIComponent(listaCuerpo)}','${total}')">
        Finalizar Pedido
    </button>

    <button class="button" onclick="cerrar()">Cancelar</button>
    `;

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display = "flex";
}

// 🔥 PROCESAR PEDIDO (WHATSAPP + WEBHOOK + MERCADO PAGO)
function finalizarCompra(lista, total) {
    let nombre = document.getElementById("nombre").value;
    let telefono = document.getElementById("telefono").value;
    let direccion = document.getElementById("direccion").value;
    let nota = document.getElementById("nota").value;

    if (!nombre || !telefono || !direccion) {
        alert("Completa todos los campos");
        return;
    }

    // El total para el mensaje de WA también con formato
    let totalFormat = Number(total).toLocaleString('es-CO');

    let mensaje = `🛍️ PEDIDO NUEVO\n\n👤 ${nombre}\n📞 ${telefono}\n📍 ${direccion}\n\n🧾 ${decodeURIComponent(lista)}\n💰 Total: $${totalFormat}\n\n📝 ${nota}`;

    let url = "https://wa.me/573222117202?text=" + encodeURIComponent(mensaje);

    // Guardar en Google Sheets vía Webhook (Enviamos el total numérico para cálculos)
    fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors", // Evita problemas de CORS con algunos scripts
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            telefono,
            direccion,
            productos: decodeURIComponent(lista),
            total: total,
            nota
        })
    });

    // Abrir WhatsApp
    window.open(url);

    // Abrir pasarela de pago (Mercado Pago)
    setTimeout(() => {
        window.open(LINK_MP);
    }, 1500);

    // Limpiar estado
    carrito = [];
    document.getElementById("count").innerText = 0;
    cerrar();
}

// ❌ CERRAR MODALES
function cerrar() {
    document.getElementById("modal").style.display = "none";
}

// 🖼️ VER DETALLE DE PRODUCTO (CON CARRUSEL)
function verDetalles(id) {
    let p = productosData.find(x => x.id == id);
    let imagenes = [p.imagen, p.imagen2, p.imagen3].filter(x => x && x.trim() != "");
    let current = 0;
    
    // Formato de miles para el detalle
    let precioDetalle = Number(p.precio).toLocaleString('es-CO');

    let html = `
    <h2>${p.nombre}</h2>

    <div style="position:relative; text-align:center;">
        <button onclick="cambiarImg(-1)" style="position:absolute;left:0;top:50%; background:rgba(0,0,0,0.5); color:white; border:none; cursor:pointer; padding:10px;">❮</button>
        <img id="imgDetalle" src="${imagenes[0]}" style="width:100%; max-height:300px; object-fit:contain;">
        <button onclick="cambiarImg(1)" style="position:absolute;right:0;top:50%; background:rgba(0,0,0,0.5); color:white; border:none; cursor:pointer; padding:10px;">❯</button>
    </div>

    <p style="margin: 15px 0;">${p.descripcion || "Sin descripción"}</p>
    <h3 style="color: #2ecc71;">$${precioDetalle}</h3>

    <button class="button" onclick="agregarCarrito('${p.id}')">Agregar al carrito</button>
    <button class="button" onclick="comprarProducto('${p.id}')">Comprar ahora</button>
    <button class="button" onclick="cerrar()" style="background:#888;">Cerrar</button>
    `;

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display = "flex";

    // Función global para el carrusel dentro del modal
    window.cambiarImg = function (dir) {
        current += dir;
        if (current < 0) current = imagenes.length - 1;
        if (current >= imagenes.length) current = 0;
        document.getElementById("imgDetalle").src = imagenes[current];
    }
}

// 🛒 FLUJO DE COMPRA RÁPIDA DESDE BOTÓN "COMPRAR"
function comprarProducto(id) {
    let p = productosData.find(x => x.id == id);
    carrito = [p]; // Limpia carrito y deja solo este producto
    verCarrito();
}
