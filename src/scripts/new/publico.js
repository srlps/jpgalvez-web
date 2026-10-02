// Carga clientes, testimonios y galería publicados en Firestore (no hay semilla estática: si
// Firebase no está configurado, estas secciones quedan vacías).
// Todo se construye con textContent/atributos (nunca innerHTML): el contenido viene de la consola admin.
import { firebaseConfigurado, esUrlImagenSegura } from "./firebase-config.js";

const todos = (selector) => [...document.querySelectorAll(selector)];

function el(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto != null) nodo.textContent = texto;
  return nodo;
}

function renderTestimonio(t, cliente) {
  const li = el("li", "testimonio");
  const figura = el("figure");
  const cita = el("blockquote", "testimonio__texto");
  cita.append(el("p", null, t.texto));
  const pie = el("figcaption", "testimonio__autor");
  // Una persona natural no tiene "empresa": su nombre ya figura como autor del testimonio.
  const empresaDe = cliente?.tipo === "persona" ? undefined : cliente;
  if (empresaDe && esUrlImagenSegura(empresaDe.logoUrl)) {
    const logo = el("img", "testimonio__logo");
    Object.assign(logo, { src: empresaDe.logoUrl, alt: "", width: 64, height: 64, loading: "lazy" });
    pie.append(logo);
  }
  const datos = el("span");
  datos.append(el("strong", "testimonio__nombre", t.autor), el("span", "testimonio__cargo", [t.cargo, empresaDe?.nombre].filter(Boolean).join(", ")));
  pie.append(datos);
  figura.append(cita, pie);
  li.append(figura);
  return li;
}

function renderItemCinta(cliente, duplicado) {
  const li = el("li", "cinta__item");
  if (esUrlImagenSegura(cliente.logoUrl)) {
    li.classList.add("cinta__item--logo");
    const logo = el("img");
    Object.assign(logo, { src: cliente.logoUrl, alt: duplicado ? "" : cliente.nombre, height: 56, loading: "lazy" });
    li.append(logo);
  } else {
    li.textContent = cliente.nombre;
  }
  return li;
}

function renderItemGaleria(foto) {
  const li = el("li", "galeria__item");
  li.dataset.categoria = foto.categoria;
  const boton = el("button", "galeria__boton");
  boton.type = "button";
  Object.assign(boton.dataset, { src: foto.url, titulo: foto.titulo, descripcion: foto.descripcion ?? "" });
  const img = el("img");
  Object.assign(img, { src: foto.url, alt: foto.titulo, width: foto.ancho, height: foto.alto, loading: "lazy", decoding: "async" });
  boton.append(img, el("span", "galeria__titulo", foto.titulo));
  li.append(boton);
  return li;
}

function pintarCinta(cinta, clientes) {
  // Repetir hasta llenar la pista para que la animación no quede con huecos.
  let items = clientes;
  while (items.length < 12) items = items.concat(clientes);
  cinta.querySelectorAll(".cinta__pista").forEach((pista, i) => {
    pista.replaceChildren(...items.map((c) => renderItemCinta(c, i > 0)));
  });
}

function pintarGalerias(galerias, fotos) {
  galerias.forEach((lista) => {
    const limite = Number(lista.dataset.limite) || fotos.length;
    const bloque = lista.closest("[data-galeria]");
    lista.replaceChildren(...fotos.slice(0, limite).map(renderItemGaleria));
    lista.setAttribute("aria-busy", "false");
    bloque?.querySelector("[data-galeria-vacio]")?.toggleAttribute("hidden", fotos.length > 0);
  });
  document.dispatchEvent(new CustomEvent("fs:galeria"));
}

async function iniciar() {
  const testimonios = todos('[data-fs="testimonios"]');
  const cintas = todos('[data-fs="clientes-cinta"]');
  const totales = todos('[data-fs="clientes-total"]');
  const galerias = todos('[data-fs="galeria"]');

  if (!firebaseConfigurado) {
    galerias.forEach((lista) => lista.setAttribute("aria-busy", "false"));
    return;
  }

  galerias.forEach((lista) => lista.closest("[data-galeria]")?.querySelector("[data-galeria-vacio]")?.setAttribute("hidden", ""));

  const [{ db }, { collection, query, where, orderBy, limit, getDocs, getCount, getDoc, doc }] = await Promise.all([
    import("./firebase-app.js"),
    import("firebase/firestore/lite"),
  ]);

  // Las reglas solo permiten al público leer documentos con publicado == true: el filtro es obligatorio.
  const publicados = (coleccion, ...extra) => query(collection(db, coleccion), where("publicado", "==", true), ...extra);
  const datos = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Los documentos antiguos no tienen `tipo` (Firestore no los devuelve con where("tipo", "!=", ...)): se filtra aquí.
  const empresas = (clientes) => clientes.filter((c) => c.tipo !== "persona");
  const pintarTotal = (n) => n > 0 && totales.forEach((t) => (t.textContent = String(n)));
  const tareas = [];

  if (testimonios.length) {
    tareas.push(
      getDocs(publicados("testimonios", orderBy("orden"))).then(async (snap) => {
        const items = datos(snap);
        if (!items.length) return;
        // El nombre y el logo de la empresa vienen del cliente enlazado, no del propio testimonio.
        const clientesPorId = new Map();
        await Promise.all(
          [...new Set(items.map((t) => t.clienteId).filter(Boolean))].map((id) =>
            getDoc(doc(db, "clientes", id))
              .then((snap) => snap.exists() && clientesPorId.set(id, { id: snap.id, ...snap.data() }))
              .catch(() => {}),
          ),
        );
        testimonios.forEach((lista) => {
          const limite = Number(lista.dataset.limite) || items.length;
          lista.replaceChildren(...items.slice(0, limite).map((t) => renderTestimonio(t, clientesPorId.get(t.clienteId))));
        });
      }),
    );
  }

  if (cintas.length) {
    tareas.push(
      getDocs(publicados("clientes", where("destacado", "==", true))).then((snap) => {
        const destacados = empresas(datos(snap)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        if (destacados.length) cintas.forEach((cinta) => pintarCinta(cinta, destacados));
      }),
    );
  }

  if (totales.length) {
    tareas.push(getCount(publicados("clientes")).then((snap) => pintarTotal(snap.data().count)));
  }

  if (galerias.length) {
    const maximo = Math.max(...galerias.map((g) => Number(g.dataset.limite) || 200));
    tareas.push(
      getDocs(publicados("galeria", orderBy("creadoEn", "desc"), limit(maximo)))
        .then((snap) => pintarGalerias(galerias, datos(snap).filter((f) => esUrlImagenSegura(f.url))))
        .catch((error) => {
          pintarGalerias(galerias, []);
          throw error;
        }),
    );
  }

  tareas.forEach((tarea) => tarea.catch((error) => console.error("[firestore]", error)));
}

iniciar();
