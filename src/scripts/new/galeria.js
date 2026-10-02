// Filtros por categoría y visor (lightbox) de la galería. Funciona sobre los ítems que pinta publico.js.
document.querySelectorAll("[data-galeria]").forEach((bloque) => {
  const lista = bloque.querySelector('[data-fs="galeria"]');
  const dialogo = bloque.querySelector("[data-lightbox]");
  const imagen = dialogo.querySelector("[data-lightbox-img]");
  const leyenda = dialogo.querySelector("[data-lightbox-caption]");
  const filtros = [...bloque.querySelectorAll("[data-filtro]")];
  let visibles = [];
  let indice = 0;

  const botonesVisibles = () => [...lista.querySelectorAll(".galeria__item:not([hidden]) .galeria__boton")];

  function mostrar(i) {
    indice = (i + visibles.length) % visibles.length;
    const boton = visibles[indice];
    imagen.src = boton.dataset.src;
    imagen.alt = boton.dataset.titulo;
    const titulo = document.createElement("strong");
    titulo.textContent = boton.dataset.titulo;
    leyenda.replaceChildren(titulo);
    if (boton.dataset.descripcion) leyenda.append(document.createElement("br"), boton.dataset.descripcion);
  }

  lista.addEventListener("click", (event) => {
    const boton = event.target.closest(".galeria__boton");
    if (!boton) return;
    visibles = botonesVisibles();
    mostrar(visibles.indexOf(boton));
    dialogo.showModal();
  });

  dialogo.querySelector("[data-lightbox-prev]").addEventListener("click", () => mostrar(indice - 1));
  dialogo.querySelector("[data-lightbox-next]").addEventListener("click", () => mostrar(indice + 1));
  dialogo.querySelector("[data-lightbox-cerrar]").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("click", (event) => {
    if (event.target === dialogo) dialogo.close();
  });
  dialogo.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") mostrar(indice - 1);
    if (event.key === "ArrowRight") mostrar(indice + 1);
  });

  const porPagina = Number(lista.dataset.porPagina) || 6;
  const contenedorFiltros = bloque.querySelector(".filtros");
  const verMas = bloque.querySelector("[data-galeria-mas]");
  let mostrarHasta = porPagina;

  // Filtra por categoría y pagina de a `porPagina` fotos (botón "Ver más fotos").
  function aplicarFiltro() {
    const activo = filtros.find((f) => f.getAttribute("aria-pressed") === "true")?.dataset.filtro ?? "";
    let coincidencias = 0;
    lista.querySelectorAll(".galeria__item").forEach((item) => {
      const coincide = !activo || item.dataset.categoria === activo;
      item.hidden = !coincide || coincidencias >= mostrarHasta;
      if (coincide) coincidencias++;
    });
    verMas.hidden = coincidencias <= mostrarHasta;
  }

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      filtros.forEach((f) => f.setAttribute("aria-pressed", String(f === filtro)));
      mostrarHasta = porPagina;
      aplicarFiltro();
    });
  });

  verMas.querySelector("button").addEventListener("click", () => {
    mostrarHasta += porPagina;
    aplicarFiltro();
  });

  document.addEventListener("fs:galeria", () => {
    const items = [...lista.querySelectorAll(".galeria__item")];
    contenedorFiltros.hidden = items.length === 0;
    filtros.forEach((f) => {
      if (f.dataset.filtro) f.hidden = !items.some((item) => item.dataset.categoria === f.dataset.filtro);
    });
    aplicarFiltro();
  });
});
