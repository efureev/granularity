// Поле пикера — классы общего `internal/pickerFieldStyles.ts`, ряд готовых
// периодов — `internal/presetRowStyles.ts`, строка времени —
// `grDateRangePickerStyles.ts`. Всё это целые литералы, и granum извлекает их
// сам из чанков компонента, общие включительно: до `internal/` он доходит по
// графу бандла. Перечислять их здесь заставлял UnoCSS-пресет, который общий
// чанк не сканировал. Сетку и полосу диапазона рисует `GrCalendar`, колонки
// времени — `GrTimePicker`: их классы приходят с зависимостями.
export const grDateRangePickerSafelist: string[] = []
