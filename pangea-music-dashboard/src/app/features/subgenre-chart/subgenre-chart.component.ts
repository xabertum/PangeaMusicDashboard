import { Component, computed, inject } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CHART_MUTED, colorPorIndice } from '../../core/chart-palette';
import { MusicDataService } from '../../core/services/music-data.service';

/**
 * Gráfico de barras horizontal con el top de subgéneros por número de álbumes.
 * Al hacer clic en un subgénero se filtra el resto del dashboard (KPIs, otros
 * gráficos y la tabla de detalle) por ese subgénero; un segundo clic lo deselecciona.
 */
@Component({
  selector: 'app-subgenre-chart',
  imports: [BaseChartDirective],
  templateUrl: './subgenre-chart.component.html',
  styleUrl: './subgenre-chart.component.scss'
})
export class SubgenreChartComponent {
  private readonly dataService = inject(MusicDataService);

  readonly chartType = 'bar' as const;

  private readonly datosOrdenados = computed(() => [...this.dataService.datosPorSubgenero()].reverse());

  /** Subgénero actualmente seleccionado desde este gráfico (solo si hay una única selección activa). */
  readonly subgeneroSeleccionado = computed(() => {
    const subgeneros = this.dataService.filters().subgeneros;
    return subgeneros.length === 1 ? subgeneros[0] : null;
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const datos = this.datosOrdenados();
    const seleccionado = this.subgeneroSeleccionado();
    return {
      labels: datos.map((d) => d.label),
      datasets: [
        {
          label: 'Álbumes',
          data: datos.map((d) => d.value),
          backgroundColor: datos.map((d, i) =>
            seleccionado && d.label !== seleccionado ? CHART_MUTED : colorPorIndice(i)
          ),
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
    const subgenero = this.datosOrdenados()[active[0].index]?.label;
    if (!subgenero) {
      return;
    }
    const actuales = this.dataService.filters().subgeneros;
    const yaEsUnicaSeleccion = actuales.length === 1 && actuales[0] === subgenero;
    this.dataService.actualizarFiltros({ subgeneros: yaEsUnicaSeleccion ? [] : [subgenero] });
  }

  limpiarSeleccion(): void {
    this.dataService.actualizarFiltros({ subgeneros: [] });
  }
}
