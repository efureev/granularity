// Всё, что рисует палитра, лежит в коде целыми литералами — в шаблоне, в
// `grDashboardPaletteStyles.ts` и в призраке переноса из
// `GrDashboardFrame/shared/` с классами `frameStyles.ts`. granum извлекает их
// сам из чанков компонента, общие включительно: до рамы он доходит по графу
// бандла. Список рамы `dashboardFrameSafelist` был нужен UnoCSS-пресету,
// который общий чанк не сканировал.
export const grDashboardPaletteSafelist: string[] = []
