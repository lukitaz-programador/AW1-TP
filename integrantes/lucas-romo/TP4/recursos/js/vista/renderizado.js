export function actualizarContadorCarrito(enlaces, cantidad) {
    enlaces.forEach((enlace) => {
        let contador = enlace.querySelector(".carrito-contador");
        if (!contador) {
            contador = document.createElement("span");
            contador.className = "carrito-contador";
            enlace.appendChild(contador);
        }
        contador.textContent = `(${cantidad})`;
        enlace.setAttribute("aria-label", `Ver carrito de compras: ${cantidad} unidades`);
    });
}

export function crearTarjetaProducto(producto, precio, alAgregar) {
    const articulo = document.createElement("article");
    articulo.className = "tarjeta";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.width = 300;

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = producto.descripcion;

    const precioProducto = document.createElement("p");
    precioProducto.className = "tarjeta__precio";
    precioProducto.textContent = precio;

    const enlace = document.createElement("a");
    enlace.href = producto.detalle;
    enlace.textContent = "Ver producto";

    const agregar = document.createElement("button");
    agregar.type = "button";
    agregar.className = "boton agregar-carrito";
    agregar.textContent = "Agregar al carrito";
    agregar.addEventListener("click", () => alAgregar(producto));

    articulo.append(imagen, titulo, descripcion, precioProducto, enlace, agregar);
    return articulo;
}

export function crearArticuloCarrito(producto, item, precio, importe, alCambiarCantidad, alQuitar) {
    const articulo = document.createElement("article");
    articulo.className = "carrito__articulo";

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precioUnitario = document.createElement("p");
    precioUnitario.textContent = `Precio unitario: ${precio}`;

    const etiqueta = document.createElement("label");
    etiqueta.textContent = "Cantidad ";
    etiqueta.htmlFor = `cantidad-${producto.id}`;

    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.min = "1";
    cantidad.max = "99";
    cantidad.value = item.cantidad;
    cantidad.id = etiqueta.htmlFor;
    cantidad.setAttribute("aria-label", `Cantidad de ${producto.nombre}`);
    cantidad.addEventListener("change", () => alCambiarCantidad(item, cantidad));

    const textoImporte = document.createElement("p");
    textoImporte.textContent = `Subtotal: ${importe}`;

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", () => alQuitar(item));

    articulo.append(titulo, precioUnitario, etiqueta, cantidad, textoImporte, quitar);
    return articulo;
}

export function renderizarTotales(contenedor, totales, formatoPrecio) {
    const conceptos = [
        ["Subtotal", totales.subtotal],
        ["Descuento", totales.descuento],
        ["Impuesto de ejemplo (8,5%)", totales.impuesto]
    ];

    contenedor.replaceChildren();
    conceptos.forEach(([etiqueta, importe]) => {
        const linea = document.createElement("p");
        linea.textContent = `${etiqueta}: ${formatoPrecio(importe)}`;
        contenedor.appendChild(linea);
    });

    const total = document.createElement("p");
    const importeTotal = document.createElement("strong");
    importeTotal.textContent = `Total: ${formatoPrecio(totales.total)}`;
    total.appendChild(importeTotal);
    contenedor.appendChild(total);
}
