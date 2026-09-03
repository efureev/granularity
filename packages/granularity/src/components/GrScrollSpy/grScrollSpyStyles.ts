export const scrollSpyRootClass = 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] [scroll-margin-top:var(--gr-scroll-spy-offset,0px)]'

export const scrollSpyListClass = 'flex flex-col [list-style:none]'

/**
 * Пункт — ссылка, поэтому `no-underline` и своё фокус-кольцо: `focus:outline-none`
 * снимает системное, `focus-visible:ring-*` возвращает кольцо пакета.
 *
 * `ease-*` обязателен рядом с `duration-*`: без него кривую подставит `presetMini`,
 * то есть движение задавал бы пресет, а не дизайн-система.
 */
export const scrollSpyItemBaseClass = 'block truncate no-underline border-s-2 ps-2 pe-2 py-1 rounded-e-[var(--gr-radius-control)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Активный пункт отличается **тремя** признаками — цветом рельса, весом и
 * цветом текста. Одного цвета мало: он не виден при монохромном зрении и не
 * существует для диктора, которому состояние приходит через `aria-current`.
 *
 * Приглушение неактивных — токеном текста, а не `opacity`: прозрачность
 * разбавляет выверенные на AA цвета и роняет контраст.
 */
export const scrollSpyItemIdleClass = 'border-s-[var(--gr-scroll-spy-rail,var(--gr-brd))] text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)]'

/**
 * Предок активного пункта. Без него оглавление с двумя уровнями читается как
 * сломанное: активен подраздел, а его раздел выглядит выключенным.
 */
export const scrollSpyItemAncestorClass = 'border-s-[var(--gr-scroll-spy-rail,var(--gr-brd))] text-[var(--gr-fg)]'

export const scrollSpyItemActiveClass = 'border-s-[var(--gr-scroll-spy-marker,var(--gr-primary))] font-600 text-[var(--gr-primary-text)]'

export function grScrollSpyItemClass(state: 'active' | 'ancestor' | 'idle'): string {
  const stateClass = state === 'active'
    ? scrollSpyItemActiveClass
    : state === 'ancestor' ? scrollSpyItemAncestorClass : scrollSpyItemIdleClass

  return `${scrollSpyItemBaseClass} ${stateClass}`
}
