import type { Ref } from 'vue'
import { nextTick, onScopeDispose, watch } from 'vue'

import { getFocusableElementsIn, isFocusable } from './internal/focusables'

export interface UseFocusTrapOptions {
  /**
   * Работает ли ловушка сейчас. Геттер, а не значение: модальное окно держит
   * фокус, только пока оно верхнее в стеке слоёв, — иначе нижнее окно отбирало
   * бы фокус у открытого поверх него.
   */
  active?: () => boolean
  /** Кому отдать фокус при активации. Не задан или не фокусируем — первый в контейнере. */
  initialFocus?: () => HTMLElement | null | undefined
  /**
   * Запасной приёмник фокуса, когда фокусировать внутри нечего: обычно сама
   * панель с `tabindex="-1"`. Без него фокус остался бы снаружи, и Tab увёл бы
   * пользователя на страницу под окном.
   */
  fallbackFocus?: () => HTMLElement | null | undefined
  /**
   * Дополнительные корни, которые считаются частью слоя. Панель селекта,
   * открытого внутри окна, телепортирована в `body` и лежит вне поддерева
   * контейнера — без этого списка ловушка отбирала бы у неё фокус.
   */
  containers?: () => (HTMLElement | null | undefined)[]
  /**
   * Возвращать фокус туда, где он был до активации. По умолчанию — да.
   * Оверлеи пакета выключают: возврат делает стек слоёв по более строгому
   * правилу (только если фокус на момент закрытия ещё внутри слоя).
   */
  restoreFocus?: boolean
}

/**
 * Ловушка фокуса: пока активна, Tab ходит по кругу внутри слоя, а фокус,
 * утёкший наружу, возвращается обратно.
 *
 * Реализована на `keydown` и `focusin`, **без sentinel-узлов**: распространённый
 * подход с двумя focus-guard кнопками по краям кладёт в разметку интерактивные
 * элементы, а внутрь контейнера с ARIA-ролью их класть нельзя — роль объявляет
 * потомков презентационными (axe: `nested-interactive`).
 *
 * Слой из ловушки не выводится: порядок окон, Esc и `inert` — забота
 * `useOverlayLayer`. Композиция такая:
 *
 * ```ts
 * const layer = useOverlayLayer(open, close, { modal: true, root: panelRef })
 * useFocusTrap(panelRef, {
 *   active: () => open.value && isTopmost.value,
 *   containers: layer.rootsAbove,
 * })
 * ```
 */
export function useFocusTrap(
  container: Ref<HTMLElement | null>,
  options: UseFocusTrapOptions = {},
): void {
  let previouslyFocused: HTMLElement | null = null
  let listening = false
  // Последний законный держатель фокуса: с него начинается возврат, когда
  // фокус ушёл в никуда (например, кликом по неинтерактивному фону).
  let lastFocusedInside: HTMLElement | null = null

  function roots(): HTMLElement[] {
    const extra = options.containers?.() ?? []
    return [container.value, ...extra].filter((root): root is HTMLElement => Boolean(root))
  }

  function contains(target: Node | null): boolean {
    if (!target) return false
    return roots().some(root => root === target || root.contains(target))
  }

  function focusables(): HTMLElement[] {
    return getFocusableElementsIn(roots())
  }

  function focusInitial(): void {
    // Фокус уже внутри слоя — его поставили осознанно: диалог наводит на свою
    // кнопку, окно ввода — на поле, и делают это в тот же такт, когда панель
    // появилась. `initialFocus` — дефолт слоя, а не приказ, поэтому такую
    // установку он не перебивает.
    if (contains(document.activeElement)) return

    const requested = options.initialFocus?.()
    if (requested && isFocusable(requested)) {
      requested.focus()
      return
    }

    const [first] = focusables()
    if (first) {
      first.focus()
      return
    }

    // Фокусировать нечего — забираем фокус на сам слой, иначе он останется
    // снаружи и Tab уведёт пользователя под окно.
    const fallback = options.fallbackFocus?.() ?? container.value
    fallback?.focus()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return
    if (!contains(document.activeElement)) return

    const items = focusables()
    if (items.length === 0) {
      // Внутри некуда идти — держим фокус на слое, а не отпускаем на страницу.
      event.preventDefault()
      ;(options.fallbackFocus?.() ?? container.value)?.focus()
      return
    }

    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement as HTMLElement | null
    const index = active ? items.indexOf(active) : -1

    // Фокус на самой панели (`tabindex="-1"`, в списке её нет): Tab обязан
    // войти внутрь, а не выпрыгнуть за слой.
    if (index === -1) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
      return
    }

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
      return
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null

    if (contains(target)) {
      lastFocusedInside = target
      return
    }

    // Фокус утёк наружу — программным `focus()`, кликом по фону или обходом
    // через адресную строку. Возвращаем его на последнее законное место.
    if (lastFocusedInside && contains(lastFocusedInside) && isFocusable(lastFocusedInside)) {
      lastFocusedInside.focus()
      return
    }

    focusInitial()
  }

  function activate(): void {
    if (listening) return
    if (typeof document === 'undefined') return
    listening = true

    previouslyFocused = (document.activeElement as HTMLElement) ?? null
    lastFocusedInside = null

    document.addEventListener('keydown', onKeydown, true)
    document.addEventListener('focusin', onFocusIn, true)

    // Ждём, пока Vue домонтирует содержимое слоя: до этого фокусировать нечего.
    void nextTick(() => {
      if (!listening) return
      focusInitial()
    })
  }

  function deactivate(): void {
    if (!listening) return
    listening = false

    document.removeEventListener('keydown', onKeydown, true)
    document.removeEventListener('focusin', onFocusIn, true)

    const target = previouslyFocused
    previouslyFocused = null
    lastFocusedInside = null

    if (options.restoreFocus === false || !target) return
    if (!target.isConnected) return
    target.focus?.()
  }

  watch(
    () => Boolean(options.active?.() ?? true) && Boolean(container.value),
    (isActive) => {
      if (isActive) activate()
      else deactivate()
    },
    { immediate: true },
  )

  onScopeDispose(deactivate)
}
