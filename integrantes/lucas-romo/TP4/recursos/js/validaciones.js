// Validaciones y mensajes comunes para los formularios.
export function mostrarMensaje(formulario, texto, tipo = "exito") {
    let mensaje = formulario.querySelector(".mensaje-formulario");
    if (!mensaje) {
        mensaje = document.createElement("p");
        mensaje.className = "mensaje-formulario";
        mensaje.setAttribute("role", "status");
        formulario.appendChild(mensaje);
    }
    mensaje.textContent = texto;
    mensaje.dataset.tipo = tipo;
}

export function validarFormulario(formulario) {
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }
    return true;
}
