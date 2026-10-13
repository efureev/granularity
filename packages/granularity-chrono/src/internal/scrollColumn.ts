/**
 * Прокрутить список к опции, не трогая его предков.
 *
 * `scrollIntoView` двигает все прокручиваемые предки вплоть до окна: инлайн-
 * пикер ниже по странице на монтировании или гидрации утаскивал бы к себе всю
 * страницу. Здесь двигается только `scrollTop` самого списка.
 *
 * `offsetTop` опции считается от списка, поэтому список обязан быть её
 * `offsetParent` — `position: relative`.
 *
 * - `center` — опция по центру: так показывают выбранное значение, с соседями;
 * - `nearest` — к ближнему краю и только если опция за ним: шаг стрелкой не
 *   должен дёргать список под рукой. Отступ `scroll-padding` учитывается.
 */
export function scrollOptionIntoList(list: HTMLElement, option: HTMLElement, block: 'center' | 'nearest'): void {
  const top = option.offsetTop
  const height = option.offsetHeight
  const view = list.clientHeight
  let next = list.scrollTop

  if (block === 'center') {
    next = top - (view - height) / 2
  }
  else {
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(list) : null
    const padTop = Number.parseFloat(style?.scrollPaddingTop ?? '') || 0
    const padBottom = Number.parseFloat(style?.scrollPaddingBottom ?? '') || 0

    if (top - padTop < next)
      next = top - padTop
    else if (top + height + padBottom > next + view)
      next = top + height + padBottom - view
  }

  const max = Math.max(0, list.scrollHeight - view)
  const clamped = Math.min(max, Math.max(0, next))
  if (clamped !== list.scrollTop)
    list.scrollTop = clamped
}
