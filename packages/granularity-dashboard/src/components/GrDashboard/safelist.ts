// Всё, что рисует доска, лежит в коде целыми литералами — в шаблоне и в раме:
// шаблонах `GrDashboardFrame/shared/` и `frameStyles.ts`. granum извлекает их
// сам из чанков компонента, общие включительно: до рамы он доходит по графу
// бандла. Список рамы `dashboardFrameSafelist` был нужен UnoCSS-пресету,
// который общий чанк не сканировал.
export const grDashboardSafelist: string[] = []
