import type { Ref } from 'vue'

export interface UseFocusWithinOptions {
  /** Фокус пришёл снаружи внутрь. */
  enter?: (event: FocusEvent) => void
  /** Фокус ушёл изнутри наружу. */
  leave?: (event: FocusEvent) => void
  /**
   * Узлы, которые считаются частью контрола, хотя лежат вне корня. Нужны там,
   * где панель телепортирована в `body`, а фокус в неё уходит по-настоящему:
   * без них переход в поле фильтра открытой панели выглядел бы уходом наружу.
   */
  containers?: () => (HTMLElement | null | undefined)[]
}

export interface UseFocusWithinHandlers {
  onFocusIn: (event: FocusEvent) => void
  onFocusOut: (event: FocusEvent) => void
}

/**
 * Граница фокуса составного контрола.
 *
 * Нативные `focus`/`blur` не всплывают, поэтому у группы (радиогруппа,
 * сегменты, набор чекбоксов) их не поймать на корне вовсе — всплывают только
 * `focusin`/`focusout`. Но всплывают они и когда фокус переезжает **внутри**
 * группы: между её пунктами, с поля на его же кнопку очистки. Для потребителя
 * это не уход и не приход — контрол всё это время в фокусе, — а необработанный
 * переход дал бы `blur` + `focus` на каждую стрелку клавиатуры.
 *
 * Поэтому событие считается состоявшимся, только если `relatedTarget` лежит вне
 * корня. `relatedTarget: null` (клик по body, уход из окна, программный фокус)
 * — тоже пересечение границы.
 */
export function useFocusWithin(
  root: Ref<HTMLElement | null>,
  options: UseFocusWithinOptions,
): UseFocusWithinHandlers {
  function crossedBoundary(event: FocusEvent): boolean {
    const other = event.relatedTarget as Node | null
    if (!other) return true

    if (root.value?.contains(other)) return false

    return !options.containers?.().some(node => node?.contains(other))
  }

  return {
    onFocusIn(event) {
      if (crossedBoundary(event)) options.enter?.(event)
    },
    onFocusOut(event) {
      if (crossedBoundary(event)) options.leave?.(event)
    },
  }
}
