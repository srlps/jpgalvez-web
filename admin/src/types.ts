export interface Cliente {
  id: string;
  nombre: string;
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
