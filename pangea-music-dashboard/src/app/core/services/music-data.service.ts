import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import Papa from 'papaparse';
import { firstValueFrom } from 'rxjs';
import { AlbumFilters, AlbumRecord, ChartDatum } from '../models/album-record.model';

const CSV_URL = 'musica-pangea.csv';

const EMPTY_FILTERS: AlbumFilters = {
  generos: [],
  paises: [],
  subgeneros: [],
  sellos: [],
  anioMin: null,
  anioMax: null,
  texto: ''
};

/**
 * Carga el CSV de la colección de música, lo parsea y expone el estado
 * (datos, filtros y datos ya filtrados) como signals reactivas para que
 * los componentes del dashboard se actualicen automáticamente.
 */
@Injectable({
  providedIn: 'root'
})
export class MusicDataService {
  private readonly albumsSignal = signal<AlbumRecord[]>([]);
  private readonly loadingSignal = signal<boolean>(true);
  private readonly errorSignal = signal<string | null>(null);
  private readonly filtersSignal = signal<AlbumFilters>({ ...EMPTY_FILTERS });

  readonly albums = this.albumsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly filters = this.filtersSignal.asReadonly();

  /** Lista de géneros/continentes únicos presentes en el CSV, ordenada alfabéticamente. */
  readonly generosDisponibles = computed(() =>
    this.uniqueSorted(this.albumsSignal().map((a) => a.genero))
  );

  /** Lista de países únicos presentes en el CSV, ordenada alfabéticamente. */
  readonly paisesDisponibles = computed(() =>
    this.uniqueSorted(this.albumsSignal().map((a) => a.pais))
  );

  /** Sellos discográficos presentes en el CSV, ordenados por número de álbumes. */
  readonly sellosDisponibles = computed(() =>
    this.countBy(
      this.albumsSignal().filter((a) => a.sello),
      (a) => a.sello
    ).map((d) => d.label)
  );

  /** Rango de años [min, max] disponible en los datos. */
  readonly rangoAnios = computed<[number, number]>(() => {
    const anios = this.albumsSignal()
      .map((a) => a.anio)
      .filter((a): a is number => a !== null);
    if (anios.length === 0) {
      return [0, 0];
    }
    return [Math.min(...anios), Math.max(...anios)];
  });

  /** Álbumes que cumplen los filtros activos. */
  readonly albumsFiltrados = computed(() => {
    const filtros = this.filtersSignal();
    const texto = filtros.texto.trim().toLowerCase();
    return this.albumsSignal().filter((album) => {
      if (filtros.generos.length > 0 && !filtros.generos.includes(album.genero)) {
        return false;
      }
      if (filtros.paises.length > 0 && !filtros.paises.includes(album.pais)) {
        return false;
      }
      if (filtros.subgeneros.length > 0 && !filtros.subgeneros.includes(album.subgenero)) {
        return false;
      }
      if (filtros.sellos.length > 0 && !filtros.sellos.includes(album.sello)) {
        return false;
      }
      if (filtros.anioMin !== null && album.anio !== null && album.anio < filtros.anioMin) {
        return false;
      }
      if (filtros.anioMax !== null && album.anio !== null && album.anio > filtros.anioMax) {
        return false;
      }
      if (texto) {
        const haystack = `${album.artista} ${album.album} ${album.subgenero} ${album.sello} ${album.anio ?? ''}`.toLowerCase();
        if (!haystack.includes(texto)) {
          return false;
        }
      }
      return true;
    });
  });

  /** Número de álbumes por género/continente, para el gráfico de barras. */
  readonly datosPorGenero = computed<ChartDatum[]>(() =>
    this.countBy(this.albumsFiltrados(), (a) => a.genero)
  );

  /** Top países por número de álbumes, para el gráfico de barras horizontal. */
  readonly datosPorPais = computed<ChartDatum[]>(() =>
    this.countBy(this.albumsFiltrados(), (a) => a.pais).slice(0, 15)
  );

  /** Top subgéneros por número de álbumes, para el gráfico de barras horizontal. */
  readonly datosPorSubgenero = computed<ChartDatum[]>(() =>
    this.countBy(this.albumsFiltrados(), (a) => a.subgenero).slice(0, 15)
  );

  /** Número de álbumes por década, para el gráfico de evolución temporal. */
  readonly datosPorDecada = computed<ChartDatum[]>(() => {
    const conteo = new Map<number, number>();
    for (const album of this.albumsFiltrados()) {
      if (album.anio === null) {
        continue;
      }
      const decada = Math.floor(album.anio / 10) * 10;
      conteo.set(decada, (conteo.get(decada) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .sort(([a], [b]) => a - b)
      .map(([decada, value]) => ({ label: `${decada}s`, value }));
  });

  constructor(private readonly http: HttpClient) {
    this.cargarDatos();
  }

  /** Descarga y parsea el CSV de la colección de música. */
  async cargarDatos(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const csvText = await firstValueFrom(this.http.get(CSV_URL, { responseType: 'text' }));
      this.albumsSignal.set(this.parseCsv(csvText));
    } catch (err) {
      console.error('Error cargando el CSV de la colección de música', err);
      this.errorSignal.set('No se ha podido cargar el fichero de la colección de música.');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Sustituye los filtros activos por unos nuevos (fusionados con los existentes). */
  actualizarFiltros(cambios: Partial<AlbumFilters>): void {
    this.filtersSignal.update((actuales) => ({ ...actuales, ...cambios }));
  }

  /** Restablece todos los filtros a su estado inicial (sin filtrar). */
  limpiarFiltros(): void {
    this.filtersSignal.set({ ...EMPTY_FILTERS });
  }

  private parseCsv(csvText: string): AlbumRecord[] {
    const resultado = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    return resultado.data
      .map((fila) => this.toAlbumRecord(fila))
      .filter((album): album is AlbumRecord => album !== null);
  }

  private toAlbumRecord(fila: Record<string, string>): AlbumRecord | null {
    const artista = (fila['Artista'] ?? '').trim();
    const album = (fila['Álbum'] ?? '').trim();
    if (!artista && !album) {
      return null;
    }
    const anioTexto = (fila['Año'] ?? '').trim();
    const anio = /^\d{3,4}$/.test(anioTexto) ? Number(anioTexto) : null;
    return {
      genero: (fila['Género / Continente'] ?? '').trim() || 'Sin clasificar',
      subgenero: (fila['Subgénero'] ?? '').trim() || 'Sin clasificar',
      pais: (fila['País'] ?? '').trim() || 'Desconocido',
      artista: artista || 'Desconocido',
      anio,
      album: album || 'Sin título',
      sello: (fila['Sello'] ?? '').trim()
    };
  }

  private uniqueSorted(valores: string[]): string[] {
    return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b, 'es'));
  }

  private countBy(albums: AlbumRecord[], selector: (a: AlbumRecord) => string): ChartDatum[] {
    const conteo = new Map<string, number>();
    for (const album of albums) {
      const clave = selector(album);
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }));
  }
}
