// Consola admin: clientes, testimonios y galería. Solo usuarios con documento en admins/{uid} (ver firestore.rules).
// El contenido se pinta con textContent/atributos, nunca con innerHTML.
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import {
  collection, doc, getDoc, getDocs, query, orderBy, setDoc, updateDoc, deleteDoc, serverTimestamp, deleteField,
} from "firebase/firestore/lite";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app, db } from "./firebase-app.js";
import { esUrlImagenSegura } from "./firebase-config.js";
import semillaClientes from "../../data/clientes.json";
import { testimoniosIniciales } from "../../data/testimonios-iniciales";
import { categoriasGaleria } from "../../data/sitio";

const auth = getAuth(app);
const storage = getStorage(app);

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const normalizar = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function el(tag, props = {}, ...hijos) {
  const nodo = document.createElement(tag);
  Object.assign(nodo, props);
  nodo.append(...hijos.filter((h) => h != null));
  return nodo;
}

function mensajeError(error) {
  const codigo = error?.code ?? "";
  if (codigo.includes("permission-denied") || codigo === "storage/unauthorized") return "No tiene permisos para esta acción (revise las reglas de Firebase y el documento admins/{uid}).";
  if (codigo === "auth/invalid-credential" || codigo === "auth/wrong-password" || codigo === "auth/user-not-found") return "Correo o contraseña incorrectos.";
  if (codigo === "auth/too-many-requests") return "Demasiados intentos. Espere unos minutos e inténtelo de nuevo.";
  if (codigo === "failed-precondition") return "Falta desplegar un índice de Firestore (firebase deploy --only firestore:indexes).";
  return error?.message ?? "Ocurrió un error inesperado.";
}

// ---------- Imágenes ----------

async function prepararImagen(archivo, ladoMaximo) {
  if (!archivo.type.startsWith("image/")) throw new Error(`"${archivo.name}" no es una imagen.`);
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = el("canvas", { width: ancho, height: alto });
  const ctx = canvas.getContext("2d");
  // Fondo blanco por si el navegador no codifica WebP y cae a JPEG (sin transparencia).
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();
  const codificar = (tipo) => new Promise((resolve) => canvas.toBlob(resolve, tipo, 0.85));
  let blob = await codificar("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await codificar("image/jpeg");
  return { blob, ancho, alto, ext: blob.type === "image/webp" ? "webp" : "jpg" };
}

function subirArchivo(ruta, blob, alProgresar) {
  return new Promise((resolve, reject) => {
    const tarea = uploadBytesResumable(ref(storage, ruta), blob, {
      contentType: blob.type,
      cacheControl: "public, max-age=31536000, immutable",
    });
    tarea.on(
      "state_changed",
      (snap) => alProgresar?.(snap.bytesTransferred / snap.totalBytes),
      reject,
      () => getDownloadURL(tarea.snapshot.ref).then(resolve, reject),
    );
  });
}

async function eliminarArchivo(ruta) {
  if (!ruta) return;
  try {
    await deleteObject(ref(storage, ruta));
  } catch (error) {
    if (error.code !== "storage/object-not-found") throw error;
  }
}

// Nombre único por subida: los archivos se cachean como inmutables.
const rutaArchivo = (carpeta, id, ext) => `${carpeta}/${id}-${Date.now()}.${ext}`;

async function resolverLogo(carpeta, id, form, anterior) {
  const archivo = form.logo.files[0];
  if (archivo) {
    const imagen = await prepararImagen(archivo, 400);
    const ruta = rutaArchivo(carpeta, id, imagen.ext);
    const url = await subirArchivo(ruta, imagen.blob);
    return { campos: { logoUrl: url, logoPath: ruta }, nuevo: ruta, descartar: anterior?.logoPath };
  }
  if (anterior && form.quitarLogo.checked && anterior.logoUrl) {
    return { campos: { logoUrl: deleteField(), logoPath: deleteField() }, descartar: anterior.logoPath };
  }
  return { campos: {} };
}

// ---------- Formularios de alta/edición (clientes y testimonios) ----------

function crearEditor({ form, entidad, alCargar, alGuardar }) {
  const titulo = $("[data-form-titulo]", form);
  const cancelar = $("[data-form-cancelar]", form);
  const estado = $("[data-form-estado]", form);
  const logoActual = $("[data-logo-actual]", form);
  const tituloInicial = titulo.textContent;

  function limpiar() {
    form.reset();
    form.docId.value = "";
    titulo.textContent = tituloInicial;
    cancelar.hidden = true;
    logoActual.hidden = true;
  }

  function editar(item) {
    limpiar();
    form.docId.value = item.id;
    titulo.textContent = `Editar ${entidad}`;
    cancelar.hidden = false;
    alCargar(item);
    if (esUrlImagenSegura(item.logoUrl)) {
      $("img", logoActual).src = item.logoUrl;
      logoActual.hidden = false;
    }
    estado.textContent = "";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.querySelector("input:not([type=hidden])").focus({ preventScroll: true });
  }

  cancelar.addEventListener("click", limpiar);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const boton = form.querySelector("[type=submit]");
    boton.disabled = true;
    estado.textContent = "Guardando…";
    try {
      await alGuardar(form);
      estado.textContent = `${entidad[0].toUpperCase()}${entidad.slice(1)} guardado.`;
      limpiar();
    } catch (error) {
      console.error(error);
      estado.textContent = mensajeError(error);
    } finally {
      boton.disabled = false;
    }
  });

  return { editar };
}

// Crea o actualiza el documento y gestiona el logo (sube el nuevo, borra el reemplazado).
async function guardarConLogo(coleccion, form, lista, datos) {
  const anterior = lista.find((item) => item.id === form.docId.value);
  const referencia = anterior ? doc(db, coleccion, anterior.id) : doc(collection(db, coleccion));
  const logo = await resolverLogo(coleccion, referencia.id, form, anterior);
  try {
    if (anterior) {
      await updateDoc(referencia, { ...datos, ...logo.campos, actualizadoEn: serverTimestamp() });
    } else {
      await setDoc(referencia, { ...datos, ...logo.campos, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    }
  } catch (error) {
    await eliminarArchivo(logo.nuevo).catch(() => {});
    throw error;
  }
  await eliminarArchivo(logo.descartar).catch((error) => console.warn("No se pudo borrar el logo anterior", error));
}

async function eliminarConArchivo(coleccion, item, nombre, ruta) {
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return false;
  await deleteDoc(doc(db, coleccion, item.id));
  await eliminarArchivo(ruta).catch((error) => console.warn("No se pudo borrar el archivo", error));
  return true;
}

function casilla(valor, etiqueta, alCambiar) {
  const input = el("input", { type: "checkbox", checked: Boolean(valor) });
  input.setAttribute("aria-label", etiqueta);
  input.addEventListener("change", async () => {
    input.disabled = true;
    try {
      await alCambiar(input.checked);
    } catch (error) {
      input.checked = !input.checked;
      alert(mensajeError(error));
    } finally {
      input.disabled = false;
    }
  });
  return input;
}

const botonTexto = (texto, alHacerClick, clase = "") => {
  const boton = el("button", { type: "button", className: `btn-texto ${clase}`, textContent: texto });
  boton.addEventListener("click", alHacerClick);
  return boton;
};

async function actualizarCampo(coleccion, item, campos) {
  await updateDoc(doc(db, coleccion, item.id), { ...campos, actualizadoEn: serverTimestamp() });
  Object.assign(item, campos);
}

async function importarEnLotes(coleccion, documentos, estado) {
  // Escrituras individuales en grupos pequeños (cada una pasa por las reglas y su exists() de admin).
  for (let i = 0; i < documentos.length; i += 20) {
    const grupo = documentos.slice(i, i + 20);
    await Promise.all(grupo.map((datos) =>
      setDoc(doc(collection(db, coleccion)), { ...datos, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() }),
    ));
    estado.textContent = `Importando… ${Math.min(i + 20, documentos.length)} de ${documentos.length}`;
  }
}

// ---------- Clientes ----------

const panelClientes = $("#panel-clientes");
const clientes = { items: [] };

const editorClientes = crearEditor({
  form: $("[data-form-clientes]"),
  entidad: "cliente",
  alCargar(item) {
    const form = $("[data-form-clientes]");
    form.nombre.value = item.nombre;
    form.destacado.checked = item.destacado;
    form.publicado.checked = item.publicado;
  },
  async alGuardar(form) {
    await guardarConLogo("clientes", form, clientes.items, {
      nombre: form.nombre.value.trim(),
      destacado: form.destacado.checked,
      publicado: form.publicado.checked,
    });
    await cargarClientes();
  },
});

function filaCliente(item) {
  const logo = esUrlImagenSegura(item.logoUrl) ? el("img", { src: item.logoUrl, alt: "", className: "admin-miniatura" }) : "—";
  return el("tr", {},
    el("td", { textContent: item.nombre }),
    el("td", {}, logo),
    el("td", {}, casilla(item.destacado, `Destacar ${item.nombre}`, (v) => actualizarCampo("clientes", item, { destacado: v }))),
    el("td", {}, casilla(item.publicado, `Publicar ${item.nombre}`, (v) => actualizarCampo("clientes", item, { publicado: v }).then(pintarContadorClientes))),
    el("td", { className: "admin-acciones" },
      botonTexto("Editar", () => editorClientes.editar(item)),
      botonTexto("Eliminar", async () => {
        try {
          if (await eliminarConArchivo("clientes", item, item.nombre, item.logoPath)) await cargarClientes();
        } catch (error) {
          alert(mensajeError(error));
        }
      }, "btn-texto--peligro"),
    ),
  );
}

function pintarContadorClientes() {
  const publicados = clientes.items.filter((c) => c.publicado).length;
  $("[data-contador]", panelClientes).textContent = `${clientes.items.length} clientes · ${publicados} publicados`;
}

function pintarClientes() {
  const consulta = normalizar($("[data-buscar]", panelClientes).value.trim());
  const filas = clientes.items.filter((c) => normalizar(c.nombre).includes(consulta)).map(filaCliente);
  $("[data-lista]", panelClientes).replaceChildren(...filas);
  $("[data-importar]", panelClientes).hidden = clientes.items.length > 0;
  pintarContadorClientes();
}

async function cargarClientes() {
  const snap = await getDocs(query(collection(db, "clientes"), orderBy("nombre")));
  clientes.items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  pintarClientes();
}

$("[data-buscar]", panelClientes).addEventListener("input", pintarClientes);

$("[data-importar-boton]", panelClientes).addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  if (!confirm(`Se crearán ${semillaClientes.length} clientes publicados a partir del listado del sitio actual. ¿Continuar?`)) return;
  boton.disabled = true;
  const estado = $("[data-contador]", panelClientes);
  try {
    await importarEnLotes("clientes", semillaClientes.map((nombre) => ({
      nombre,
      destacado: nombre === "MM CONSULTORES",
      publicado: true,
      ...(nombre === "MM CONSULTORES" ? { logoUrl: "/images/logos/logo-mm-consultores.jpg" } : {}),
    })), estado);
  } catch (error) {
    alert(mensajeError(error));
  } finally {
    boton.disabled = false;
    await cargarClientes();
  }
});

// ---------- Testimonios ----------

const panelTestimonios = $("#panel-testimonios");
const testimonios = { items: [] };

const editorTestimonios = crearEditor({
  form: $("[data-form-testimonios]"),
  entidad: "testimonio",
  alCargar(item) {
    const form = $("[data-form-testimonios]");
    form.autor.value = item.autor;
    form.cargo.value = item.cargo ?? "";
    form.empresa.value = item.empresa;
    form.texto.value = item.texto;
    form.orden.value = item.orden;
    form.publicado.checked = item.publicado;
  },
  async alGuardar(form) {
    const cargo = form.cargo.value.trim();
    const edicion = Boolean(form.docId.value);
    await guardarConLogo("testimonios", form, testimonios.items, {
      autor: form.autor.value.trim(),
      empresa: form.empresa.value.trim(),
      texto: form.texto.value.trim(),
      orden: Math.max(0, Math.min(9999, Math.trunc(Number(form.orden.value) || 0))),
      publicado: form.publicado.checked,
      ...(cargo ? { cargo } : edicion ? { cargo: deleteField() } : {}),
    });
    await cargarTestimonios();
  },
});

function tarjetaTestimonio(item) {
  const logo = esUrlImagenSegura(item.logoUrl) ? el("img", { src: item.logoUrl, alt: "", className: "admin-miniatura" }) : null;
  return el("li", { className: "tarjeta admin-item" },
    el("div", { className: "admin-item__cabecera" },
      logo,
      el("div", {},
        el("strong", { textContent: item.autor }),
        el("span", { className: "admin-item__meta", textContent: [item.cargo, item.empresa].filter(Boolean).join(", ") }),
        el("span", { className: "admin-item__meta", textContent: `Orden: ${item.orden}` }),
      ),
    ),
    el("p", { className: "admin-item__texto", textContent: item.texto }),
    el("div", { className: "admin-acciones" },
      el("label", { className: "check" }, casilla(item.publicado, `Publicar testimonio de ${item.autor}`, (v) => actualizarCampo("testimonios", item, { publicado: v })), "Publicado"),
      botonTexto("Editar", () => editorTestimonios.editar(item)),
      botonTexto("Eliminar", async () => {
        try {
          if (await eliminarConArchivo("testimonios", item, `testimonio de ${item.autor}`, item.logoPath)) await cargarTestimonios();
        } catch (error) {
          alert(mensajeError(error));
        }
      }, "btn-texto--peligro"),
    ),
  );
}

async function cargarTestimonios() {
  const snap = await getDocs(query(collection(db, "testimonios"), orderBy("orden")));
  testimonios.items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  $("[data-lista]", panelTestimonios).replaceChildren(...testimonios.items.map(tarjetaTestimonio));
  $("[data-importar]", panelTestimonios).hidden = testimonios.items.length > 0;
}

$("[data-importar-boton]", panelTestimonios).addEventListener("click", async (event) => {
  const boton = event.currentTarget;
  boton.disabled = true;
  try {
    await importarEnLotes("testimonios", testimoniosIniciales.map((t) => ({ ...t, publicado: true })), $("[data-importar] p", panelTestimonios));
  } catch (error) {
    alert(mensajeError(error));
  } finally {
    boton.disabled = false;
    await cargarTestimonios();
  }
});

// ---------- Galería ----------

const panelGaleria = $("#panel-galeria");
const formGaleria = $("[data-form-galeria]");
const galeria = { items: [] };

const tituloDesdeArchivo = (nombre) => nombre.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 120) || "Foto";

function selectorCategoria(valor) {
  const select = el("select", { name: "categoria" }, ...categoriasGaleria.map((c) => el("option", { value: c.valor, textContent: c.label })));
  select.value = valor;
  return select;
}

function tarjetaFoto(item) {
  const form = el("form", { className: "admin-foto__form" },
    el("label", {}, "Título", el("input", { name: "titulo", value: item.titulo, maxLength: 120, required: true })),
    el("label", {}, "Categoría", selectorCategoria(item.categoria)),
    el("label", {}, "Descripción", el("textarea", { name: "descripcion", value: item.descripcion ?? "", maxLength: 500, rows: 2 })),
    el("label", { className: "check" }, el("input", { type: "checkbox", name: "publicado", checked: item.publicado }), "Publicada"),
    el("div", { className: "admin-acciones" },
      el("button", { type: "submit", className: "btn btn--primario btn--chico", textContent: "Guardar" }),
      botonTexto("Eliminar", async () => {
        try {
          if (await eliminarConArchivo("galeria", item, item.titulo, item.path)) await cargarGaleria();
        } catch (error) {
          alert(mensajeError(error));
        }
      }, "btn-texto--peligro"),
    ),
    el("p", { className: "form__estado", role: "status" }),
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const estado = $(".form__estado", form);
    const descripcion = form.descripcion.value.trim();
    try {
      await actualizarCampo("galeria", item, {
        titulo: form.titulo.value.trim(),
        categoria: form.categoria.value,
        publicado: form.publicado.checked,
        descripcion: descripcion || deleteField(),
      });
      if (!descripcion) delete item.descripcion;
      estado.textContent = "Cambios guardados.";
    } catch (error) {
      estado.textContent = mensajeError(error);
    }
  });

  const img = esUrlImagenSegura(item.url) ? el("img", { src: item.url, alt: item.titulo, loading: "lazy" }) : null;
  return el("li", { className: "tarjeta admin-foto" }, img, form);
}

async function cargarGaleria() {
  const snap = await getDocs(query(collection(db, "galeria"), orderBy("creadoEn", "desc")));
  galeria.items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  $("[data-lista]", panelGaleria).replaceChildren(...galeria.items.map(tarjetaFoto));
  const publicadas = galeria.items.filter((f) => f.publicado).length;
  $("[data-contador]", panelGaleria).textContent = `${galeria.items.length} fotos · ${publicadas} publicadas`;
}

async function subirFoto(archivo, opciones, progreso) {
  const referencia = doc(collection(db, "galeria"));
  const imagen = await prepararImagen(archivo, 1920);
  const ruta = rutaArchivo("galeria", referencia.id, imagen.ext);
  const url = await subirArchivo(ruta, imagen.blob, (p) => (progreso.value = p));
  try {
    await setDoc(referencia, {
      titulo: opciones.titulo || tituloDesdeArchivo(archivo.name),
      ...(opciones.descripcion ? { descripcion: opciones.descripcion } : {}),
      categoria: opciones.categoria,
      url,
      path: ruta,
      ancho: imagen.ancho,
      alto: imagen.alto,
      publicado: opciones.publicado,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  } catch (error) {
    await eliminarArchivo(ruta).catch(() => {});
    throw error;
  }
}

formGaleria.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!formGaleria.reportValidity()) return;
  const archivos = [...formGaleria.archivos.files];
  const opciones = {
    titulo: formGaleria.titulo.value.trim(),
    descripcion: formGaleria.descripcion.value.trim(),
    categoria: formGaleria.categoria.value,
    publicado: formGaleria.publicado.checked,
  };
  const boton = formGaleria.querySelector("[type=submit]");
  const listaProgreso = $("[data-progreso]", formGaleria);
  boton.disabled = true;
  listaProgreso.replaceChildren();

  for (const archivo of archivos) {
    const progreso = el("progress", { max: 1, value: 0 });
    const estado = el("span", { textContent: "Subiendo…" });
    listaProgreso.append(el("li", {}, el("span", { textContent: archivo.name }), progreso, estado));
    try {
      await subirFoto(archivo, opciones, progreso);
      progreso.value = 1;
      estado.textContent = "Listo";
    } catch (error) {
      console.error(error);
      estado.textContent = mensajeError(error);
    }
  }

  formGaleria.archivos.value = "";
  boton.disabled = false;
  await cargarGaleria().catch((error) => alert(mensajeError(error)));
});

// ---------- Pestañas ----------

const pestanas = [...document.querySelectorAll("[role=tab]")];

function activarPestana(pestana) {
  pestanas.forEach((p) => {
    const activa = p === pestana;
    p.setAttribute("aria-selected", String(activa));
    p.tabIndex = activa ? 0 : -1;
    document.getElementById(p.getAttribute("aria-controls")).hidden = !activa;
  });
}

pestanas.forEach((pestana, i) => {
  pestana.addEventListener("click", () => activarPestana(pestana));
  pestana.addEventListener("keydown", (event) => {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!paso) return;
    const siguiente = pestanas[(i + paso + pestanas.length) % pestanas.length];
    activarPestana(siguiente);
    siguiente.focus();
  });
});

// ---------- Sesión ----------

const vistaCargando = $("[data-admin-cargando]");
const vistaLogin = $("[data-admin-login]");
const vistaApp = $("[data-admin-app]");
const vistaSesion = $("[data-admin-sesion]");
const formLogin = $("[data-form-login]");
const estadoLogin = $("[data-login-estado]");

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!formLogin.reportValidity()) return;
  estadoLogin.textContent = "Ingresando…";
  try {
    await signInWithEmailAndPassword(auth, formLogin.email.value.trim(), formLogin.password.value);
  } catch (error) {
    estadoLogin.textContent = mensajeError(error);
  }
});

$("[data-login-recuperar]").addEventListener("click", async () => {
  const email = formLogin.email.value.trim();
  if (!email) {
    estadoLogin.textContent = "Escriba su correo y vuelva a pulsar «Olvidé mi contraseña».";
    formLogin.email.focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.warn(error);
  }
  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  estadoLogin.textContent = "Si el correo está registrado, recibirá un enlace para restablecer la contraseña.";
});

$("[data-admin-salir]").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (usuario) => {
  vistaCargando.hidden = true;
  if (!usuario) {
    vistaApp.hidden = true;
    vistaSesion.hidden = true;
    vistaLogin.hidden = false;
    return;
  }

  const esAdmin = await getDoc(doc(db, "admins", usuario.uid)).then((snap) => snap.exists(), () => false);
  if (!esAdmin) {
    estadoLogin.textContent = `La cuenta ${usuario.email} no tiene permisos de administración.`;
    await signOut(auth);
    return;
  }

  formLogin.reset();
  estadoLogin.textContent = "";
  vistaLogin.hidden = true;
  vistaApp.hidden = false;
  vistaSesion.hidden = false;
  $("[data-admin-usuario]").textContent = usuario.email;

  const resultados = await Promise.allSettled([cargarClientes(), cargarTestimonios(), cargarGaleria()]);
  resultados.forEach((r) => {
    if (r.status === "rejected") {
      console.error(r.reason);
      alert(mensajeError(r.reason));
    }
  });
});
