/**
 * Публичная точка входа к строкам пакета.
 *
 * Реализация живёт в `internal/granularityI18n.ts` и остаётся внутренней: там
 * же `resolveGranularityI18n` — резолвер адаптера для кода вне `setup`, который
 * публичным контрактом не является. Наружу выходит только то, что нужно
 * потребителю и companion-пакетам: сам композабл и тип адаптера.
 *
 * Файл-фасад, а не переезд: `internal/granularityI18n` импортируют 55 файлов
 * пакета, и переписывание путей ради смены директории — риск без выгоды.
 */
export { useGranularityTranslations } from '../internal/granularityI18n'
export type { GranularityI18nLike } from '../internal/granularityI18n'
