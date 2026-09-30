// Quita acentos y normaliza mayúsculas para comparar/buscar texto sin distinguir tildes.
export const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
