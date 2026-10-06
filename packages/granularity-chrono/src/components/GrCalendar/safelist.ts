// Всё, что рисует календарь, лежит в коде целыми литералами — в шаблоне и в
// `grCalendarStyles.ts`: `calendarDayClass`, `calendarPeriodClass` и
// `calendarRangeCellClass` склеивают готовые строки, а не части классов. granum
// извлекает их сам из чанков компонента, общие включительно.
export const grCalendarSafelist: string[] = []
