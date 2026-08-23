import { createGenerator, presetMini } from 'unocss'
import { presetGranular } from '@feugene/unocss-preset-granular'
import { describe, expect, it } from 'vitest'

/**
 * Гейт утилит, которых нет в `presetMini`.
 *
 * Пакет не собирает CSS сам: финальные утилиты генерирует приложение через
 * `presetGranular` поверх `presetMini`. Класс, которого нет ни там, ни там,
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
    const uno = await createGenerator({
      presets: [presetMini(), presetGranular({ providers: [], components: [] })],
    })

    const missing: string[] = []

    for (const utility of UTILITIES_BEYOND_MINI) {
      const { matched } = await uno.generate(utility, { preflights: false })
      if (matched.size === 0)
        missing.push(utility)
    }

    expect(missing, `не генерируются: ${missing.join(', ')}`).toEqual([])
  })

  it('чистый presetMini их не знает — иначе список бессмыслен', async () => {
    const mini = await createGenerator({ presets: [presetMini()] })

    const covered: string[] = []

    for (const utility of UTILITIES_BEYOND_MINI) {
      const { matched } = await mini.generate(utility, { preflights: false })
      if (matched.size > 0)
        covered.push(utility)
    }

    expect(covered, `уже есть в presetMini, из списка можно убрать: ${covered.join(', ')}`).toEqual([])
  })
})
