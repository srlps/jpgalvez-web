const PATRON_TELEFONO = /^[0-9+()\-\s]{6,20}$/;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mostrarError(campo, mensaje) {
  const error = campo.closest(".campo")?.querySelector(".campo__error");
  if (error) error.textContent = mensaje;
  campo.classList.toggle("invalido", Boolean(mensaje));
  campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
}

function validar(campo) {
  const valor = campo.value.trim();

  if (campo.required && !valor) {
    mostrarError(campo, "Este campo es obligatorio.");
    return false;
  }
  if (campo.type === "email" && !PATRON_EMAIL.test(valor)) {
    mostrarError(campo, "Ingrese un correo electrónico válido.");
    return false;
  }
  if (campo.type === "tel" && !PATRON_TELEFONO.test(valor)) {
    mostrarError(campo, "Ingrese un teléfono válido.");
    return false;
  }

  mostrarError(campo, "");
  return true;
}

document.querySelectorAll("form.js-validar").forEach((form) => {
  const campos = form.querySelectorAll(".campo input, .campo select, .campo textarea");
  const estado = form.querySelector(".form__estado");

  campos.forEach((campo) => {
    campo.addEventListener("blur", () => validar(campo));
    campo.addEventListener("input", () => {
      if (campo.classList.contains("invalido")) validar(campo);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Honeypot relleno: simular éxito sin enviar para no dar pistas al bot.
    if (form.elements.sitio_web?.value || form.elements.botcheck?.checked) {
      estado.textContent = "Gracias, hemos recibido su solicitud.";
      return;
    }

    let primerInvalido = null;
    campos.forEach((campo) => {
      if (!validar(campo) && !primerInvalido) primerInvalido = campo;
    });

    if (primerInvalido) {
      primerInvalido.focus();
      return;
    }

    // Stub: reemplazar por el POST a Web3Forms cuando el dueño entregue el access key.
    estado.textContent = "Formulario válido. El envío todavía no está conectado a un servicio de correo.";
  });
});
