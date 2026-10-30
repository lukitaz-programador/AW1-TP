// Validaciones y mensajes comunes para los formularios.
function mostrarMensaje(formulario, texto, tipo = "exito") {
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

function validarFormulario(formulario) {
    for (const campo of formulario.querySelectorAll('input, textarea')) {
        campo.setCustomValidity('');
        if (['text', 'email', 'tel', 'textarea'].includes(campo.type)) {
            campo.value = campo.value.trim();
            if (campo.value && campo.minLength > 0 && campo.value.length < campo.minLength) campo.setCustomValidity(`Ingresá al menos ${campo.minLength} caracteres.`);
        }
        if (campo.type === 'tel' && campo.value && !/^[+()0-9 \-]+$/.test(campo.value)) campo.setCustomValidity('Ingresá un teléfono válido.');
        if (campo.type === 'tel' && campo.value && (campo.value.match(/\d/g) || []).length < 8) campo.setCustomValidity('Ingresá al menos 8 dígitos.');
        if (campo.id === 'consig-contacto' && campo.value && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value) || (/^[+()0-9 \-]+$/.test(campo.value) && (campo.value.match(/\d/g) || []).length >= 8))) campo.setCustomValidity('Ingresá un email o teléfono válido.');
    }
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }
    return true;
}
