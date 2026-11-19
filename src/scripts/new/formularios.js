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

  if (campo.type === "checkbox") {
    const ok = !campo.required || campo.checked;
    mostrarError(campo, ok ? "" : "Debe aceptar la política de privacidad para enviar su solicitud.");
    return ok;
  }
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

    enviar(form, estado);
  });
});

async function enviar(form, estado) {
  const boton = form.querySelector('button[type="submit"]');
  const datos = Object.fromEntries(new FormData(form));
  // El honeypot propio no debe llegar al correo; "botcheck" sí, porque Web3Forms lo revisa.
  delete datos.sitio_web;
  datos.acepta_politica = "Sí";

  boton.disabled = true;
  estado.classList.remove("form__estado--error");
  estado.textContent = "Enviando su solicitud…";

  try {
    const respuesta = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || !resultado.success) throw new Error(resultado.message || `HTTP ${respuesta.status}`);

    form.reset();
    estado.textContent = "Gracias, hemos recibido su solicitud. Le responderemos a la brevedad.";
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    estado.classList.add("form__estado--error");
    estado.textContent = "No pudimos enviar su solicitud. Inténtelo nuevamente o escríbanos por WhatsApp.";
  } finally {
    boton.disabled = false;
  }
}
