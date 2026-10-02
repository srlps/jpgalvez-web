export interface Servicio {
  slug: string;
  titulo: string;
  icono: "caja" | "contenedor" | "camion" | "almacen" | "peligro";
  resumen: string;
  parrafos: string[];
  atendemos?: string[];
  destacados: string[];
  imagen: string;
  // Distintivo junto al título para el servicio que se quiere resaltar.
  etiqueta?: string;
}

export const servicios: Servicio[] = [
  {
    slug: "transporte-de-carga-matpel",
    titulo: "Transporte de carga MATPEL",
    icono: "peligro",
    etiqueta: "Certificados",
    resumen: "Transporte certificado de materiales peligrosos para la minería y para toda operación que exija un transportista habilitado para MATPEL.",
    parrafos: [
      "Nuestras unidades y conductores cuentan con la certificación para el transporte de materiales peligrosos (MATPEL) y cumplen los requisitos que exige la normativa peruana para este tipo de carga.",
      "Esto nos permite ingresar a todas las faenas mineras del Perú y atender a la industria, la construcción y cualquier empresa cuyos insumos o productos requieran transporte MATPEL. Consúltenos por el tipo de carga que necesita trasladar.",
      "Operamos con una flota de tracto camiones de última generación, mantenida en nuestros propios talleres.",
    ],
    atendemos: ["Minería", "Industria", "Construcción"],
    destacados: ["Unidades y conductores certificados MATPEL", "Acceso a todas las faenas mineras del Perú", "Tracto camiones de última generación", "Monitoreo GPS 24/7"],
    // Provisional: no hay foto propia de una unidad MATPEL; se usa la del camión de la portada.
    imagen: "/images/fondos/banner-inicio-clean.jpg",
  },
  {
    slug: "mudanzas",
    titulo: "Mudanzas",
    icono: "caja",
    resumen: "Mudanzas puerta a puerta de casas, departamentos, oficinas y plantas, con embalaje e inventario incluidos.",
    parrafos: [
      "Nuestro servicio de mudanza se realiza puerta a puerta: nos encargamos de todo el embalaje e inventario para seguir con la carga, descarga y ubicación de los muebles de acuerdo a su indicación.",
      "Contamos con personal altamente calificado y unidades monitoreadas con sistema GPS.",
    ],
    atendemos: ["Mudanza de oficinas", "Mudanza de casa", "Mudanza de departamentos", "Mudanza de planta"],
    destacados: ["Servicio puerta a puerta", "Embalaje e inventario", "Carga, descarga y ubicación de muebles", "Unidades monitoreadas con GPS"],
    imagen: "/images/fotos/mudanzas-clean-color.png",
  },
  {
    slug: "transporte-de-almacenes-de-aduana",
    titulo: "Transporte de almacenes de aduana",
    icono: "contenedor",
    resumen: "Retiro e ingreso de mercadería a los terminales de almacenamiento, en contenedor (FCL) o carga suelta (LCL).",
    parrafos: [
      "Brindamos los servicios de retiro y/o ingreso de mercaderías a los diferentes terminales de almacenamiento.",
      "Asimismo, le brindamos orientación en el manejo de mercancías, ya sea en contenedor (FCL) o carga suelta (LCL). Adicionalmente coordinamos su seguimiento vía GPS hasta su destino final.",
    ],
    destacados: ["Retiro e ingreso a terminales de almacenamiento", "Contenedor completo (FCL)", "Carga suelta (LCL)", "Seguimiento vía GPS hasta destino final"],
    imagen: "/images/fotos/aduana-clean-color.png",
  },
  {
    slug: "alquiler-de-vehiculos",
    titulo: "Alquiler de vehículos",
    icono: "camion",
    resumen: "Camionetas preparadas para materiales pesados y objetos de gran tamaño, con soporte técnico en nuestros talleres.",
    parrafos: [
      "Contamos con camionetas diseñadas para soportar diversos materiales pesados y con amplias cajas para transportar grandes objetos.",
      "Si tiene dudas sobre las características de algún modelo en especial, consulte a través de nuestras líneas telefónicas o escríbanos desde el formulario de contacto.",
      "En caso tenga algún inconveniente con la camioneta, puede solicitar soporte técnico en nuestros talleres, donde nos preocupamos por mantener toda nuestra flota en buenas condiciones.",
    ],
    destacados: ["Camionetas para carga pesada", "Cajas amplias para objetos grandes", "Asesoría sobre cada modelo", "Soporte técnico en nuestros talleres"],
    imagen: "/images/fotos/alquiler-vehiculos-clean-color.png",
  },
  {
    slug: "alquiler-de-almacenes",
    titulo: "Alquiler de almacenes",
    icono: "almacen",
    resumen: "Espacio de almacenamiento en nuestras propias instalaciones, con bodega de acopio para su mercadería.",
    parrafos: [
      "Contamos con instalaciones propias y bodega de acopio para nuestros clientes.",
      "Almacenamos su mercadería de forma segura y la integramos con nuestros servicios de transporte, para que su carga salga a destino cuando usted lo necesite.",
    ],
    destacados: ["Instalaciones propias", "Bodega de acopio", "Integración con nuestro transporte"],
    imagen: "/images/fotos/alquiler-almacenes-clean-color.png",
  },
];

export const motivos = [
  { icono: "reloj", titulo: "Puntualidad en el servicio", texto: "Cumplimos los tiempos de entrega pactados con cada cliente." },
  { icono: "escudo", titulo: "Calidad con seguridad", texto: "Su carga llega a destino en perfectas condiciones." },
  { icono: "personal", titulo: "Personal capacitado", texto: "Equipos y conductores con capacidad técnica para ingresar a faenas mineras." },
  { icono: "camion", titulo: "Flota de última generación", texto: "Tracto camiones y unidades renovadas, monitoreadas por GPS." },
] as const;
