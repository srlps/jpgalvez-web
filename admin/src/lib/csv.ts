function escaparCampoCsv(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /["\r\n,]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function generarCsv(columnas: string[], filas: unknown[][]): string {
  const lineas = [columnas, ...filas].map((fila) => fila.map(escaparCampoCsv).join(","));
  return lineas.join("\r\n");
}

// BOM inicial para que Excel detecte UTF-8 y no rompa los acentos.
export function descargarCsv(nombreArchivo: string, contenido: string): void {
  const blob = new Blob([`\uFEFF${contenido}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Parser inverso de generarCsv (comillas dobles como escape, coma como separador, \r\n o \n como salto de fila).
export function parsearCsv(contenido: string): string[][] {
  const texto = contenido.replace(/^\uFEFF/, "");
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') enComillas = false;
      else campo += c;
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\r") {
      // el salto de fila real llega con el \n que sigue
    } else if (c === "\n") {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((valor) => valor.trim() !== ""));
}
