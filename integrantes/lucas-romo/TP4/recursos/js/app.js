import { obtenerProductos } from "./datos.js";
import { mostrarMensaje, validarFormulario } from "./validaciones.js";
import {
    calcularTotales,
    carritoValido,
    formatoPrecio,
    guardarCarrito,
    guardarJSON,
    guardarSeguro,
    informarError,
    leerCarrito,
    leerJSON
} from "./utilidades.js";
import {
    actualizarContadorCarrito as mostrarContadorCarrito,
    crearArticuloCarrito,
    crearTarjetaProducto,
    renderizarTotales
} from "./vista/renderizado.js";

function actualizarContadorCarrito() {
    const enlaces = document.querySelectorAll(".header__carrito a, .carrito-flotante");
    const cantidad = leerCarrito().reduce((total, articulo) => total + articulo.cantidad, 0);
    mostrarContadorCarrito(enlaces, cantidad);
}

async function iniciarCatalogo() {
    const contenedor = document.querySelector("#catalogo-productos");
    if (!contenedor) return;

    const buscador = document.querySelector("#buscador-productos");
    const filtro = document.querySelector("#filtro-categoria");
    const mensaje = document.querySelector("#mensaje-catalogo");

    try {
        const productos = await obtenerProductos();
        const agregarProducto = (producto) => {
            const carrito = leerCarrito();
            const existente = carrito.find((item) => item.id === producto.id);

            if (existente && existente.cantidad >= 99) {
                if (mensaje) mensaje.textContent = "El límite es 99 unidades por producto.";
                return;
            }
            if (existente) existente.cantidad += 1;
            else carrito.push({ id: producto.id, cantidad: 1 });
            if (!guardarSeguro(carrito)) return;

            actualizarContadorCarrito();
            if (mensaje) mensaje.textContent = `${producto.nombre} agregado al carrito.`;
        };

        const renderizar = () => {
            const texto = (buscador?.value || "").trim().toLowerCase();
            const categoria = filtro?.value || "todas";
            const encontrados = productos
                .filter((producto) => producto.nombre.toLowerCase().includes(texto) || producto.descripcion.toLowerCase().includes(texto))
                .filter((producto) => categoria === "todas" || producto.categoria === categoria);

            contenedor.replaceChildren();
            encontrados.forEach((producto) => {
                const tarjeta = crearTarjetaProducto(producto, formatoPrecio(producto.precio), agregarProducto);
                contenedor.appendChild(tarjeta);
            });
            if (mensaje) {
                mensaje.textContent = encontrados.length
                    ? `${encontrados.length} producto(s) encontrado(s).`
                    : "No se encontraron productos con esos criterios.";
            }
        };

        buscador?.addEventListener("input", renderizar);
        filtro?.addEventListener("change", renderizar);
        document.querySelector(".search__form")?.addEventListener("submit", (evento) => evento.preventDefault());

        const parametro = new URLSearchParams(window.location.search).get("q");
        if (parametro && buscador) buscador.value = parametro;
        renderizar();
    } catch (error) {
        if (mensaje) mensaje.textContent = "No se pudo cargar el catálogo. Abrí el proyecto mediante un servidor local.";
        console.error(error);
    }
}

function iniciarCarrito() {
    const contenedor = document.querySelector(".carrito__articulos");
    if (!contenedor) return;

    const seccion = document.querySelector(".carrito");
    const resumen = document.querySelector(".carrito__resumen");

    const renderizarCarrito = async () => {
        let productos = [];
        let detalle = seccion.querySelector(".resumen-dinamico");
        try {
            productos = await obtenerProductos();
        } catch (error) {
            contenedor.textContent = "No se pudo cargar el carrito. Recargá la página para reintentar.";
            console.error(error);
            return;
        }

        const carrito = await carritoValido(productos);
        contenedor.replaceChildren();
        document.querySelector("#continuar-compra").hidden = !carrito.length;
        if (!carrito.length) {
            contenedor.textContent = "El carrito está vacío. Podés agregar productos desde el catálogo.";
        }

        const subtotal = carrito.reduce((total, item) => {
            const producto = productos.find((elemento) => elemento.id === item.id);
            return total + producto.precio * item.cantidad;
        }, 0);

        carrito.forEach((item) => {
            const producto = productos.find((elemento) => elemento.id === item.id);
            const importe = producto.precio * item.cantidad;
            const articulo = crearArticuloCarrito(
                producto,
                item,
                formatoPrecio(producto.precio),
                formatoPrecio(importe),
                (articuloCarrito, campoCantidad) => {
                    const nuevaCantidad = Number(campoCantidad.value);
                    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1 || nuevaCantidad > 99) {
                        campoCantidad.value = articuloCarrito.cantidad;
                        return;
                    }
                    articuloCarrito.cantidad = nuevaCantidad;
                    if (!guardarSeguro(carrito)) return;
                    renderizarCarrito();
                    actualizarContadorCarrito();
                },
                (articuloCarrito) => {
                    const carritoActualizado = carrito.filter((otro) => otro.id !== articuloCarrito.id);
                    if (!guardarSeguro(carritoActualizado)) return;
                    renderizarCarrito();
                    actualizarContadorCarrito();
                }
            );
            contenedor.appendChild(articulo);
        });

        if (!detalle) {
            detalle = document.createElement("div");
            detalle.className = "resumen-dinamico";
            seccion.appendChild(detalle);
        }
        renderizarTotales(detalle, calcularTotales(subtotal), formatoPrecio);
        if (resumen) resumen.textContent = "Resumen del pedido";
    };

    renderizarCarrito();
}

async function iniciarResumenCompra(promocion = false) {
    const contenedor = document.querySelector("#resumen-compra");
    if (!contenedor) return;

    try {
        const productos = await obtenerProductos();
        const carrito = await carritoValido(productos);
        const botonConfirmar = document.querySelector("#confirmar-pedido");
        if (botonConfirmar) botonConfirmar.disabled = !carrito.length;

        contenedor.replaceChildren();
        if (!carrito.length) {
            contenedor.textContent = "No hay artículos en el carrito. Volvé al catálogo para agregar productos.";
            return;
        }

        const lista = document.createElement("ul");
        const subtotal = carrito.reduce((total, item) => {
            const producto = productos.find((elemento) => elemento.id === item.id);
            const importe = producto.precio * item.cantidad;
            const linea = document.createElement("li");
            linea.textContent = `${producto.nombre}. Cantidad: ${item.cantidad}. Importe: ${formatoPrecio(importe)}.`;
            lista.appendChild(linea);
            return total + importe;
        }, 0);

        const resumen = document.createElement("div");
        renderizarTotales(resumen, calcularTotales(subtotal, promocion), formatoPrecio);
        contenedor.append(lista, resumen);
    } catch (error) {
        contenedor.textContent = "No se pudo cargar el resumen. Abrí el sitio desde un servidor local.";
        console.error(error);
    }
}

async function iniciarAgregarProducto() {
    const formulario = document.querySelector("#form-agregar-producto");
    if (!formulario) return;

    const estado = document.querySelector("#estado-producto");
    try {
        const productos = await obtenerProductos();
        const id = new URLSearchParams(location.search).get("id") ?? "cera-carnauba";
        const producto = productos.find((item) => item.id === id);
        if (!producto) {
            estado.textContent = "Producto no encontrado. Volvé al catálogo para elegir otro.";
            return;
        }

        document.title = `${producto.nombre} | Chiavetta Detailing`;
        document.querySelector("#nombre-producto").textContent = producto.nombre;
        document.querySelector("#ruta-producto").textContent = producto.nombre;
        document.querySelector("#descripcion-producto").textContent = producto.descripcion;
        document.querySelector("#precio-producto").textContent = formatoPrecio(producto.precio);

        const imagen = document.querySelector("#imagen-producto");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        document.querySelector("#contenido-producto").hidden = false;
        estado.hidden = true;

        const campo = formulario.querySelector("#cantidad");
        campo.addEventListener("input", () => campo.setCustomValidity(""));
        formulario.addEventListener("submit", (evento) => {
            const cantidad = Number(campo.value);
            evento.preventDefault();
            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
                campo.setCustomValidity("Ingresá una cantidad entera entre 1 y 99.");
                campo.reportValidity();
                return;
            }

            const carrito = leerCarrito().filter((item) => productos.some((elemento) => elemento.id === item.id));
            const existente = carrito.find((item) => item.id === id);
            if ((existente?.cantidad || 0) + cantidad > 99) {
                mostrarMensaje(formulario, "El límite es 99 unidades por producto, incluyendo las del carrito.", "error");
                return;
            }
            if (existente) existente.cantidad += cantidad;
            else carrito.push({ id, cantidad });
            if (!guardarSeguro(carrito)) return;

            actualizarContadorCarrito();
            mostrarMensaje(formulario, "Producto agregado al carrito.");
        });
    } catch (error) {
        estado.textContent = "No se pudo cargar el producto. Recargá la página para reintentar.";
        console.error(error);
    }
}

function iniciarFormularios(alCambiarPromocion) {
    document.querySelectorAll(".formulario").forEach((formulario) => {
        if (formulario.querySelector("#cantidad")) return;

        formulario.noValidate = true;
        formulario.addEventListener("input", (evento) => evento.target.setCustomValidity?.(""));
        formulario.addEventListener("submit", (evento) => {
            const pagina = window.location.pathname.split("/").pop();
            evento.preventDefault();
            if (!validarFormulario(formulario)) return;

            if (pagina === "revisar-compra.html") {
                const codigo = formulario.querySelector("#codigo-promo")?.value.trim().toUpperCase();
                const promocion = codigo === "CHIAVETTA10";
                alCambiarPromocion(promocion);
                mostrarMensaje(
                    formulario,
                    promocion
                        ? "Descuento del 10% aplicado al subtotal."
                        : (codigo ? "Código inválido. No se aplica descuento." : "Ingresá un código promocional."),
                    promocion ? "exito" : "error"
                );
                return;
            }

            const datos = Object.fromEntries(new FormData(formulario).entries());
            try {
                const anteriores = leerJSON("chiavetta-consultas", []);
                const guardadas = Array.isArray(anteriores) ? anteriores : [];
                guardadas.push({ ...datos, origen: pagina, fecha: new Date().toISOString() });
                guardarJSON("chiavetta-consultas", guardadas);
            } catch (error) {
                informarError(error);
                return;
            }
            mostrarMensaje(formulario, "Los datos se validaron y quedaron guardados en este navegador. Esta versión no envía información a un servidor.");
            formulario.reset();
        });
    });
}

function iniciarConfirmacion(obtenerPromocion) {
    const boton = document.querySelector("#confirmar-pedido");
    const contenedor = document.querySelector("#confirmacion-pedido");
    boton?.addEventListener("click", async () => {
        boton.disabled = true;
        try {
            const productos = await obtenerProductos();
            const carrito = await carritoValido(productos);
            if (!carrito.length) {
                await iniciarResumenCompra(obtenerPromocion());
                return;
            }

            const subtotal = carrito.reduce((total, item) => {
                const producto = productos.find((elemento) => elemento.id === item.id);
                return total + producto.precio * item.cantidad;
            }, 0);
            const pedido = {
                numero: `CD-${Date.now()}`,
                fecha: new Date().toISOString(),
                articulos: carrito,
                ...calcularTotales(subtotal, obtenerPromocion())
            };

            // Primero guardamos el comprobante local; no hay cobros ni envío a servidores.
            guardarJSON("chiavetta-pedido", pedido, sessionStorage);
            try {
                guardarCarrito([]);
            } catch (error) {
                sessionStorage.removeItem("chiavetta-pedido");
                throw error;
            }
            location.href = "confirmacion.html";
        } catch (error) {
            informarError(error);
            boton.disabled = false;
        }
    });

    if (!contenedor) return;

    const pedido = leerJSON("chiavetta-pedido", null, sessionStorage);
    if (!pedido || typeof pedido.numero !== "string" || !Number.isFinite(pedido.total) || !Array.isArray(pedido.articulos) || !pedido.articulos.length) return;

    const texto = document.createElement("p");
    texto.textContent = `Pedido de prueba ${pedido.numero}. Total: ${formatoPrecio(pedido.total)}. Guardado en esta sesión. No se realizó ningún pago ni se envió el pedido al negocio.`;
    contenedor.replaceChildren(texto);
}

document.addEventListener("DOMContentLoaded", () => {
    let promocion = false;
    actualizarContadorCarrito();
    iniciarCatalogo();
    iniciarCarrito();
    iniciarResumenCompra();
    iniciarAgregarProducto();
    iniciarFormularios((aplicada) => {
        promocion = aplicada;
        iniciarResumenCompra(promocion);
    });
    iniciarConfirmacion(() => promocion);
});
