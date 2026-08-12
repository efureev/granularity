export { default } from './GrCalendar.vue'
export { default as GrCalendar } from './GrCalendar.vue'
export { grCalendarConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCalendarConfigurableProps } from './defaults'
export type { GrCalendarSize } from './grCalendarStyles'
export { grCalendarSafelist } from './safelist'
export type { GrCalendarEmits, GrCalendarProps } from './GrCalendar.vue'
