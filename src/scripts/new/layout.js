const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

function cerrarMenu() {
  toggle.setAttribute("aria-expanded", "false");
  menu.hidden = true;
  document.body.classList.remove("menu-abierto");
}

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const abrir = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(abrir));
    menu.hidden = !abrir;
    document.body.classList.toggle("menu-abierto", abrir);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      cerrarMenu();
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 1200px)").addEventListener("change", (event) => {
    if (event.matches) cerrarMenu();
  });

  // Los enlaces a secciones de Inicio no recargan la página: cerrar el menú a mano.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) cerrarMenu();
  });
}

// Marca en el menú la sección visible.
const enlacesMenu = [...document.querySelectorAll(".nav__link, .nav-movil__link")].filter((a) => a.pathname === location.pathname);
const enlacesSeccion = enlacesMenu.filter((a) => a.hash && document.getElementById(a.hash.slice(1)));

if (enlacesSeccion.length) {
  const visibles = new Set();

  const marcarActivo = () => {
    const activa = enlacesSeccion.find((a) => visibles.has(a.hash.slice(1)))?.hash;
    enlacesSeccion.forEach((a) => (a.hash === activa ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
  };

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? visibles.add(e.target.id) : visibles.delete(e.target.id)));
      marcarActivo();
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  new Set(enlacesSeccion.map((a) => a.hash.slice(1))).forEach((id) => observador.observe(document.getElementById(id)));
}

if (header) {
  const marcar = () => header.classList.toggle("header--scroll", window.scrollY > 40);
  window.addEventListener("scroll", marcar, { passive: true });
  marcar();
}

// Un enlace a un servicio (/#mudanzas, redirecciones de las URLs antiguas) abre su acordeón.
function abrirDesdeHash() {
  const destino = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (destino instanceof HTMLDetailsElement) destino.open = true;
}
window.addEventListener("hashchange", abrirDesdeHash);
abrirDesdeHash();

// El botón flotante de WhatsApp se oculta donde ya hay un enlace de WhatsApp a la vista (portada y contacto).
const whatsapp = document.querySelector(".whatsapp-flotante");
const ocultanWhatsapp = document.querySelectorAll("[data-oculta-whatsapp]");
if (whatsapp && ocultanWhatsapp.length) {
  const visibles = new Set();
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => (e.intersectionRatio > 0.1 ? visibles.add(e.target) : visibles.delete(e.target)));
      whatsapp.classList.toggle("whatsapp-flotante--oculto", visibles.size > 0);
    },
    // Lo que queda tapado por el header fijo no cuenta; un borde apenas visible tampoco.
    { rootMargin: `-${header?.offsetHeight ?? 0}px 0px 0px 0px`, threshold: [0, 0.1, 0.2] },
  );
  ocultanWhatsapp.forEach((el) => observador.observe(el));
}
