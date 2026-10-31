
const formatoPrecio = (precio) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(precio);
// Una lectura dañada nunca debe impedir que se abra el sitio.
function leerJSON(clave, respaldo, almacenamiento) {
    try { return JSON.parse((almacenamiento ?? localStorage).getItem(clave)) ?? respaldo; }
    catch { return respaldo; }
}
function guardarJSON(clave, valor, almacenamiento = localStorage) {
    almacenamiento.setItem(clave, JSON.stringify(valor));
}
function leerCarrito() {
    const datos = leerJSON('chiavetta-carrito', []);
    if (!Array.isArray(datos)) return [];
    const articulos = [];
    for (const item of datos) {
        if (!item || typeof item.id !== 'string' || !Number.isInteger(item.cantidad) || item.cantidad < 1) continue;
        const existente = articulos.find((articulo) => articulo.id === item.id);
        if (existente) existente.cantidad = Math.min(99, existente.cantidad + item.cantidad);
        else articulos.push({ id: item.id, cantidad: Math.min(99, item.cantidad) });
    }
    return articulos;
}
const guardarCarrito = (carrito) => guardarJSON('chiavetta-carrito', carrito);
function calcularTotales(subtotal, promocion = false) {
    const descuento = promocion ? Math.round(subtotal * 0.1) : 0;
    // Tasa heredada del TP, solo para la simulación; no representa impuestos reales.
    const impuesto = Math.round((subtotal - descuento) * 0.085);
    return { subtotal, descuento, impuesto, total: subtotal - descuento + impuesto };
}

let promocion = false;
function textoTotales(subtotal) {
    const t = calcularTotales(subtotal, promocion);
    return `<p>Subtotal: ${formatoPrecio(t.subtotal)}</p><p>Descuento: ${formatoPrecio(t.descuento)}</p><p>Impuesto de ejemplo (8,5%): ${formatoPrecio(t.impuesto)}</p><p><strong>Total: ${formatoPrecio(t.total)}</strong></p>`;
}
function informarError(error) {
    console.error(error);
    let aviso = document.querySelector('#error-aplicacion');
    if (!aviso) { aviso = document.createElement('p'); aviso.id = 'error-aplicacion'; aviso.setAttribute('role', 'alert'); document.querySelector('main').prepend(aviso); }
    aviso.textContent = 'No se pudieron guardar los cambios. Revisá el almacenamiento del navegador e intentá de nuevo.';
}
function guardarSeguro(carrito) {
    try { guardarCarrito(carrito); return true; } catch (error) { informarError(error); return false; }
}
async function carritoValido() {
    const productos = await obtenerProductos();
    return leerCarrito().filter((item) => productos.some((p) => p.id === item.id));
}

function actualizarContadorCarrito() {
    const enlaces = document.querySelectorAll('.header__carrito a, .carrito-flotante');
    const cantidad = leerCarrito().reduce((total, articulo) => total + articulo.cantidad, 0);
    enlaces.forEach((enlace) => {
        let contador = enlace.querySelector(".carrito-contador");
        if (!contador) { contador = document.createElement("span"); contador.className = "carrito-contador"; enlace.appendChild(contador); }
        contador.textContent = `(${cantidad})`;
        enlace.setAttribute("aria-label", `Ver carrito de compras: ${cantidad} unidades`);
    });
}

async function iniciarCatalogo() {
    const contenedor = document.querySelector("#catalogo-productos");
    if (!contenedor) return;
    const buscador = document.querySelector("#buscador-productos");
    const filtro = document.querySelector("#filtro-categoria");
    const mensaje = document.querySelector("#mensaje-catalogo");
    try {
        const productos = await obtenerProductos();
        function renderizar() {
            const texto = (buscador?.value || "").trim().toLowerCase();
            const categoria = filtro?.value || "todas";
            const encontrados = productos.filter((producto) => producto.nombre.toLowerCase().includes(texto) || producto.descripcion.toLowerCase().includes(texto))
                .filter((producto) => categoria === "todas" || producto.categoria === categoria);
            contenedor.innerHTML = "";
            encontrados.forEach((producto) => {
                const articulo = document.createElement("article"); articulo.className = "tarjeta";
                const imagen = document.createElement("img"); imagen.src = producto.imagen; imagen.alt = producto.nombre; imagen.width = 300;
                const titulo = document.createElement("h3"); titulo.textContent = producto.nombre;
                const descripcion = document.createElement("p"); descripcion.textContent = producto.descripcion;
                const precio = document.createElement("p"); precio.className = "tarjeta__precio"; precio.textContent = formatoPrecio(producto.precio);
                const enlace = document.createElement("a"); enlace.href = producto.detalle; enlace.textContent = "Ver producto";
                const agregar = document.createElement("button");
                agregar.type = "button";
                agregar.className = "boton agregar-carrito";
                agregar.textContent = "Agregar al carrito";
                agregar.addEventListener("click", () => {
                    const carrito = leerCarrito();
                    const existente = carrito.find((item) => item.id === producto.id);
                    if (existente && existente.cantidad >= 99) {
                        mensaje.textContent = "El límite es 99 unidades por producto.";
                        return;
                    }
                    if (existente) existente.cantidad += 1;
                    else carrito.push({ id: producto.id, cantidad: 1 });
                    if (!guardarSeguro(carrito)) return;
                    actualizarContadorCarrito();
                    mensaje.textContent = producto.nombre + " agregado al carrito.";
                });
                articulo.append(imagen, titulo, descripcion, precio, enlace, agregar);
                contenedor.appendChild(articulo);
            });
            if (mensaje) mensaje.textContent = encontrados.length ? `${encontrados.length} producto(s) encontrado(s).` : "No se encontraron productos con esos criterios.";
        }
        buscador?.addEventListener("input", renderizar); filtro?.addEventListener("change", renderizar);
        document.querySelector(".search__form")?.addEventListener("submit", (evento) => evento.preventDefault());
        const parametro = new URLSearchParams(window.location.search).get("q"); if (parametro && buscador) buscador.value = parametro;
        renderizar();
    } catch (error) { if (mensaje) mensaje.textContent = "No se pudo cargar el catálogo. Abrí el proyecto mediante un servidor local."; console.error(error); }
}

function iniciarCarrito() {
    const contenedor = document.querySelector(".carrito__articulos");
    if (!contenedor) return;
    const resumen = document.querySelector(".carrito__resumen");
    const seccion = document.querySelector(".carrito");
    async function renderizarCarrito() {
        let productos = [];
        try { productos = await obtenerProductos(); } catch (error) { contenedor.textContent = "No se pudo cargar el carrito. Recargá la página para reintentar."; console.error(error); return; }
        const carrito = await carritoValido(); contenedor.innerHTML = "";
        document.querySelector("#continuar-compra").hidden = !carrito.length;
        if (!carrito.length) { contenedor.textContent = "El carrito está vacío. Podés agregar productos desde el catálogo."; }
        let subtotal = 0;
        carrito.forEach((item) => {
            const producto = productos.find((p) => p.id === item.id); if (!producto) return;
            const importe = producto.precio * item.cantidad; subtotal += importe;
            const articulo = document.createElement("article"); articulo.className = "carrito__articulo";
            const titulo = document.createElement("h3"); titulo.textContent = producto.nombre;
            const precio = document.createElement("p"); precio.textContent = `Precio unitario: ${formatoPrecio(producto.precio)}`;
            const etiqueta = document.createElement("label"); etiqueta.textContent = "Cantidad "; etiqueta.htmlFor = `cantidad-${producto.id}`;
            const cantidad = document.createElement("input"); cantidad.type = "number"; cantidad.min = "1"; cantidad.max = "99"; cantidad.value = item.cantidad; cantidad.id = etiqueta.htmlFor; cantidad.setAttribute("aria-label", `Cantidad de ${producto.nombre}`);
            cantidad.addEventListener("change", () => { const nueva = Number(cantidad.value); if (!Number.isInteger(nueva) || nueva < 1 || nueva > 99) { cantidad.value = item.cantidad; return; } item.cantidad = nueva; if (!guardarSeguro(carrito)) return; renderizarCarrito(); actualizarContadorCarrito(); });
            const importeTexto = document.createElement("p"); importeTexto.textContent = `Subtotal: ${formatoPrecio(importe)}`;
            const quitar = document.createElement("button"); quitar.type = "button"; quitar.textContent = "Quitar"; quitar.addEventListener("click", () => { if (!guardarSeguro(carrito.filter((otro) => otro.id !== item.id))) return; renderizarCarrito(); actualizarContadorCarrito(); });
            articulo.append(titulo, precio, etiqueta, cantidad, importeTexto, quitar); contenedor.appendChild(articulo);
        });
        let detalle = seccion.querySelector(".resumen-dinamico"); if (!detalle) { detalle = document.createElement("div"); detalle.className = "resumen-dinamico"; seccion.appendChild(detalle); }
        detalle.innerHTML = textoTotales(subtotal);
        if (resumen) resumen.textContent = "Resumen del pedido";
    }
    renderizarCarrito();
}

async function iniciarResumenCompra() {
    const contenedor = document.querySelector("#resumen-compra");
    if (!contenedor) return;
    try {
        const productos = await obtenerProductos();
        const carrito = await carritoValido();
        document.querySelector("#confirmar-pedido").disabled = !carrito.length;
        contenedor.innerHTML = "";
        if (!carrito.length) { contenedor.textContent = "No hay artículos en el carrito. Volvé al catálogo para agregar productos."; return; }
        let subtotal = 0;
        const lista = document.createElement("ul");
        carrito.forEach((item) => {
            const producto = productos.find((p) => p.id === item.id);
            if (!producto) return;
            const importe = producto.precio * item.cantidad; subtotal += importe;
            const linea = document.createElement("li");
            linea.textContent = `${producto.nombre}. Cantidad: ${item.cantidad}. Importe: ${formatoPrecio(importe)}.`;
            lista.appendChild(linea);
        });
        const resumen = document.createElement("div");
        resumen.innerHTML = textoTotales(subtotal);
        contenedor.append(lista, resumen);
    } catch (error) { contenedor.textContent = "No se pudo cargar el resumen. Abrí el sitio desde un servidor local."; console.error(error); }
}

async function iniciarAgregarProducto() {
    const formulario = document.querySelector("#form-agregar-producto");
    if (!formulario) return;
    const estado = document.querySelector('#estado-producto');
    try {
        const productos = await obtenerProductos();
        const id = new URLSearchParams(location.search).get('id') ?? 'cera-carnauba';
        const producto = productos.find((p) => p.id === id);
        if (!producto) { estado.textContent = 'Producto no encontrado. Volvé al catálogo para elegir otro.'; return; }
        document.title = `${producto.nombre} | Chiavetta Detailing`;
        document.querySelector('#nombre-producto').textContent = producto.nombre;
        document.querySelector('#ruta-producto').textContent = producto.nombre;
        document.querySelector('#descripcion-producto').textContent = producto.descripcion;
        document.querySelector('#precio-producto').textContent = formatoPrecio(producto.precio);
        const imagen = document.querySelector('#imagen-producto'); imagen.src = producto.imagen; imagen.alt = producto.nombre;
        document.querySelector('#contenido-producto').hidden = false; estado.hidden = true;
        const campo = formulario.querySelector('#cantidad');
        campo.addEventListener('input', () => campo.setCustomValidity(''));
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const cantidad = Number(campo.value);
            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
                campo.setCustomValidity('Ingresá una cantidad entera entre 1 y 99.'); campo.reportValidity(); return;
            }
            const carrito = leerCarrito().filter((item) => productos.some((p) => p.id === item.id));
            const existente = carrito.find((item) => item.id === id);
            if ((existente?.cantidad || 0) + cantidad > 99) { mostrarMensaje(formulario, 'El límite es 99 unidades por producto, incluyendo las del carrito.', 'error'); return; }
            if (existente) existente.cantidad += cantidad; else carrito.push({ id, cantidad });
            if (!guardarSeguro(carrito)) return;
            actualizarContadorCarrito(); mostrarMensaje(formulario, 'Producto agregado al carrito.');
        });
    } catch (error) { estado.textContent = 'No se pudo cargar el producto. Recargá la página para reintentar.'; console.error(error); }
}

function iniciarFormularios() {
    document.querySelectorAll(".formulario").forEach((formulario) => {
        if (formulario.querySelector("#cantidad")) return;
        formulario.noValidate = true;
        formulario.addEventListener("input", (evento) => evento.target.setCustomValidity?.(""));
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault(); if (!validarFormulario(formulario)) return;
            const pagina = window.location.pathname.split("/").pop();
            if (pagina === "revisar-compra.html") {
                const codigo = formulario.querySelector("#codigo-promo")?.value.trim().toUpperCase();
                promocion = codigo === 'CHIAVETTA10';
                mostrarMensaje(formulario, promocion ? 'Descuento del 10% aplicado al subtotal.' : (codigo ? 'Código inválido. No se aplica descuento.' : 'Ingresá un código promocional.'), promocion ? 'exito' : 'error');
                iniciarResumenCompra(); return;
            }
            const datos = Object.fromEntries(new FormData(formulario).entries());
            try {
                const anteriores = leerJSON('chiavetta-consultas', []);
                const guardadas = Array.isArray(anteriores) ? anteriores : [];
                guardadas.push({ ...datos, origen: pagina, fecha: new Date().toISOString() });
                guardarJSON('chiavetta-consultas', guardadas);
            } catch (error) { informarError(error); return; }
            mostrarMensaje(formulario, "Los datos se validaron y quedaron guardados en este navegador. Esta versión no envía información a un servidor."); formulario.reset();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => { actualizarContadorCarrito(); iniciarCatalogo(); iniciarCarrito(); iniciarResumenCompra(); iniciarAgregarProducto(); iniciarFormularios(); iniciarConfirmacion(); });

function iniciarConfirmacion() {
    const boton = document.querySelector('#confirmar-pedido');
    boton?.addEventListener('click', async () => {
        boton.disabled = true;
        try {
            const productos = await obtenerProductos();
            const carrito = await carritoValido();
            if (!carrito.length) { await iniciarResumenCompra(); return; }
            const subtotal = carrito.reduce((total, item) => total + productos.find((p) => p.id === item.id).precio * item.cantidad, 0);
            const pedido = { numero: `CD-${Date.now()}`, fecha: new Date().toISOString(), articulos: carrito, ...calcularTotales(subtotal, promocion) };
            // Primero guardamos el comprobante local; no hay cobros ni envío a servidores.
            guardarJSON('chiavetta-pedido', pedido, sessionStorage);
            try { guardarCarrito([]); } catch (error) { sessionStorage.removeItem('chiavetta-pedido'); throw error; }
            location.href = 'confirmacion.html';
        } catch (error) { informarError(error); boton.disabled = false; }
    });
    const contenedor = document.querySelector('#confirmacion-pedido');
    if (!contenedor) return;
    const pedido = leerJSON('chiavetta-pedido', null, sessionStorage);
    if (!pedido || typeof pedido.numero !== 'string' || !Number.isFinite(pedido.total) || !Array.isArray(pedido.articulos) || !pedido.articulos.length) return;
    const texto = document.createElement('p');
    texto.textContent = `Pedido de prueba ${pedido.numero}. Total: ${formatoPrecio(pedido.total)}. Guardado en esta sesión. No se realizó ningún pago ni se envió el pedido al negocio.`;
    contenedor.replaceChildren(texto);
}
