/** Paleta pastel multicolor compartida por los gráficos (Chart.js no resuelve variables CSS). */
export const CHART_PALETTE = [
  '#8fb3a0', // salvia
  '#e2a99b', // coral suave
  '#8eb0d1', // azul cielo
  '#e8c77f', // mostaza pastel
  '#b3a0cc', // lavanda
  '#a5c490', // verde hoja
  '#e0a8c0', // rosa
  '#7fbfbf', // turquesa
  '#d9b08a', // arena tostada
  '#9da9d6', // índigo suave
  '#c6c27e', // oliva claro
  '#cf9fb0'  // malva
];

/** Color de las barras no seleccionadas cuando hay un filtro activo. */
export const CHART_MUTED = '#e9e8e2';

export function colorPorIndice(indice: number): string {
  return CHART_PALETTE[indice % CHART_PALETTE.length];
}
