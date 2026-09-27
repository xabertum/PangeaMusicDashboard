import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MusicDataService } from '../../core/services/music-data.service';

/** Tarjetas con los indicadores clave (KPI) de la colección filtrada. */
@Component({
  selector: 'app-kpi-cards',
  imports: [DecimalPipe],
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  private readonly dataService = inject(MusicDataService);

  readonly totalAlbumes = computed(() => this.dataService.albumsFiltrados().length);

  readonly totalArtistas = computed(
    () => new Set(this.dataService.albumsFiltrados().map((a) => a.artista)).size
  );

  readonly totalGeneros = computed(
    () => new Set(this.dataService.albumsFiltrados().map((a) => a.genero)).size
  );

  readonly totalPaises = computed(
    () => new Set(this.dataService.albumsFiltrados().map((a) => a.pais)).size
  );

  readonly rangoAnios = computed<[number, number] | null>(() => {
    const anios = this.dataService
      .albumsFiltrados()
      .map((a) => a.anio)
      .filter((a): a is number => a !== null);
    if (anios.length === 0) {
      return null;
    }
    return [Math.min(...anios), Math.max(...anios)];
  });
}
