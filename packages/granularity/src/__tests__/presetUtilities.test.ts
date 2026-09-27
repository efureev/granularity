import { miniEngine } from '@feugene/granum-engine-mini'
import { describe, expect, it } from 'vitest'

/**
 * Гейт утилит, которых нет в `presetMini`.
 *
 * Пакет не собирает CSS сам: финальные утилиты генерирует приложение через
 * доп-правила поверх preset-mini. Класс, которого нет ни там, ни там,
 * молча не превращается в CSS — сборка зелёная, типы целы, а увидит это только
 * тот, кто откроет страницу. Так `sr-only` (утилита `presetWind`, не `presetMini`)
 * показывал «скрытые» caption у `GrTable` и a11y-title у `GrDialog` обычным
 * текстом всем потребителям сразу.
 *
 * Утилиты сверх `presetMini` пресет добирает из `@feugene/unocss-mini-extra-rules`
 * (`includeExtraRules`, по умолчанию включено). Здесь проверяется именно связка,
 * которую собирает потребитель: снятое upstream правило или выключенная опция
 * ломают разметку пакета, и узнать об этом надо тестом, а не глазами.
 *
 * Список — то, чем пакет реально пользуется сверх `presetMini`. Добавляя такую
 * утилиту в компонент, добавляйте её сюда.
 */
const UTILITIES_BEYOND_MINI = [
  // a11y: визуально скрытый текст (GrTable, GrDialog, GrDataTable).
  'sr-only',
  'not-sr-only',
  // Спиннер: GrLoading, GrDataTable, GrFileUpload.
  'animate-spin',
  // Типографика заголовков групп: GrDropdownMenu.
  'uppercase',
  // Раскладка: GrDataTable, GrCollapse, GrList.
  'divide-y',
  'divide-x',
  'space-y-1',
  // Оверлеи: GrModal, GrDrawer.
  'backdrop-blur-sm',
  // Кадрирование картинок: GrAvatar, GrImageViewer, GrFileUpload, GrFormFile.
  // Приехали в extra-rules 0.7.0; до неё классы лежали в разметке мёртвыми, и
  // непропорциональный снимок растягивался вместо кадрирования.
  'object-cover',
  'object-contain',
  // Табличные цифры: счётчики GrInput/GrTextarea, проценты GrProgressBar и
  // GrProgressCircle, номера страниц GrPagination, значения GrStatistic,
  // GrColorPicker, GrKbd, GrRating, GrTimeline, GrFileUpload. Приехали в
  // extra-rules 0.8.0; до неё пакет писал ту же запись arbitrary-значением —
  // `[font-variant-numeric:…]` — в семнадцати местах.
  'tabular-nums',
] as const

describe('утилиты сверх presetMini', () => {
  it('генерируются связкой, которую собирает потребитель', async () => {
    const engine = miniEngine()
    const { unmatched } = await engine.generate({ classes: new Set(UTILITIES_BEYOND_MINI) })
    const missing = [...unmatched]

    expect(missing, `не генерируются: ${missing.join(', ')}`).toEqual([])
  })

  it('чистый presetMini их не знает — иначе список бессмыслен', async () => {
    // Тот же движок без доп-правил — это и есть «чистый presetMini» granum.
    const mini = miniEngine({ extraRules: false })
    const { matched } = await mini.generate({ classes: new Set(UTILITIES_BEYOND_MINI) })
    const covered = [...matched.keys()]

    expect(covered, `уже есть в presetMini, из списка можно убрать: ${covered.join(', ')}`).toEqual([])
  })
})
