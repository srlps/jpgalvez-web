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
