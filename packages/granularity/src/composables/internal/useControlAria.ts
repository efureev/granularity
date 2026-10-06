import { type ClassValue, normalizeClass, normalizeStyle, type StyleValue, useAttrs } from 'vue'

/**
 * ARIA-связи, которые потребитель вешает на контрол, — на элемент с ролью.
 *
 * Контрол с обёрткой отдавал `aria-describedby` потребителя корню-`div`, где
 * атрибут ничего не значит, а у контролов, где роль стоит на корне или атрибуты
 * пробрасываются в поле, одно затирало другое: id подсказки `GrFormField` либо
 * id потребителя. Здесь три связи — описание, подпись и сообщение об ошибке —
 * уходят с корня и складываются с собственными id контрола на виджете.
 *
 * Функции, а не `computed`: `$attrs` не реактивен, и закэшированное значение
 * пережило бы смену атрибута у родителя. Шаблон зовёт их на каждом рендере.
 */

const ROUTED = ['aria-describedby', 'aria-labelledby', 'aria-errormessage'] as const

type RoutedAttr = typeof ROUTED[number]

function camel(name: string): string {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

const ROUTED_KEYS = new Set<string>(ROUTED.flatMap(name => [name, camel(name)]))

/** Id через пробел — без повторов и пустот; ничего не осталось — `undefined`. */
export function joinIds(...lists: unknown[]): string | undefined {
  const ids = lists.flatMap(list => (typeof list === 'string' ? list.split(/\s+/) : [])).filter(Boolean)

  return ids.length > 0 ? [...new Set(ids)].join(' ') : undefined
}

/** Утилита ширины в классе: `w-48`, `sm:w-1/2`, `!w-[16rem]` — но не `min-w-0` и не `max-w-xs`. */
const WIDTH_CLASS = /(?:^|\s)(?:[\w-]+:)*!?w-/

/** Свойство `width` в строке стиля — не `min-width` и не `max-width`. */
const WIDTH_DECLARATION = /(?:^|;)\s*width\s*:/

/** Задал ли потребитель ширину: классом `w-*` или `width` в `style`. */
export function ownsWidth(cls: unknown, style: unknown): boolean {
  if (WIDTH_CLASS.test(normalizeClass(cls)))
    return true

  const normalized = normalizeStyle(style)
  if (typeof normalized === 'string')
    return WIDTH_DECLARATION.test(normalized)

  return normalized !== undefined && normalized.width !== undefined && normalized.width !== ''
}

export interface ControlAria {
  /** Атрибуты для корня или поля — без трёх связей, ушедших на виджет. */
  rootAttrs: () => Record<string, unknown>
  /**
   * Атрибуты нативного поля у контрола с рамкой-обёрткой: без трёх связей и
   * без `class`/`style`. Раскладка — забота корня, а `aria-*`, `data-*`,
   * `autocapitalize` значат что-то только на самом поле.
   */
  fieldAttrs: () => Record<string, unknown>
  /** `class` и `style` потребителя — для корня, который держит рамку и ширину. */
  layoutAttrs: () => { class?: ClassValue, style?: StyleValue }
  /**
   * Потребитель задал ширину сам — классом `w-*` или `width` в `style`. Тогда
   * корень не ставит свой `w-full`: ширина по умолчанию — умолчание, а не то, с
   * чем потребителю приходится бороться порядком утилит.
   */
  ownsWidth: () => boolean
  /** `aria-describedby` потребителя вместе со своими id контрола. */
  describedBy: (...own: unknown[]) => string | undefined
  /** `aria-labelledby` потребителя вместе со своими id контрола. */
  labelledBy: (...own: unknown[]) => string | undefined
  /** `aria-errormessage` потребителя. */
  errorMessage: () => string | undefined
}

export function useControlAria(): ControlAria {
  const attrs = useAttrs()

  function read(name: RoutedAttr): unknown {
    return attrs[name] ?? attrs[camel(name)]
  }

  return {
    rootAttrs: () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !ROUTED_KEYS.has(key))),
    fieldAttrs: () => Object.fromEntries(Object.entries(attrs).filter(([key]) => !ROUTED_KEYS.has(key) && key !== 'class' && key !== 'style')),
    layoutAttrs: () => ({ class: attrs.class, style: attrs.style }),
    ownsWidth: () => ownsWidth(attrs.class, attrs.style),
    describedBy: (...own) => joinIds(read('aria-describedby'), ...own),
    labelledBy: (...own) => joinIds(read('aria-labelledby'), ...own),
    errorMessage: () => joinIds(read('aria-errormessage')),
  }
}
