// Три класса тулбара лежат литералами в `grDashboardToolbarStyles.ts`, и granum
// извлекает их сам. Кнопки — `GrButton` ядра, их классы приходят с
// зависимостью. Раму тулбар не рендерит: её список, подмешанный сюда при
// UnoCSS-пресете, приносил классы, которыми он не пользуется.
export const grDashboardToolbarSafelist: string[] = []
