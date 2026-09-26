// Únicos comportamientos del tema original que el sitio realmente usa (antes jQuery + main.js).
const sticky = document.getElementById("masthead-sticky");
const gotoTop = document.querySelector(".goto-top");
const mobileNav = document.getElementById("site-navigator-mobile");
const largeScreen = window.matchMedia("(min-width: 992px)");

function onScroll() {
  const y = window.scrollY;
  sticky.classList.toggle("active", largeScreen.matches && y > 100);
  gotoTop.classList.toggle("active", y > 600);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

mobileNav.querySelector(".navigator-toggle").addEventListener("click", (event) => {
  event.preventDefault();
  mobileNav.classList.toggle("active");
});

gotoTop.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Validación de "SOLICITE SU PRESUPUESTO" / Contáctenos (reemplaza jquery-validate.js del tema original).
// El botón de enviar es un stub: ver TODO(redesign) en los componentes de formulario.
const PHONE_PATTERN = /^[0-9+()\-\s]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showFieldError(field, message) {
  const errorEl = field.closest(".input-wrap, .message-wrap")?.querySelector(".field-error");
  if (errorEl) errorEl.textContent = message;
  field.classList.toggle("invalid", Boolean(message));
}

function validateField(field) {
  const value = field.value.trim();

  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "Este campo es obligatorio.");
    return false;
  }
  if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
    showFieldError(field, "Ingresa un correo electrónico válido.");
    return false;
  }
  if (field.type === "tel" && !PHONE_PATTERN.test(value)) {
    showFieldError(field, "Ingresa un teléfono válido.");
    return false;
  }

  showFieldError(field, "");
  return true;
}

document.querySelectorAll(".js-validate").forEach((form) => {
  const fields = form.querySelectorAll("input, textarea");

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });

  form.querySelector(".js-form-submit")?.addEventListener("click", () => {
    let firstInvalid = null;
    fields.forEach((field) => {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Stub: reemplazar por el envío real a Web3Forms una vez configurado el access key del dueño.
    alert("Formulario válido. El envío todavía no está conectado a un servicio de correo.");
  });
});
