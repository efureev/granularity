// Поле пикера — классы общего `internal/pickerFieldStyles.ts`, ряд готовых
// периодов — `internal/presetRowStyles.ts`, панель и колонки —
// `grTimePickerStyles.ts`, где `timeOptionClass` склеивает готовые строки, а не
// части классов. Всё это целые литералы, и granum извлекает их сам из чанков
// компонента, общие включительно: до `internal/` он доходит по графу бандла.
// Перечислять их здесь заставлял UnoCSS-пресет, который общий чанк не
// сканировал.
export const grTimePickerSafelist: string[] = []
