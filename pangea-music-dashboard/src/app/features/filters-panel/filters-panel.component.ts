import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MusicDataService } from '../../core/services/music-data.service';

/**
 * Panel lateral de filtros: género/continente, país, sello, rango de años y
 * búsqueda de texto libre sobre artista/álbum/subgénero/sello/año.
 */
@Component({
  selector: 'app-filters-panel',
  imports: [FormsModule],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.scss'
})
export class FiltersPanelComponent {
  private readonly dataService = inject(MusicDataService);

  readonly generosDisponibles = this.dataService.generosDisponibles;
  readonly rangoAnios = this.dataService.rangoAnios;

  readonly busquedaPais = signal('');
  readonly busquedaSello = signal('');

  readonly sellosFiltrados = computed(() => {
    const texto = this.busquedaSello().trim().toLowerCase();
    const sellos = this.dataService.sellosDisponibles();
    return texto ? sellos.filter((s) => s.toLowerCase().includes(texto)) : sellos;
  });

  readonly paisesFiltrados = computed(() => {
    const texto = this.busquedaPais().trim().toLowerCase();
    const paises = this.dataService.paisesDisponibles();
    return texto ? paises.filter((p) => p.toLowerCase().includes(texto)) : paises;
  });

  get textoBusqueda(): string {
    return this.dataService.filters().texto;
  }
  set textoBusqueda(valor: string) {
    this.dataService.actualizarFiltros({ texto: valor });
  }

  get anioMin(): number | null {
    return this.dataService.filters().anioMin;
  }
  set anioMin(valor: number | null) {
    this.dataService.actualizarFiltros({ anioMin: valor });
  }

  get anioMax(): number | null {
    return this.dataService.filters().anioMax;
  }
  set anioMax(valor: number | null) {
    this.dataService.actualizarFiltros({ anioMax: valor });
  }

  generoSeleccionado(genero: string): boolean {
    return this.dataService.filters().generos.includes(genero);
  }

  paisSeleccionado(pais: string): boolean {
    return this.dataService.filters().paises.includes(pais);
  }

  selloSeleccionado(sello: string): boolean {
    return this.dataService.filters().sellos.includes(sello);
  }

  toggleSello(sello: string, marcado: boolean): void {
    const actuales = this.dataService.filters().sellos;
    const nuevos = marcado ? [...actuales, sello] : actuales.filter((s) => s !== sello);
    this.dataService.actualizarFiltros({ sellos: nuevos });
  }

  limpiarSellos(): void {
    this.busquedaSello.set('');
    this.dataService.actualizarFiltros({ sellos: [] });
  }

  toggleGenero(genero: string, marcado: boolean): void {
    const actuales = this.dataService.filters().generos;
    const nuevos = marcado ? [...actuales, genero] : actuales.filter((g) => g !== genero);
    this.dataService.actualizarFiltros({ generos: nuevos });
  }

  togglePais(pais: string, marcado: boolean): void {
    const actuales = this.dataService.filters().paises;
    const nuevos = marcado ? [...actuales, pais] : actuales.filter((p) => p !== pais);
    this.dataService.actualizarFiltros({ paises: nuevos });
  }

  limpiarTextoBusqueda(): void {
    this.dataService.actualizarFiltros({ texto: '' });
  }

  limpiarRangoAnios(): void {
    this.dataService.actualizarFiltros({ anioMin: null, anioMax: null });
  }

  limpiarGeneros(): void {
    this.dataService.actualizarFiltros({ generos: [] });
  }

  limpiarPaises(): void {
    this.busquedaPais.set('');
    this.dataService.actualizarFiltros({ paises: [] });
  }

  limpiarFiltros(): void {
    this.busquedaPais.set('');
    this.busquedaSello.set('');
    this.dataService.limpiarFiltros();
  }
}
