import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { AlbumRecord } from '../../core/models/album-record.model';
import { MusicDataService } from '../../core/services/music-data.service';

type ColumnaOrden = keyof Pick<AlbumRecord, 'artista' | 'album' | 'genero' | 'subgenero' | 'pais' | 'anio'>;

const FILAS_POR_PAGINA = 15;

/** Tabla paginada y ordenable con el detalle de los álbumes filtrados. */
@Component({
  selector: 'app-albums-table',
  imports: [DecimalPipe],
  templateUrl: './albums-table.component.html',
  styleUrl: './albums-table.component.scss'
})
export class AlbumsTableComponent {
  private readonly dataService = inject(MusicDataService);

  readonly columnaOrden = signal<ColumnaOrden>('artista');
  readonly ordenAscendente = signal(true);
  readonly paginaActual = signal(1);

  readonly albumsOrdenados = computed(() => {
    const columna = this.columnaOrden();
    const ascendente = this.ordenAscendente();
    const factor = ascendente ? 1 : -1;
    return [...this.dataService.albumsFiltrados()].sort((a, b) => {
      const va = a[columna];
      const vb = b[columna];
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * factor;
      }
      return String(va).localeCompare(String(vb), 'es') * factor;
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.albumsOrdenados().length / FILAS_POR_PAGINA))
  );

  readonly albumsPagina = computed(() => {
    const pagina = Math.min(this.paginaActual(), this.totalPaginas());
    const inicio = (pagina - 1) * FILAS_POR_PAGINA;
    return this.albumsOrdenados().slice(inicio, inicio + FILAS_POR_PAGINA);
  });

  constructor() {
    // Vuelve a la primera página cada vez que cambian los resultados filtrados.
    effect(() => {
      this.dataService.albumsFiltrados();
      this.paginaActual.set(1);
    });
  }

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden() === columna) {
      this.ordenAscendente.update((v) => !v);
    } else {
      this.columnaOrden.set(columna);
      this.ordenAscendente.set(true);
    }
    this.paginaActual.set(1);
  }

  irAPagina(pagina: number): void {
    this.paginaActual.set(Math.min(Math.max(1, pagina), this.totalPaginas()));
  }

  abrirEnSpotify(album: AlbumRecord): void {
    const consulta = encodeURIComponent(this.limpiarNombreParaBusqueda(album.artista));
    window.location.assign(`spotify:search:${consulta}`);
  }

  /**
   * Descarta el texto entre paréntesis o corchetes del nombre (p. ej. el
   * instrumento en "Anita O'Day (Vocal)" o "[Henry Mancini]") porque ensucia
   * la búsqueda en Spotify.
   */
  private limpiarNombreParaBusqueda(nombre: string): string {
    const limpio = nombre
      .replace(/\([^)]*\)?/g, ' ')
      .replace(/\[[^\]]*\]?/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return limpio || nombre.replace(/[()[\]]/g, ' ').replace(/\s+/g, ' ').trim() || nombre.trim();
  }

  iconoOrden(columna: ColumnaOrden): string {
    if (this.columnaOrden() !== columna) {
      return '';
    }
    return this.ordenAscendente() ? '▲' : '▼';
  }
}
