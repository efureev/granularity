import type { GranumRule } from '@feugene/granum/engine'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

/**
 * Правило иконок для фабрики движка витрины.
 *
 * Зачем оно вообще. granum своей реализации движка не содержит, а
 * `@feugene/granum-engine-wind` вендорит `preset-mini` — в нём правил иконок
 * нет. Витрина же пользуется классами `i-lucide-*` в семи десятках мест, и это
 * не декоратизм: демо показывают потребителю, как ставить иконку классом.
 * Убрать классы значит переписать демо на компонентную форму и заодно перестать
 * показывать то, чем потребитель пользуется.
 *
 * Поэтому правило живёт здесь и уезжает в движок через фабрику
 * (`windEngine({ rules })`) — ровно тот шов, который granum для этого и
 * оставляет: у конфига поля для правил нет, правила принадлежат движку.
 *
 * Что оно делает. Данные иконок берутся из `@iconify-json/lucide` — того же
 * пакета, из которого их брал `presetIcons`. Тело иконки оборачивается в SVG и
 * подставляется маской, чтобы иконка красилась `currentColor`. Форма вывода
 * повторяет то, что эмитил пресет: переменная `--un-icon`, маска на неё,
 * заливка `currentColor` и размер в `em`.
 *
 * Чего оно НЕ делает: не ходит в сеть, не поддерживает другие наборы, не знает
 * про режим `bg` для многоцветных иконок. Всё это у `presetIcons` есть, и когда
 * витрине понадобится, дешевле взять адаптер над настоящим UnoCSS, чем
 * дописывать пресет здесь.
 */

interface IconifySet {
  readonly width?: number
  readonly height?: number
  readonly icons: Readonly<Record<string, { readonly body: string, readonly width?: number, readonly height?: number }>>
}

const require = createRequire(import.meta.url)

/** Набор читается один раз на сборку: это JSON на пару мегабайт. */
const lucide = JSON.parse(
  readFileSync(require.resolve('@iconify-json/lucide/icons.json'), 'utf8'),
) as IconifySet

/** Масштаб иконки в `em` — тот же, что стоял у `presetIcons` в конфиге витрины. */
const SCALE = 1.05

function svgDataUrl(name: string): string | undefined {
  const icon = lucide.icons[name]
  if (!icon)
    return undefined

  const width = icon.width ?? lucide.width ?? 24
  const height = icon.height ?? lucide.height ?? 24
  const svg = `<svg viewBox='0 0 ${width} ${height}' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg'>${icon.body}</svg>`

  // Кодируется всё, что ломает `url("…")` или разбор CSS: процент первым
  // (иначе он испортит уже вставленные последовательности), затем угловые
  // скобки, решётка и двойная кавычка. Кавычку кодировать обязательно: в теле
  // иконок Iconify атрибуты пишутся через двойные (`fill="none"`), и без этого
  // строка `url("…")` обрывается на первом же из них — минификатор CSS падает
  // на `Unexpected token Ident("none")`, и это единственное место, где такая
  // ошибка вообще возможна.
  const encoded = svg
    .replace(/%/g, '%25')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/#/g, '%23')
    .replace(/"/g, '%22')
  return `url("data:image/svg+xml;utf8,${encoded}")`
}

/**
 * `i-lucide-<name>` → иконка маской.
 *
 * Имя, которого нет в наборе, правило не обслуживает: `undefined` означает
 * «правило не совпало», и класс уезжает в `classes.unmatched` отчёта сборки.
 * Это лучше пустой иконки — опечатка в имени видна, а не превращается в
 * невидимый квадрат.
 */
export const lucideIconRules: readonly GranumRule[] = [
  [/^i-lucide-(.+)$/, (match) => {
    const icon = svgDataUrl(match[1])
    if (!icon)
      return undefined
    return {
      '--un-icon': icon,
      '-webkit-mask': 'var(--un-icon) no-repeat',
      'mask': 'var(--un-icon) no-repeat',
      '-webkit-mask-size': '100% 100%',
      'mask-size': '100% 100%',
      'background-color': 'currentColor',
      'color': 'inherit',
      'display': 'inline-block',
      'width': `${SCALE}em`,
      'height': `${SCALE}em`,
    }
  }],
]
