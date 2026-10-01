// Recalcula las columnas Problemas / Detalle problemas / Cambio de clientes-analisis.csv.
// Uso (desde la raíz del repo): node clientes_polishing/revisar-clientes.mjs
// Es idempotente: edita el CSV como quieras y vuelve a ejecutarlo para ver cuántos problemas quedan.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const RUTA = fileURLToPath(new URL("./clientes-analisis.csv", import.meta.url));
const COLUMNAS = [
  "Nombre", "Destacado", "Publicado", "Problemas", "Detalle problemas", "Revisado", "Nombre sugerido", "Cambio",
  "Estado", "Tipo", "RUC", "Sitio web", "Facebook", "LinkedIn", "Instagram", "Confianza", "Notas", "Nombre original",
];
const OBSOLETAS = ["Revisar"];

// Código -> [grupo, cómo se resuelve]
const PROBLEMAS = {
  "formato": ["A. Nombre", "Nombre ≠ Nombre sugerido solo por formato (S.A.C., puntos, espacios). Copiar la sugerencia a Nombre, o borrarla/igualarla si no se quiere."],
  "ortografia": ["A. Nombre", "Nombre ≠ Nombre sugerido por typo, palabra faltante o nombre truncado."],
  "razon-social": ["A. Nombre", "La sugerencia es la razón social completa de SUNAT (no un typo). Decidir cuál nombre se muestra."],
  "nombre-distinto": ["A. Nombre", "Nombre ≠ Nombre sugerido y la diferencia no es de formato (p. ej. se editó una de las dos columnas)."],
  "nombre-invalido": ["A. Nombre", "Vacío, >150 caracteres, espacios sobrantes, minúsculas o caracteres fuera de A-Z, Ñ, dígitos y . , & ' - ( ) /"],
  "nombre-duplicado": ["A. Nombre", "Otro cliente tiene el mismo nombre (ignorando puntuación, tildes y mayúsculas)."],
  "identidad-dudosa": ["B. Verificación", "Estado DUDOSO o NO_ENCONTRADO: no se pudo confirmar la empresa. Investigar y poner Revisado = Sí."],
  "sin-ruc": ["B. Verificación", "Empresa marcada OK/CORREGIDO pero sin RUC."],
  "baja-liquidacion": ["B. Verificación", "Figura en baja, liquidación, suspensión o no habido en algún directorio."],
  "estado-contradictorio": ["B. Verificación", "Los directorios discrepan (activo en uno, baja/liquidación en otro)."],
  "confianza-baja": ["B. Verificación", "Coincidencia con Confianza baja."],
  "coincidencia-incierta": ["B. Verificación", "La nota dice que hay que confirmar que es el mismo cliente (homónimo posible, provincia, etc.)."],
  "ruc-repetido": ["B. Verificación", "Otro cliente tiene el mismo RUC (posible duplicado)."],
  "destacado-en-riesgo": ["B. Verificación", "Está destacado en Inicio y tiene alguno de los problemas de verificación anteriores."],
  "sitio-sin-verificar": ["C. Web y redes", "Tiene sitio web pero la nota indica que no se confirmó que sea el oficial."],
  "url-invalida": ["D. Formato de datos", "Sitio web/Facebook/LinkedIn/Instagram no empieza con https:// (varios enlaces se separan con ' | ')."],
  "ruc-invalido": ["D. Formato de datos", "El RUC no tiene 11 dígitos."],
  "tipo-vacio": ["D. Formato de datos", "La columna Tipo está vacía."],
  "persona-destacada": ["D. Formato de datos", "Una persona natural no puede estar destacada."],
  "destacado-invalido": ["D. Formato de datos", "Destacado debe ser Sí o No."],
  "publicado-invalido": ["D. Formato de datos", "Publicado debe ser Sí o No."],
};

const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const sinFormato = (t) => norm(t).replace(/[^a-z0-9]/g, "");
const esSi = (v) => norm(v ?? "").trim() === "si";
const esSiNo = (v) => ["si", "no"].includes(norm(v ?? "").trim());
const nombreInvalido = (n) =>
  !n.trim() || n.length > 150 || n !== n.trim() || /\s{2,}/.test(n) || /[^A-ZÑ0-9 .,&'´\-()/]/.test(n.normalize("NFC"));

// Convención de la lista: sufijo societario con puntos y punto final (S.A.C., S.A., S.R.L., E.I.R.L., S.C.R.L.).
const SUFIJO = /^(.*\S)\s+(SOCIEDAD\s+ANONIMA\s+CERRADA|SOCIEDAD\s+ANONIMA|S\.?\s?A\.?\s?C\.?|S\.?\s?C\.?\s?R\.?\s?L\.?|S\.?\s?R\.?\s?L\.?|E\.?\s?I\.?\s?R\.?\s?L\.?|S\.?\s?A\.?)$/;
const SUFIJO_CANONICO = { SOCIEDADANONIMACERRADA: "S.A.C.", SOCIEDADANONIMA: "S.A.", SAC: "S.A.C.", SCRL: "S.C.R.L.", SRL: "S.R.L.", EIRL: "E.I.R.L.", SA: "S.A." };
function normalizarSufijo(n) {
  const m = n.match(SUFIJO);
  return m ? `${m[1]} ${SUFIJO_CANONICO[m[2].replace(/[^A-Z]/g, "")]}` : n;
}

function parsear(texto, sep) {
  const filas = []; let fila = [], campo = "", q = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (q) { if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') q = false; else campo += c; }
    else if (c === '"') q = true;
    else if (c === sep) { fila.push(campo); campo = ""; }
    else if (c === "\r") { /* el salto real llega con \n */ }
    else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
    else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  return filas.filter((f) => f.some((v) => v.trim() !== ""));
}
const escapar = (v, sep) => (new RegExp(`["\\r\\n${sep}]`).test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// Las frases que hablan de OTRAS empresas (homónimos descartados) no cuentan como estado del cliente.
const relevante = (notas) =>
  notas.split(/(?<=[.;])\s+/)
    .filter((s) => !/^(no confundir|homonimo|existe|existen|distinta|descartad|otro consorcio|se descarto|otras|hay otras|se eligio|ruc repetido)/i.test(s.trim()))
    .join(" ");

const crudo = fs.readFileSync(RUTA, "utf8");
if (crudo.includes("\uFFFD")) {
  console.error("El archivo no está en UTF-8. Guárdalo como «CSV UTF-8 (delimitado por comas)» y vuelve a ejecutar.");
  process.exit(1);
}
const texto = crudo.replace(/^\uFEFF/, "");
const primeraLinea = texto.split(/\r?\n/, 1)[0];
const sep = (primeraLinea.match(/;/g) ?? []).length > (primeraLinea.match(/,/g) ?? []).length ? ";" : ",";
const [cabecera, ...filas] = parsear(texto, sep).map((f, i) => (i === 0 ? f.map((h) => h.trim()) : f));
for (const faltante of ["Nombre", "Destacado", "Publicado"]) {
  if (!cabecera.includes(faltante)) { console.error(`Falta la columna obligatoria "${faltante}".`); process.exit(1); }
}
const extras = cabecera.filter((h) => !COLUMNAS.includes(h) && !OBSOLETAS.includes(h));
const datos = filas.map((f) => Object.fromEntries([...COLUMNAS, ...extras].map((c) => [c, (f[cabecera.indexOf(c)] ?? "")])));

const porNombre = new Map(), porRuc = new Map();
for (const r of datos) if (!r["Nombre original"].trim()) r["Nombre original"] = r.Nombre;

// Los agentes repitieron el nombre en "Nombre sugerido" aunque el sufijo societario estuviera sin normalizar.
let sufijosSugeridos = 0;
for (const r of datos) {
  if (/^persona/i.test(r.Tipo.trim())) continue;
  const base = r["Nombre sugerido"].trim() ? r["Nombre sugerido"] : r.Nombre;
  const canon = normalizarSufijo(base);
  if (canon !== base) { r["Nombre sugerido"] = canon; sufijosSugeridos++; }
}
if (sufijosSugeridos) console.log(`Sufijo societario sugerido en ${sufijosSugeridos} nombres.\n`);

function clasificarCambio(r) {
  const nombre = r.Nombre, sug = r["Nombre sugerido"];
  if (sug.trim() === "" || sug === nombre) return "";
  if (sinFormato(sug) === sinFormato(nombre) || sinFormato(sug) === sinFormato(normalizarSufijo(nombre))) return "Formato";
  const previo = norm(r.Cambio.trim());
  return previo === "ortografia" ? "Ortografía" : previo === "razon social" ? "Razón social" : "Nombre distinto";
}

// --aplicar=<tipo>: copia Nombre sugerido a Nombre. --conservar=<tipo>: descarta la sugerencia y deja el nombre del dueño
// (solo con el sufijo societario normalizado). <tipo> = formato | ortografia | razon-social.
const TIPOS_CAMBIO = { "formato": "Formato", "ortografia": "Ortografía", "razon-social": "Razón social" };
const opcion = (nombre) => process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split("=")[1];
const hoy = new Date();
const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
for (const [flag, descripcion] of [["aplicar", "aplicado"], ["conservar", "se conserva el nombre original"]]) {
  const valor = opcion(flag);
  if (!valor) continue;
  const tipo = TIPOS_CAMBIO[valor];
  if (!tipo) { console.error(`--${flag} debe ser formato, ortografia o razon-social (se recibió "${valor}").`); process.exit(1); }
  let cambiados = 0;
  for (const r of datos) {
    if (clasificarCambio(r) !== tipo) continue;
    if (flag === "aplicar") r.Nombre = r["Nombre sugerido"];
    else { r.Nombre = normalizarSufijo(r.Nombre); r["Nombre sugerido"] = r.Nombre; }
    r.Notas = `${r.Notas}${r.Notas.trim() ? " " : ""}[${fecha}] Nombre: ${valor} ${descripcion}.`;
    cambiados++;
  }
  console.log(`--${flag}=${valor}: ${cambiados} nombres.\n`);
}

// --revisar=<codigo>[,<codigo>]: pone Revisado = Sí solo en clientes cuyos ÚNICOS problemas son esos códigos (grupos B/C).
const revisar = opcion("revisar");
if (revisar) {
  const codigos = new Set(revisar.split(","));
  const invalidos = [...codigos].filter((c) => !/^[BC]\./.test(PROBLEMAS[c]?.[0] ?? ""));
  if (invalidos.length) { console.error(`--revisar solo acepta códigos de los grupos B y C (inválidos: ${invalidos.join(", ")}).`); process.exit(1); }
  let marcados = 0;
  for (const r of datos) {
    const actuales = r["Detalle problemas"].split(" | ").filter(Boolean);
    if (esSi(r.Revisado) || !actuales.length || !actuales.every((c) => codigos.has(c))) continue;
    r.Revisado = "Sí";
    r.Notas = `${r.Notas}${r.Notas.trim() ? " " : ""}[${fecha}] Revisado: ${actuales.join(", ")} aceptado.`;
    marcados++;
  }
  console.log(`--revisar=${revisar}: ${marcados} clientes marcados como Revisado.\n`);
}

for (const r of datos) {
  const k = sinFormato(r.Nombre);
  porNombre.set(k, (porNombre.get(k) ?? 0) + 1);
  const ruc = r.RUC.trim();
  if (ruc) porRuc.set(ruc, (porRuc.get(ruc) ?? 0) + 1);
}

const CONTACTOS_URL = ["Sitio web", "Facebook", "LinkedIn", "Instagram"];
const HEDGE_SITIO = /no se verifico|no verificado|no verifico|no visitado|no se pudo abrir|no se pudo verificar|no confirmado|no se confirm|inferido|coincidencia (por nombre|razonable)|titularidad no verificada/i;
const HEDGE_COINCIDENCIA = /verificar que sea|confirmar que (es|sea)|posible homonimo de un cliente|coincidencia (por nombre solamente|no segura)|empresa de provincia|no se asigna ruc por ser/i;
const BAJA = /baja (de oficio|definitiva)|liquidaci|suspensi|no habido/i;

// --destacar: pone Destacado = Sí (nunca lo quita) en clientes con identidad fuertemente validada y de dónde sacar el logo.
if (process.argv.includes("--destacar")) {
  const CONTACTOS = ["Sitio web", "Facebook", "LinkedIn", "Instagram"];
  const motivoNo = (r) => {
    if (/^persona/i.test(r.Tipo.trim())) return "persona natural";
    if (!CONTACTOS.some((c) => r[c].trim())) return "sin web ni redes";
    if (!["OK", "CORREGIDO"].includes(r.Estado.trim())) return "identidad no confirmada";
    if (norm(r.Confianza.trim()) !== "alta") return "confianza no alta";
    if (!r.RUC.trim()) return "sin RUC";
    if (r["Detalle problemas"].includes("sitio-sin-verificar")) return "sitio sin verificar";
    const notas = relevante(r.Notas);
    if (BAJA.test(notas) || /contradic|inconsisten|conflicto|discrepan/i.test(notas)) return "baja o estado dudoso";
    return "";
  };
  let nuevos = 0, yaEstaban = 0;
  const excluidos = {};
  for (const r of datos) {
    const motivo = motivoNo(r);
    if (!motivo) { if (esSi(r.Destacado)) yaEstaban++; else { r.Destacado = "Sí"; nuevos++; } }
    else if (CONTACTOS.some((c) => r[c].trim())) (excluidos[motivo] ??= []).push(r.Nombre);
  }
  console.log(`--destacar: ${nuevos} nuevos destacados (${yaEstaban} ya lo estaban).`);
  for (const [motivo, nombres] of Object.entries(excluidos)) console.log(`  con web/red pero sin destacar por "${motivo}" (${nombres.length}): ${nombres.join(" | ")}`);
  console.log("");
}

const conteo = Object.fromEntries(Object.keys(PROBLEMAS).map((c) => [c, 0]));
let sinProblemas = 0;

for (const r of datos) {
  const p = new Set();
  const nombre = r.Nombre, sug = r["Nombre sugerido"];
  const persona = /^persona/i.test(r.Tipo.trim());

  // A. Nombre
  const difiere = sug.trim() !== "" && sug !== nombre;
  r.Cambio = clasificarCambio(r);
  if (difiere) p.add({ "Formato": "formato", "Ortografía": "ortografia", "Razón social": "razon-social", "Nombre distinto": "nombre-distinto" }[r.Cambio]);
  if (nombreInvalido(nombre) && !(difiere && !nombreInvalido(sug))) p.add("nombre-invalido");
  if (porNombre.get(sinFormato(nombre)) > 1) p.add("nombre-duplicado");

  // D. Formato de datos (no se limpian con Revisado)
  if (!esSiNo(r.Destacado)) p.add("destacado-invalido");
  if (!esSiNo(r.Publicado)) p.add("publicado-invalido");
  if (!r.Tipo.trim()) p.add("tipo-vacio");
  if (persona && esSi(r.Destacado)) p.add("persona-destacada");
  if (r.RUC.trim() && !/^\d{11}$/.test(r.RUC.trim())) p.add("ruc-invalido");
  if (CONTACTOS_URL.some((c) => r[c].split("|").some((u) => u.trim() && !/^https:\/\/\S+$/.test(u.trim())))) p.add("url-invalida");

  // B y C. Verificación y web: se limpian con Revisado = Sí
  if (!esSi(r.Revisado) && !persona) {
    const notas = relevante(r.Notas);
    const dudosa = ["DUDOSO", "NO_ENCONTRADO"].includes(r.Estado.trim());
    if (dudosa) p.add("identidad-dudosa");
    if (!dudosa && ["OK", "CORREGIDO"].includes(r.Estado.trim()) && !r.RUC.trim()) p.add("sin-ruc");
    if (BAJA.test(notas)) {
      const contradictorio = /contradic|inconsisten|conflicto|discrepan/i.test(notas) || /activ[oa]/i.test(notas);
      p.add(contradictorio ? "estado-contradictorio" : "baja-liquidacion");
    }
    if (!dudosa && norm(r.Confianza.trim()) === "baja") p.add("confianza-baja");
    if (HEDGE_COINCIDENCIA.test(notas)) p.add("coincidencia-incierta");
    const ruc = r.RUC.trim();
    if (ruc && porRuc.get(ruc) > 1) p.add("ruc-repetido");
    if (esSi(r.Destacado) && ["identidad-dudosa", "baja-liquidacion", "estado-contradictorio", "confianza-baja", "coincidencia-incierta", "ruc-repetido"].some((c) => p.has(c))) p.add("destacado-en-riesgo");
    if (r["Sitio web"].trim() && (norm(r.Confianza.trim()) === "baja" || HEDGE_SITIO.test(notas))) p.add("sitio-sin-verificar");
  }

  for (const c of p) conteo[c]++;
  r.Problemas = String(p.size);
  r["Detalle problemas"] = [...p].join(" | ");
  if (p.size === 0) sinProblemas++;
}

const columnasSalida = [...COLUMNAS, ...extras];
const lineas = [columnasSalida, ...datos.map((r) => columnasSalida.map((c) => r[c]))].map((f) => f.map((v) => escapar(v, sep)).join(sep));
fs.writeFileSync(RUTA, "\uFEFF" + lineas.join("\r\n"), "utf8");

console.log(`Clientes: ${datos.length} | Sin problemas: ${sinProblemas} | Con problemas: ${datos.length - sinProblemas} | Problemas totales: ${datos.reduce((a, r) => a + Number(r.Problemas), 0)}\n`);
let grupo = "";
for (const [codigo, [g]] of Object.entries(PROBLEMAS)) {
  if (g !== grupo) { grupo = g; console.log(`\n${g}`); }
  console.log(`  ${String(conteo[codigo]).padStart(4)}  ${codigo}`);
}
console.log(sinProblemas === datos.length ? "\nLISTA LISTA PARA IMPORTAR: todos los clientes tienen 0 problemas." : "");
