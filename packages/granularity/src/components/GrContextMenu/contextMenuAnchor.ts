import type { GrFloatingAnchorRect } from '../../composables/useFloating'

/** Точка курсора — якорь нулевого размера. */
export function anchorFromPointer(event: MouseEvent): GrFloatingAnchorRect {
  return { x: event.clientX, y: event.clientY }
}

/**
 * Прямоугольник элемента — якорь клавиатурного вызова.
 *
 * Не угол и не точка: меню, вызванное с клавиатуры, принадлежит **строке**, и
 * при нехватке места снизу обязано перевернуться относительно неё целиком.
 */
export function anchorFromElement(element: Element): GrFloatingAnchorRect {
  const rect = element.getBoundingClientRect()

  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
}

/**
 * `contextmenu` пришёл с клавиатуры, а не от мыши.
 *
 * Браузеры порождают это событие и для `Shift+F10`, но координаты в нём
 * бесполезны: то угол элемента, то нули. Признаков два сразу, потому что по
 * отдельности каждый ошибается — правый клик всегда `button === 2`, а
 * клавиатурный вызов всегда без «числа кликов».
 */
export function isKeyboardContextMenu(event: MouseEvent): boolean {
  return event.button !== 2 && event.detail === 0
}

/**
 * Пользователь просит нативное меню браузера.
 *
 * `Shift`+правый клик — де-факто escape-hatch, в Firefox задокументированный.
 * `ctrlKey` сюда не входит намеренно: на macOS Ctrl+клик **и есть** правый
 * клик, и меню перестало бы открываться у части пользователей.
 */
export function wantsNativeMenu(event: MouseEvent): boolean {
  return event.shiftKey
}

/** Клавиатурный запрос контекстного меню: `Shift+F10` или клавиша `ContextMenu`. */
export function isContextMenuKey(event: KeyboardEvent): boolean {
  return event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
}
