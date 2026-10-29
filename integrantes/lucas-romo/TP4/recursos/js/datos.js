// Funciones para obtener los datos del catálogo desde el archivo JSON.
export async function obtenerProductos() {
    const respuesta = await fetch("recursos/productos.json");
    if (!respuesta.ok) {
        throw new Error("No se pudo cargar el catálogo de productos.");
    }
    return await respuesta.json();
}
