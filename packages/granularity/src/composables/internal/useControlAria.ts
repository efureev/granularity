import { useAttrs } from 'vue'

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

export interface ControlAria {
  /** Атрибуты для корня или поля — без трёх связей, ушедших на виджет. */
  rootAttrs: () => Record<string, unknown>
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
    describedBy: (...own) => joinIds(read('aria-describedby'), ...own),
    labelledBy: (...own) => joinIds(read('aria-labelledby'), ...own),
    errorMessage: () => joinIds(read('aria-errormessage')),
  }
}
