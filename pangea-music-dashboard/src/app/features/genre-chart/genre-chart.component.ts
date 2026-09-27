import { Component, computed, inject } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MusicDataService } from '../../core/services/music-data.service';

const PALETTE = [
  '#7d9083', '#9aaa9b', '#a89f82', '#87978e', '#b2a990',
  '#748b7c', '#a9b4a1', '#948c78', '#8aa09b', '#aaa586',
  '#879a80', '#71857c', '#a3a28d', '#9aa899', '#7b8974', '#b0af9b'
];

/** Gráfico de barras con la distribución de álbumes por género/continente. */
@Component({
  selector: 'app-genre-chart',
  imports: [BaseChartDirective],
  templateUrl: './genre-chart.component.html',
  styleUrl: './genre-chart.component.scss'
})
export class GenreChartComponent {
  private readonly dataService = inject(MusicDataService);

  readonly chartType = 'bar' as const;

  /** Género actualmente seleccionado desde este gráfico (solo si hay una única selección activa). */
  readonly generoSeleccionado = computed(() => {
    const generos = this.dataService.filters().generos;
    return generos.length === 1 ? generos[0] : null;
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const datos = this.dataService.datosPorGenero();
    return {
      labels: datos.map((d) => d.label),
      datasets: [
        {
          label: 'Álbumes',
          data: datos.map((d) => d.value),
          backgroundColor: datos.map((_, i) => PALETTE[i % PALETTE.length]),
          borderRadius: 6
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    onHover: (event, elements) => {
      const target = event.native?.target as HTMLElement | undefined;
      if (target) {
        target.style.cursor = elements.length ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  onChartClick(event: { event?: ChartEvent; active?: object[] }): void {
    const active = event.active as Array<{ index: number }> | undefined;
    if (!active || active.length === 0) {
      return;
    }
    const genero = this.dataService.datosPorGenero()[active[0].index]?.label;
    if (!genero) {
      return;
    }
    const actuales = this.dataService.filters().generos;
    const yaEsUnicaSeleccion = actuales.length === 1 && actuales[0] === genero;
    this.dataService.actualizarFiltros({ generos: yaEsUnicaSeleccion ? [] : [genero] });
  }

  limpiarSeleccion(): void {
    this.dataService.actualizarFiltros({ generos: [] });
  }
}
