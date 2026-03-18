const URL = "https://opensheet.elk.sh/1bIcXzZy-yv3Veims11KbIbamG3ruhyspJC0tsCwhge8/Hoja1";

let productos = [];
let carrito = [];

// 🔄 CARGAR PRODUCTOS
async function cargarProductos(){
    let res = await fetch(URL);
    let data = await res.json();

    console.log("DATA:", data);

    productos = data;

    renderProductos(productos);
    cargarCategorias(productos);
}

// 🎯 RENDER
function renderProductos(lista){

    let html = "";

    lista.forEach(p=>{

        if(!p.nombre) return;

        html += `
        <div class="card">
            <img src="${p.imagen}" alt="">
            <h3>${p.nombre}</h3>
            <p>${p.categoria}</p>
            <p>$${p.precio}</p>

            <button onclick="verProducto('${p.id}')">Ver</button>
        </div>
        `;
    });

    document.getElementById("productos").innerHTML = html;
}

// 🔍 BUSCADOR
document.getElementById("buscar").addEventListener("input", e=>{
    let texto = e.target.value.toLowerCase();

    let filtrados = productos.filter(p=>
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.categoria && p.categoria.toLowerCase().includes(texto))
    );

    renderProductos(filtrados);
});

// 🏷️ CATEGORÍAS
function cargarCategorias(data){

    let cats = [...new Set(data.map(p=>p.categoria).filter(Boolean))];

    let select = document.getElementById("filtro");

    select.innerHTML = `<option value="">Todas</option>`;

    cats.forEach(c=>{
        select.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

// 🎯 FILTRO
document.getElementById("filtro").addEventListener("change", e=>{
    let cat = e.target.value;

    if(cat === "") return renderProductos(productos);

    let filtrados = productos.filter(p=>p.categoria === cat);
    renderProductos(filtrados);
});

// 👁️ MODAL
function verProducto(id){

    let p = productos.find(x=>x.id == id);

    let mensaje = `Hola quiero comprar ${p.nombre} por $${p.precio}`;

    let html = `
    <h2>${p.nombre}</h2>
    <img src="${p.imagen}">
    <p>${p.descripcion}</p>

    <a target="_blank" href="https://wa.me/573222117202?text=${encodeURIComponent(mensaje)}">
        <button>Comprar por WhatsApp</button>
    </a>

    <button onclick="agregarCarrito('${p.id}')">Agregar al carrito</button>
    `;

    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display = "flex";
}

// 🛒 CARRITO
function agregarCarrito(id){
    carrito.push(id);
    document.getElementById("count").innerText = carrito.length;
}

// 🛍️ VER CARRITO
function verCarrito(){

    let items = carrito.map(id=>{
        let p = productos.find(x=>x.id == id);
        return p?.nombre + " - $" + p?.precio;
    }).join("\n");

    let total = carrito.reduce((sum,id)=>{
        let p = productos.find(x=>x.id == id);
        return sum + Number(p?.precio || 0);
    },0);

    let mensaje = `Quiero comprar:\n${items}\nTotal: $${total}`;

    window.open(`https://wa.me/573222117202?text=${encodeURIComponent(mensaje)}`);
}

// 🚀 INICIAR
cargarProductos();
