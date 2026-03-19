let productosData = [];
let carrito = [];

const WEBHOOK = "TU_WEBHOOK_AQUI";
const LINK_MP = "https://mpago.la/XXXXXXX";

// 🔥 CARGAR PRODUCTOS
fetch("https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1")
.then(r=>r.json())
.then(data=>{
productosData = data;
renderProductos(data);
cargarCategorias(data);
});

// 🎯 RENDER
function renderProductos(data){
let html="";

data.forEach(p=>{
html+=`
<div class="product-card">
<div class="category-badge">${p.categoria}</div>
<img src="${p.imagen}">
<h3>${p.nombre}</h3>
<p>$${p.precio}</p>

<button class="button" onclick="verDetalles('${p.id}')">Ver detalles</button>
<button class="button" onclick="agregarCarrito('${p.id}')">Agregar</button>
<button class="button" onclick="comprarDirecto('${p.id}')">Comprar</button>

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

let msg = `🛍️ QUIERO COMPRAR
Producto: ${p.nombre}
Categoría: ${p.categoria}
Precio: $${p.precio}`;

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

// 🛒 VER CARRITO
function verCarrito(){

if(carrito.length==0){
alert("Carrito vacío");
return;
}

let total=0;
let lista="";

carrito.forEach(p=>{
total+=parseInt(p.precio);
lista+=`${p.nombre} - $${p.precio}\n`;
});

let html=`
<h2>Finalizar compra</h2>

<input id="nombre" placeholder="Nombre">
<input id="telefono" placeholder="Teléfono">
<input id="direccion" placeholder="Dirección">
<textarea id="nota" placeholder="Nota"></textarea>

<pre>${lista}</pre>
<h3>Total: $${total}</h3>

<button class="button" onclick="finalizarCompra('${encodeURIComponent(lista)}','${total}')">
Finalizar Pedido
</button>

<button class="button" onclick="cerrar()">Cancelar</button>
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
alert("Completa todos los campos");
return;
}

let mensaje = `🛍️ PEDIDO NUEVO

👤 ${nombre}
📞 ${telefono}
📍 ${direccion}

🧾 ${decodeURIComponent(lista)}

💰 Total: $${total}

📝 ${nota}`;

let url = "https://wa.me/573222117202?text=" + encodeURIComponent(mensaje);

// guardar en sheets
fetch(WEBHOOK,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
nombre,
telefono,
direccion,
productos: decodeURIComponent(lista),
total,
nota
})
});

// abrir whatsapp
window.open(url);

// abrir pago
setTimeout(()=>{
window.open(LINK_MP);
},1500);

// limpiar
carrito=[];
document.getElementById("count").innerText=0;
cerrar();
}

// ❌ cerrar
function cerrar(){
document.getElementById("modal").style.display="none";
}

function verDetalles(id){

let p = productosData.find(x=>x.id==id);

// 🖼️ IMÁGENES
let imagenes = [p.imagen, p.imagen2, p.imagen3].filter(x=>x && x.trim()!="");

let current = 0;

// 🎯 HTML
let html = `
<h2>${p.nombre}</h2>

<div style="position:relative;">

<button onclick="cambiarImg(-1)" style="position:absolute;left:0;top:50%;">❮</button>

<img id="imgDetalle" src="${imagenes[0]}" style="width:100%;max-height:300px;object-fit:contain;">

<button onclick="cambiarImg(1)" style="position:absolute;right:0;top:50%;">❯</button>

</div>

<p>${p.descripcion || "Sin descripción"}</p>

<h3>$${p.precio}</h3>

<button class="button" onclick="agregarCarrito('${p.id}')">Agregar al carrito</button>
<button class="button" onclick="finalizarCompra('${p.id}')">Comprar</button>

<button class="button" onclick="cerrar()">Cerrar</button>
`;

// mostrar modal
document.getElementById("modalContent").innerHTML = html;
document.getElementById("modal").style.display="flex";

// 🔄 CARRUSEL
window.cambiarImg = function(dir){
current += dir;

if(current < 0) current = imagenes.length -1;
if(current >= imagenes.length) current = 0;

document.getElementById("imgDetalle").src = imagenes[current];
}

}
