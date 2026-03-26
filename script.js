// --- CONFIGURACIÓN ---
let productosData = [];
let carrito = [];

const WEBHOOK = "TU_WEBHOOK_AQUI";
const LINK_MP = "https://mpago.la/XXXXXXX";

// 🌐 ESTILOS ADAPTATIVOS (INYECTADOS PARA MANTENER TODO EN UN SOLO ARCHIVO)
const estilos = `
<style>
    :root { --puntos: #2ecc71; --fondo: #f4f4f9; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: var(--fondo); }
    
    /* Contenedor de productos responsivo */
    #productos { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
        gap: 20px; padding: 20px; 
    }

    .product-card { 
        background: white; border-radius: 15px; padding: 15px; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;
        transition: transform 0.3s;
    }

    .product-card img { width: 100%; height: 200px; object-fit: contain; border-radius: 10px; }
    
    /* 🛒 ICONO DE CARRITO FLOTANTE Y VISIBLE */
    .cart-float {
        position: fixed; bottom: 20px; right: 20px;
        background: var(--puntos); color: white; width: 65px; height: 65px;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3); cursor: pointer; z-index: 1000;
        font-size: 24px; border: 2px solid white;
    }
    #count {
        position: absolute; top: 0; right: 0; background: red;
        color: white; border-radius: 50%; padding: 4px 8px; font-size: 12px;
    }

    /* MODAL ADAPTATIVO */
    #modal { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.7); 
        display: none; align-items: center; justify-content: center; z-index: 2000; 
        padding: 10px;
    }
    #modalContent { 
        background: white; width: 100%; max-width: 500px; 
        max-height: 90vh; overflow-y: auto; border-radius: 20px; padding: 20px; 
    }

    /* TEXTOS Y BOTONES */
    h2, h3 { margin: 10px 0; color: #333; }
    .button { 
        width: 100%; padding: 12px; margin: 5px 0; border: none; 
        border-radius: 8px; cursor: pointer; font-weight: bold; 
    }
    input, textarea { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }

    @media (max-width: 600px) {
        h2 { font-size: 1.2rem; }
        .product-card { padding: 10px; }
    }
</style>
`;
document.head.insertAdjacentHTML("beforeend", estilos);

// 🔥 CARGAR PRODUCTOS
fetch("https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1")
.then(r=>r.json())
.then(data=>{
    productosData = data;
    renderProductos(data);
    cargarCategorias(data);
});

// 🎯 RENDER CON FORMATO DE MILES
function renderProductos(data){
    let html="";
    data.forEach(p=>{
        // Aplicamos punto de miles
        let precioFormat = Number(p.precio).toLocaleString('es-CO');
        
        html+=`
        <div class="product-card">
            <div class="category-badge">${p.categoria}</div>
            <img src="${p.imagen}">
            <h3>${p.nombre}</h3>
            <p><strong>$${precioFormat}</strong></p>

            <button class="button" style="background:#3498db; color:white;" onclick="verDetalles('${p.id}')">Ver detalles</button>
            <button class="button" style="background:#f1c40f; color:black;" onclick="agregarCarrito('${p.id}')">Agregar</button>
            <button class="button" style="background:var(--puntos); color:white;" onclick="comprarProducto('${p.id}')">Comprar</button>
        </div>
        `;
    });
    document.getElementById("productos").innerHTML=html;
}

// 🛒 AGREGAR
function agregarCarrito(id){
    let p = productosData.find(x=>x.id==id);
    carrito.push(p);
    document.getElementById("count").innerText = carrito.length;
}

// 💥 COMPRA DIRECTA
function comprarDirecto(id){
    let p = productosData.find(x=>x.id==id);
    let precioFormat = Number(p.precio).toLocaleString('es-CO');

    let msg = `🛍️ QUIERO COMPRAR\nProducto: ${p.nombre}\nCategoría: ${p.categoria}\nPrecio: $${precioFormat}`;
    window.open("https://wa.me/573222117202?text="+encodeURIComponent(msg));
}

// 🔍 BUSCAR
document.getElementById("buscar").addEventListener("input",filtrar);
document.getElementById("filtro").addEventListener("change",filtrar);

function filtrar(){
    let texto = document.getElementById("buscar").value.toLowerCase();
    let cat = document.getElementById("filtro").value;

    let filtrados = productosData.filter(p=>{
        return p.nombre.toLowerCase().includes(texto) &&
        (cat=="" || p.categoria==cat);
    });
    renderProductos(filtrados);
}

// 🏷️ CATEGORIAS
function cargarCategorias(data){
    let categorias = [...new Set(data.map(p=>p.categoria))];
    let html=`<option value="">Todas</option>`;
    categorias.forEach(c=>{
        html+=`<option>${c}</option>`;
    });
    document.getElementById("filtro").innerHTML=html;
}

// 🛒 VER CARRITO CON FORMATO DE MILES
function verCarrito(){
    if(carrito.length==0){
        alert("Carrito vacío");
        return;
    }

    let total=0;
    let lista="";

    carrito.forEach(p=>{
        total+=parseInt(p.precio);
        let precioItem = Number(p.precio).toLocaleString('es-CO');
        lista+=`${p.nombre} - $${precioItem}\n`;
    });

    let totalFormat = total.toLocaleString('es-CO');

    let html=`
    <div style="text-align:left;">
        <h2 style="text-align:center;">Finalizar pedido</h2>
        <input id="nombre" placeholder="Nombre completo">
        <input id="telefono" type="tel" placeholder="Teléfono/WhatsApp">
        <input id="direccion" placeholder="Dirección de entrega">
        <textarea id="nota" placeholder="Notas adicionales (opcional)"></textarea>

        <div style="background:#eee; padding:10px; border-radius:10px; font-size:14px; margin-top:10px;">
            <pre style="white-space:pre-wrap; margin:0;">${lista}</pre>
        </div>
        <h3 style="text-align:right;">Total: $${totalFormat}</h3>

        <button class="button" style="background:var(--puntos); color:white;" onclick="finalizarCompra('${encodeURIComponent(lista)}','${total}')">
            Confirmar y Enviar a WhatsApp
        </button>
        <button class="button" style="background:#e74c3c; color:white;" onclick="cerrar()">Cancelar</button>
    </div>
    `;

    document.getElementById("modalContent").innerHTML=html;
    document.getElementById("modal").style.display="flex";
}

// 🔥 FINALIZAR
function finalizarCompra(lista,total){
    let nombre = document.getElementById("nombre").value;
    let telefono = document.getElementById("telefono").value;
    let direccion = document.getElementById("direccion").value;
    let nota = document.getElementById("nota").value;

    if(!nombre || !telefono || !direccion){
        alert("Por favor completa los datos de entrega");
        return;
    }

    let totalFormat = Number(total).toLocaleString('es-CO');
    let mensaje = `🛍️ *PEDIDO NUEVO*\n\n👤 *Nombre:* ${nombre}\n📞 *Tel:* ${telefono}\n📍 *Dir:* ${direccion}\n\n🧾 *Detalle:*\n${decodeURIComponent(lista)}\n💰 *Total:* $${totalFormat}\n\n📝 *Nota:* ${nota}`;

    let url = "https://wa.me/573222117202?text=" + encodeURIComponent(mensaje);

    fetch(WEBHOOK,{
        method:"POST",
        mode: 'no-cors',
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ nombre, telefono, direccion, productos: decodeURIComponent(lista), total, nota })
    });

    window.open(url);

    setTimeout(()=>{ window.open(LINK_MP); },1500);

    carrito=[];
    document.getElementById("count").innerText = 0;
    cerrar();
}

function cerrar(){
    document.getElementById("modal").style.display="none";
}

// 🖼️ DETALLES CON FORMATO Y RESPONSIVE
function verDetalles(id){
    let p = productosData.find(x=>x.id==id);
    let imagenes = [p.imagen, p.imagen2, p.imagen3].filter(x=>x && x.trim()!="");
    let current = 0;
    let precioDetalle = Number(p.precio).toLocaleString('es-CO');

    let html = `
    <h2>${p.nombre}</h2>
    <div style="position:relative; width:100%; text-align:center;">
        <button onclick="cambiarImg(-1)" style="position:absolute;left:0;top:45%; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer;">❮</button>
        <img id="imgDetalle" src="${imagenes[0]}" style="width:100%; max-height:280px; object-fit:contain;">
        <button onclick="cambiarImg(1)" style="position:absolute;right:0;top:45%; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer;">❯</button>
    </div>
    <p style="color:#666; font-size:14px; line-height:1.4;">${p.descripcion || "Sin descripción disponible"}</p>
    <h3 style="color:var(--puntos)">$${precioDetalle}</h3>
    <button class="button" style="background:#f1c40f;" onclick="agregarCarrito('${p.id}')">Agregar al carrito</button>
    <button class="button" style="background:var(--puntos); color:white;" onclick="comprarProducto('${p.id}')">Comprar Ahora</button>
    <button class="button" style="background:#888; color:white;" onclick="cerrar()">Cerrar</button>
    `;

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display="flex";

    window.cambiarImg = function(dir){
        current += dir;
        if(current < 0) current = imagenes.length -1;
        if(current >= imagenes.length) current = 0;
        document.getElementById("imgDetalle").src = imagenes[current];
    }
}

function comprarProducto(id){
    let p = productosData.find(x=>x.id==id);
    carrito = [p];
    verCarrito();
}
