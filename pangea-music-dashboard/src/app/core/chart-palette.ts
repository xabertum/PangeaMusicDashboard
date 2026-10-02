/** Paleta pastel compartida por los gráficos (Chart.js no resuelve variables CSS). */
export const CHART_PALETTE = [
  '#8fae9c', // salvia
  '#93acc4', // azul bruma
  '#d3b98c', // arena
  '#b9a6c2'  // lavanda grisácea
];

/** Color de las barras no seleccionadas cuando hay un filtro activo. */
export const CHART_MUTED = '#e9e8e2';

export function colorPorIndice(indice: number): string {
  return CHART_PALETTE[indice % CHART_PALETTE.length];
}
