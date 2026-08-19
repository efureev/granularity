/**
 * Хелперы тестов компонента — `@feugene/granularity-test-kit/vue`.
 *
 * Здесь то, что не знает про дизайн-систему и потому может жить вне ядра.
 * DS-зависимое — `granularityGlobal`, `announced`, `resetGranularityDom` —
 * остаётся в `@feugene/granularity/testing`: оно ходит во внутренности ядра, и
 * переезд сюда замкнул бы зависимость в цикл, ведь ядро само зовёт фабрики
 * этого пакета.
 */
export { nextFrame } from './frames'
export { stubElementRects, type StubRectInit } from './geometry'
export { queryOne, queryWrapper } from './dom'
export { fintI18nGlobal } from './i18n'
