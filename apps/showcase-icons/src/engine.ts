import type { GranumRule } from '@feugene/granum/engine'
import { icons as lucide } from '@iconify-json/lucide'

/**
 * Правила иконок `i-lucide-*` — пакетом-провайдером, а не опцией движка витрины.
 *
 * Зачем они вообще. granum своей реализации движка не содержит, а
 * `@feugene/granum-engine-wind` вендорит `preset-wind3` — правил иконок в нём
 * нет. Витрина пользуется классами `i-lucide-*` в семи десятках мест, и это не
 * декоратизм: демо показывают потребителю, как ставить иконку классом.
 *
 * Почему провайдером. Правила, переданные фабрике движка приложением
 * (`windEngine({ rules })`), меняют отпечаток его словаря. Отпечаток перестаёт
 * совпадать с пакетным, и granum честно пересчитывает классы ВСЕХ пакетов по их
 * файлам — на витрине это было 547 мс каждой сборки при нулевой разнице в
 * результате (`lost` и `gained` пусты). Правила, приехавшие ОТ провайдера,
 * отпечаток приложения не трогают: они добавляются ко входу генератора, а
 * словарь движка остаётся ванильным, и манифестам снова верят (A-E3, E-9).
 *
 * Что правило делает. Данные иконок берутся из `@iconify-json/lucide`. Тело
 * иконки оборачивается в SVG и подставляется маской, чтобы иконка красилась
 * `currentColor`. Форма вывода повторяет то, что эмитил `presetIcons`:
 * переменная `--un-icon`, маска на неё, заливка `currentColor` и размер в `em`.
 *
 * Чего НЕ делает: не ходит в сеть, не поддерживает другие наборы, не знает про
 * режим `bg` для многоцветных иконок.
 */

interface IconifySet {
  readonly width?: number
  readonly height?: number
  readonly icons: Readonly<Record<string, { readonly body: string, readonly width?: number, readonly height?: number }>>
}

/*
 * Набор импортируется из ESM-входа пакета, а не читается с диска и не берётся
 * прямым импортом JSON. Первое запрещено границей browser/node (B-16), второе
 * не живёт после сборки: бандлер срезает атрибут `with { type: 'json' }`, и Node
 * отказывается загружать модуль. `index.mjs` пакета делает это сам и остаётся
 * внешним — двухмегабайтный набор в бандл не попадает.
 */
const icons = lucide as unknown as IconifySet

/** Масштаб иконки в `em` — тот же, что стоял у `presetIcons` в конфиге витрины. */
const SCALE = 1.05

function svgDataUrl(name: string): string | undefined {
  const icon = icons.icons[name]
  if (!icon)
    return undefined

  const width = icon.width ?? icons.width ?? 24
  const height = icon.height ?? icons.height ?? 24
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
 * Имя экспорта значимо: granum импортирует модуль из `engine.module` манифеста
 * и берёт у него `rules`, `variants` и `preflights` (M-E4). Экспорт под другим
 * именем грузится успешно и молча ничего не даёт: отчёт пишет
 * `rulesLoaded: true`, а иконки исчезают из CSS.
 *
 * Имя, которого нет в наборе, правило не обслуживает: `undefined` означает
 * «правило не совпало», и класс уезжает в `classes.unmatched` отчёта сборки.
 * Это лучше пустой иконки — опечатка в имени видна, а не превращается в
 * невидимый квадрат.
 */
export const rules: readonly GranumRule[] = [
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
