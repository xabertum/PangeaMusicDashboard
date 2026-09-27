import { Component, computed, inject } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MusicDataService } from '../../core/services/music-data.service';

const COLOR_BASE = '#9aaa9b';
const COLOR_ATENUADO = '#e6ece5';

/**
 * Gráfico de barras horizontal con el top de países por número de álbumes.
 * Al hacer clic en un país se filtra el resto del dashboard (KPIs, otros
 * gráficos y la tabla de detalle) por ese país; un segundo clic lo deselecciona.
 */
@Component({
  selector: 'app-country-chart',
  imports: [BaseChartDirective],
  templateUrl: './country-chart.component.html',
  styleUrl: './country-chart.component.scss'
})
export class CountryChartComponent {
  private readonly dataService = inject(MusicDataService);

  readonly chartType = 'bar' as const;

  private readonly datosOrdenados = computed(() => [...this.dataService.datosPorPais()].reverse());

  /** País actualmente seleccionado desde este gráfico (solo si hay una única selección activa). */
  readonly paisSeleccionado = computed(() => {
    const paises = this.dataService.filters().paises;
    return paises.length === 1 ? paises[0] : null;
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const datos = this.datosOrdenados();
    const seleccionado = this.paisSeleccionado();
    return {
      labels: datos.map((d) => d.label),
      datasets: [
        {
          label: 'Álbumes',
          data: datos.map((d) => d.value),
          backgroundColor: datos.map((d) =>
            seleccionado && d.label !== seleccionado ? COLOR_ATENUADO : COLOR_BASE
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
    const pais = this.datosOrdenados()[active[0].index]?.label;
    if (!pais) {
      return;
    }
    const actuales = this.dataService.filters().paises;
    const yaEsUnicaSeleccion = actuales.length === 1 && actuales[0] === pais;
    this.dataService.actualizarFiltros({ paises: yaEsUnicaSeleccion ? [] : [pais] });
  }

  limpiarSeleccion(): void {
    this.dataService.actualizarFiltros({ paises: [] });
  }
}
