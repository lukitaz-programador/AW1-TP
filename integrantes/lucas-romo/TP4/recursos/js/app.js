import { obtenerProductos } from "./datos.js";
import { mostrarMensaje, validarFormulario } from "./validaciones.js";

const formatoPrecio = (precio) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(precio);
const leerCarrito = () => {
    try { return JSON.parse(localStorage.getItem("chiavetta-carrito")) || []; }
    catch (error) { return []; }
};
const guardarCarrito = (carrito) => localStorage.setItem("chiavetta-carrito", JSON.stringify(carrito));

function actualizarContadorCarrito() {
    const enlaces = document.querySelectorAll('.header__carrito a, header > a[href="carrito.html"]');
    const cantidad = leerCarrito().reduce((total, articulo) => total + articulo.cantidad, 0);
    enlaces.forEach((enlace) => {
        let contador = enlace.querySelector(".carrito-contador");
        if (!contador) { contador = document.createElement("span"); contador.className = "carrito-contador"; enlace.appendChild(contador); }
        contador.textContent = `(${cantidad})`;
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
                const enlace = document.createElement("a"); enlace.href = producto.detalle; enlace.textContent = producto.detalle === "producto-detalle.html" ? "Ver producto" : "Consultar por este producto";
                articulo.append(imagen, titulo, descripcion, precio, enlace); contenedor.appendChild(articulo);
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
        try { productos = await obtenerProductos(); } catch (error) { console.error(error); }
        const carrito = leerCarrito(); contenedor.innerHTML = "";
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
            cantidad.addEventListener("change", () => { const nueva = Number(cantidad.value); if (!Number.isInteger(nueva) || nueva < 1 || nueva > 99) { cantidad.value = item.cantidad; return; } item.cantidad = nueva; guardarCarrito(carrito); renderizarCarrito(); actualizarContadorCarrito(); });
            const importeTexto = document.createElement("p"); importeTexto.textContent = `Subtotal: ${formatoPrecio(importe)}`;
            const quitar = document.createElement("button"); quitar.type = "button"; quitar.textContent = "Quitar"; quitar.addEventListener("click", () => { guardarCarrito(carrito.filter((otro) => otro.id !== item.id)); renderizarCarrito(); actualizarContadorCarrito(); });
            articulo.append(titulo, precio, etiqueta, cantidad, importeTexto, quitar); contenedor.appendChild(articulo);
        });
        const impuesto = Math.round(subtotal * 0.085);
        let detalle = seccion.querySelector(".resumen-dinamico"); if (!detalle) { detalle = document.createElement("div"); detalle.className = "resumen-dinamico"; seccion.appendChild(detalle); }
        detalle.innerHTML = `<p>Subtotal: ${formatoPrecio(subtotal)}</p><p>Impuesto estimado (8,5%): ${formatoPrecio(impuesto)}</p><p><strong>Total: ${formatoPrecio(subtotal + impuesto)}</strong></p>`;
        if (resumen) resumen.textContent = "Resumen del pedido";
    }
    renderizarCarrito();
}

async function iniciarResumenCompra() {
    const contenedor = document.querySelector("#resumen-compra");
    if (!contenedor) return;
    try {
        const productos = await obtenerProductos();
        const carrito = leerCarrito();
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
        const impuesto = Math.round(subtotal * 0.085);
        const resumen = document.createElement("div");
        resumen.innerHTML = `<p>Subtotal: ${formatoPrecio(subtotal)}</p><p>Impuesto estimado (8,5%): ${formatoPrecio(impuesto)}</p><p><strong>Total: ${formatoPrecio(subtotal + impuesto)}</strong></p>`;
        contenedor.append(lista, resumen);
    } catch (error) { contenedor.textContent = "No se pudo cargar el resumen. Abrí el sitio desde un servidor local."; console.error(error); }
}

function iniciarAgregarProducto() {
    const formulario = document.querySelector("#form-agregar-producto") || (document.querySelector("#cantidad")?.closest("form"));
    if (!formulario || !document.querySelector("#cantidad")) return;
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault(); const cantidad = Number(document.querySelector("#cantidad").value);
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) { document.querySelector("#cantidad").setCustomValidity("Ingresá una cantidad entre 1 y 99."); document.querySelector("#cantidad").reportValidity(); return; }
        document.querySelector("#cantidad").setCustomValidity(""); const carrito = leerCarrito(); const existente = carrito.find((item) => item.id === "cera-carnauba");
        if (existente) existente.cantidad += cantidad; else carrito.push({ id: "cera-carnauba", cantidad }); guardarCarrito(carrito); actualizarContadorCarrito();
        mostrarMensaje(formulario, "Producto agregado al carrito.");
    });
}

function iniciarFormularios() {
    document.querySelectorAll(".formulario").forEach((formulario) => {
        if (formulario.querySelector("#cantidad")) return;
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault(); if (!validarFormulario(formulario)) return;
            const pagina = window.location.pathname.split("/").pop();
            if (pagina === "revisar-compra.html") {
                const codigo = formulario.querySelector("#codigo-promo")?.value.trim().toUpperCase();
                mostrarMensaje(formulario, codigo === "CHIAVETTA10" ? "Código válido: se aplicaría un descuento del 10% en un sistema con pagos integrado." : (codigo ? "El código ingresado no es válido. Probá con CHIAVETTA10." : "Ingresá un código promocional."), codigo === "CHIAVETTA10" ? "exito" : "error"); return;
            }
            const datos = Object.fromEntries(new FormData(formulario).entries());
            const guardadas = JSON.parse(localStorage.getItem("chiavetta-consultas") || "[]"); guardadas.push({ ...datos, fecha: new Date().toISOString() }); localStorage.setItem("chiavetta-consultas", JSON.stringify(guardadas));
            mostrarMensaje(formulario, "Los datos se validaron y quedaron guardados en este navegador. Esta versión no envía información a un servidor."); formulario.reset();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => { actualizarContadorCarrito(); iniciarCatalogo(); iniciarCarrito(); iniciarResumenCompra(); iniciarAgregarProducto(); iniciarFormularios(); });
