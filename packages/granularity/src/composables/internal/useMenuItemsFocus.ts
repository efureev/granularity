import { isEditableTarget } from '../../internal/keyboard'

import { getFocusableElements } from './focusables'
import { useTypeahead } from './useTypeahead'

export interface UseMenuItemsFocusOptions {
  /** Корень, внутри которого живут пункты. */
  container: () => HTMLElement | null
  /** Закрыть меню — `Tab` уводит фокус наружу, панель при этом закрывается. */
  close: () => void
}

export interface UseMenuItemsFocusReturn {
  /** Пункты в порядке документа. */
  items: () => HTMLElement[]
  /** Сфокусировать по индексу; отрицательный и превышающий заворачиваются. */
  focusAt: (index: number) => void
  /** Стрелки, `Home`/`End`, `Tab`, typeahead. `true` — клавиша обработана. */
  onKeydown: (event: KeyboardEvent) => boolean
  reset: () => void
}

/**
 * Клавиатура панели-меню: кольцо фокуса плюс поиск по первым буквам.
 *
 * Пункты ищутся в DOM, а не в модели, и это осознанно: у панели бывает
 * произвольное содержимое из слота, в котором ключей нет вовсе. По той же
 * причине здесь не `useRovingFocus` — он адресуется ключами и ведёт
 * `tabindex="0"` на активном элементе, а пункты меню обязаны быть `-1`.
 */
export function useMenuItemsFocus(options: UseMenuItemsFocusOptions): UseMenuItemsFocusReturn {
  /**
   * `tabbableOnly: false` — не оплошность: пункты меню намеренно `tabindex="-1"`,
   * и список участников таб-порядка был бы пуст.
   */
  function items(): HTMLElement[] {
    return getFocusableElements(options.container(), { tabbableOnly: false })
  }

  function focusAt(index: number): void {
    const list = items()
    if (list.length === 0)
      return

    // `preventScroll` обязателен: панель уже приведена во вьюпорт позиционером,
    // поэтому прокрутка ради фокуса внутри неё паразитная. У контекстного меню
    // она к тому же порождала `scroll`, по которому меню закрывало само себя.
    list[(index + list.length) % list.length]?.focus({ preventScroll: true })
  }

  const typeahead = useTypeahead<HTMLElement>({
    items,
    textOf: element => element.textContent ?? '',
    currentIndex: list => list.indexOf(document.activeElement as HTMLElement),
    onMatch: element => element.focus({ preventScroll: true }),
  })

  function onKeydown(event: KeyboardEvent): boolean {
    const list = items()
    const currentIndex = list.indexOf(document.activeElement as HTMLElement)

    // Панель бывает не только меню из кнопок: с `closeOnContentClick={false}` в
    // ней живут поля и чекбоксы. Клавиши, которые сфокусированный контрол умеет
    // сам, остаются ему — иначе в поле не напечатать, а чекбокс не переключить.
    const editable = isEditableTarget(event.target)

    switch (event.key) {
      // Стрелки — исключение: они за меню даже в поле. `Tab` панель закрывает, и
      // без них из поля внутри панели не было бы выхода вовсе.
      case 'ArrowDown':
        event.preventDefault()
        focusAt(currentIndex + 1)
        return true
      case 'ArrowUp':
        event.preventDefault()
        focusAt(currentIndex - 1)
        return true
      case 'Home':
        if (editable)
          return false
        event.preventDefault()
        focusAt(0)
        return true
      case 'End':
        if (editable)
          return false
        event.preventDefault()
        focusAt(-1)
        return true
      case 'Tab':
        options.close()
        return true
    }

    if (editable)
      return false

    // Пробел при пустом буфере — активация сфокусированного пункта, а не поиск:
    // пункты меню это кнопки, и пробел для них родная клавиша. В буфер он входит,
    // только когда поиск уже идёт (правило typeahead из WAI-ARIA APG).
    if (event.key === ' ' && typeahead.isEmpty())
      return false

    // Печатный символ без модификаторов — поиск по пунктам, а не команда.
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      typeahead.type(event.key)
      return true
    }

    return false
  }

  return { items, focusAt, onKeydown, reset: typeahead.reset }
}
