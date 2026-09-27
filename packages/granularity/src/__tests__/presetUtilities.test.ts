import { windEngine } from '@feugene/granum-engine-wind'
import { describe, expect, it } from 'vitest'

/**
 * Гейт утилит, на которые пакет опирается, но CSS для которых не собирает сам.
 *
 * Финальные утилиты генерирует приложение своим движком. Класс, которого движок
 * не знает, молча не превращается в CSS — сборка зелёная, типы целы, а увидит
 * это только тот, кто откроет страницу. Так `sr-only` показывал «скрытые»
 * caption у `GrTable` и a11y-title у `GrDialog` обычным текстом всем
 * потребителям сразу; так же, пока движок вендорил `preset-mini`, таблицы
 * графиков рисовались двойной рамкой (`border-collapse`), а палитра доски — с
 * маркерами списка (`list-none`).
 *
 * Здесь проверяется связка, которую собирает потребитель: снятое upstream
 * правило или движок более узкого словаря ломают разметку пакета, и узнать об
 * этом надо тестом, а не глазами. Добавляя в компонент утилиту, которой пакет
 * раньше не пользовался, добавляйте её сюда.
 */
const UTILITIES_THE_PACKAGE_RELIES_ON = [
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
  // Рамки таблиц: GrTable, GrDataTable, таблицы granularity-charts, GrCalendar.
  'border-collapse',
  // Списки без маркеров: GrDashboardPalette, GrDropdownMenu, GrTree.
  'list-none',
  // Кадрирование жестом: GrImageCrop, GrSlider, GrCarousel — без него тач-драг
  // скроллит страницу вместо перетаскивания.
  'touch-none',
  // Прокрутка списка опций к активному элементу: GrTimePicker, GrSelect.
  'scroll-py-1',
] as const

describe('утилиты, на которые опирается пакет', () => {
  it('генерируются связкой, которую собирает потребитель', async () => {
    const engine = windEngine()
    const { unmatched } = await engine.generate({ classes: new Set(UTILITIES_THE_PACKAGE_RELIES_ON) })
    const missing = [...unmatched]

    expect(missing, `не генерируются: ${missing.join(', ')}`).toEqual([])
  })

  /**
   * Пакет объявляет диалект `unocss/preset-wind3+granum@66`, а не просто wind3, и
   * `+granum` стоит там ровно из-за одного правила — альфы на произвольном цвете.
   * Без него класс совпадает, но `/55` теряется молча: `--gr-overlay-bg` теряет
   * прозрачность, и оверлей GrModal перестаёт быть полупрозрачным.
   *
   * Гейт держит связку «объявленный диалект ↔ то, что он обещает»: если правило
   * уедет из движка, диалект пакета станет ложью, и увидеть это надо здесь.
   */
  it('`+granum` в диалекте пакета означает альфу на произвольном цвете', async () => {
    const token = 'bg-[var(--gr-overlay-bg)]/55'

    const withRule = await windEngine().generate({ classes: new Set([token]) })
    expect(withRule.css).toContain('color-mix(in srgb, var(--gr-overlay-bg) 55%, transparent)')

    const withoutRule = await windEngine({ extraRules: false }).generate({ classes: new Set([token]) })
    expect(withoutRule.css).toContain('background-color:var(--gr-overlay-bg);')
    expect(withoutRule.css).not.toContain('color-mix')
  })
})
