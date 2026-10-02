/** Un disco / álbum de la colección de música de Pangea. */
export interface AlbumRecord {
  /** Género o continente musical (columna "Género / Continente" del CSV). */
  genero: string;
  /** Subgénero musical. */
  subgenero: string;
  /** País de origen del artista. */
  pais: string;
  /** Nombre del artista o grupo. */
  artista: string;
  /** Año de publicación del álbum. `null` cuando el CSV no lo especifica. */
  anio: number | null;
  /** Título del álbum. */
  album: string;
  /** Sello discográfico (primera edición). Cadena vacía cuando no se conoce. */
  sello: string;
}

/** Filtros aplicables sobre la colección de álbumes. */
export interface AlbumFilters {
  generos: string[];
  paises: string[];
  subgeneros: string[];
  sellos: string[];
  anioMin: number | null;
  anioMax: number | null;
  texto: string;
}

/** Par nombre/valor usado para alimentar los gráficos. */
export interface ChartDatum {
  label: string;
  value: number;
}
