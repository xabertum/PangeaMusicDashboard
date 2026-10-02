import { Component, computed, inject } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { colorPorIndice } from '../../core/chart-palette';
import { MusicDataService } from '../../core/services/music-data.service';

/** Gráfico de evolución del número de álbumes publicados por década. */
@Component({
  selector: 'app-year-chart',
  imports: [BaseChartDirective],
  templateUrl: './year-chart.component.html',
  styleUrl: './year-chart.component.scss'
})
export class YearChartComponent {
  private readonly dataService = inject(MusicDataService);

  readonly chartType = 'line' as const;

  /** Década actualmente seleccionada desde este gráfico. */
  readonly decadaSeleccionada = computed(() => {
    const { anioMin, anioMax } = this.dataService.filters();
    return anioMin !== null && anioMax === anioMin + 9 ? anioMin : null;
  });

  readonly chartData = computed<ChartData<'line'>>(() => {
    const datos = this.dataService.datosPorDecada();
    return {
      labels: datos.map((d) => d.label),
      datasets: [
        {
          label: 'Álbumes',
          data: datos.map((d) => d.value),
          borderColor: '#93acc4',
          backgroundColor: 'rgba(147, 172, 196, 0.25)',
          pointBackgroundColor: datos.map((_, i) => colorPorIndice(i)),
          pointBorderColor: '#ffffff',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  onChartClick(event: { event?: ChartEvent; active?: object[] }): void {
    const active = event.active as Array<{ index: number }> | undefined;
    if (!active || active.length === 0) {
      return;
    }
    const etiqueta = this.dataService.datosPorDecada()[active[0].index]?.label;
    const decada = etiqueta ? Number.parseInt(etiqueta, 10) : Number.NaN;
    if (Number.isNaN(decada)) {
      return;
    }
    const { anioMin, anioMax } = this.dataService.filters();
    const yaEsLaSeleccion = anioMin === decada && anioMax === decada + 9;
    this.dataService.actualizarFiltros(
      yaEsLaSeleccion ? { anioMin: null, anioMax: null } : { anioMin: decada, anioMax: decada + 9 }
    );
  }

  limpiarSeleccion(): void {
    this.dataService.actualizarFiltros({ anioMin: null, anioMax: null });
  }
}
