export const formatoPrecio = (precio) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
}).format(precio);

export function leerJSON(clave, respaldo, almacenamiento = localStorage) {
    try {
        return JSON.parse(almacenamiento.getItem(clave)) ?? respaldo;
    } catch {
        return respaldo;
    }
}

export function guardarJSON(clave, valor, almacenamiento = localStorage) {
    almacenamiento.setItem(clave, JSON.stringify(valor));
}

export function leerCarrito(almacenamiento = localStorage) {
    const datos = leerJSON("chiavetta-carrito", [], almacenamiento);
    const articulos = [];

    if (!Array.isArray(datos)) return articulos;
    for (const item of datos) {
        if (!item || typeof item.id !== "string" || !Number.isInteger(item.cantidad) || item.cantidad < 1) continue;

        const existente = articulos.find((articulo) => articulo.id === item.id);
        if (existente) existente.cantidad = Math.min(99, existente.cantidad + item.cantidad);
        else articulos.push({ id: item.id, cantidad: Math.min(99, item.cantidad) });
    }
    return articulos;
}

export function guardarCarrito(carrito, almacenamiento = localStorage) {
    guardarJSON("chiavetta-carrito", carrito, almacenamiento);
}

export function calcularTotales(subtotal, promocion = false) {
    const descuento = promocion ? Math.round(subtotal * 0.1) : 0;
    // Tasa heredada del TP, solo para la simulación; no representa impuestos reales.
    const impuesto = Math.round((subtotal - descuento) * 0.085);
    return { subtotal, descuento, impuesto, total: subtotal - descuento + impuesto };
}

export function informarError(error) {
    console.error(error);
    let aviso = document.querySelector("#error-aplicacion");
    if (!aviso) {
        aviso = document.createElement("p");
        aviso.id = "error-aplicacion";
        aviso.setAttribute("role", "alert");
        document.querySelector("main").prepend(aviso);
    }
    aviso.textContent = "No se pudieron guardar los cambios. Revisá el almacenamiento del navegador e intentá de nuevo.";
}

export function guardarSeguro(carrito) {
    try {
        guardarCarrito(carrito);
        return true;
    } catch (error) {
        informarError(error);
        return false;
    }
}

export function carritoValido(productos, carrito = leerCarrito()) {
    return carrito.filter((item) => productos.some((producto) => producto.id === item.id));
}
