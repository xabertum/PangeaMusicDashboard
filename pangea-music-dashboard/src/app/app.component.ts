import { Component, inject } from '@angular/core';
import { MusicDataService } from './core/services/music-data.service';
import { AlbumsTableComponent } from './features/albums-table/albums-table.component';
import { CountryChartComponent } from './features/country-chart/country-chart.component';
import { FiltersPanelComponent } from './features/filters-panel/filters-panel.component';
import { GenreChartComponent } from './features/genre-chart/genre-chart.component';
import { KpiCardsComponent } from './features/kpi-cards/kpi-cards.component';
import { SubgenreChartComponent } from './features/subgenre-chart/subgenre-chart.component';
import { YearChartComponent } from './features/year-chart/year-chart.component';

/** Componente raíz: orquesta el layout del dashboard de la colección de música de Pangea. */
@Component({
  selector: 'app-root',
  imports: [
    FiltersPanelComponent,
    KpiCardsComponent,
    GenreChartComponent,
    CountryChartComponent,
    SubgenreChartComponent,
    YearChartComponent,
    AlbumsTableComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly dataService = inject(MusicDataService);

  readonly loading = this.dataService.loading;
  readonly error = this.dataService.error;
}
