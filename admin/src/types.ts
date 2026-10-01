export type TipoCliente = "empresa" | "persona";

export interface Cliente {
  id: string;
  nombre: string;
  // Ausente en documentos anteriores a este campo: se trata como "empresa".
  tipo?: TipoCliente;
  destacado: boolean;
  publicado: boolean;
  logoUrl?: string;
  logoPath?: string;
}

export interface Testimonio {
  id: string;
  autor: string;
  cargo?: string;
  clienteId: string;
  texto: string;
  orden: number;
  publicado: boolean;
}

export interface Foto {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  url: string;
  path: string;
  ancho: number;
  alto: number;
  publicado: boolean;
}
