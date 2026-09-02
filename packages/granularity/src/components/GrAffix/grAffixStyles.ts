import type { GrAffixPlacement } from './affixState'

/**
 * Слой — локальное число, а не токен шкалы `--gr-z-*`, и это осознанно.
 * `docs/z-index.md` оставляет шаг между слоями приложению «вклиниться между
 * уровнями — например, свой sticky-хедер под дропдауном»; аффикс это он и есть,
 * так что занимать под него ступень шкалы значило бы забрать оставленное место.
 * К тому же `sticky` с `z-index` заводит свой stacking-контекст — число всё
 * равно локально, и глобального ответа «выше или ниже нижней навигации» у
 * компонента нет: он зависит от приложения. Нужен слой шкалы — приложение
 * ставит `--gr-affix-z: var(--gr-z-navbar)`.
 *
 * `ease-*` обязателен вместе с `duration-*`: без него `presetMini` подставит
 * свою кривую, и движение задавал бы пресет, а не дизайн-система.
 */
export const affixBaseClass = 'z-[var(--gr-affix-z,10)] transition-[box-shadow,background-color] duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]'

export const affixStickyClass = 'sticky'

export const affixEdgeClass: Record<GrAffixPlacement, string> = {
  top: 'top-[var(--gr-affix-offset,0px)]',
  bottom: 'bottom-[var(--gr-affix-offset,0px)]',
}

/**
 * Поверхность прилипшей панели.
 *
 * Фон обязателен: без него уезжающее под панель содержимое просвечивает
 * насквозь — тот же дефект, что у `stickyHeader` в `GrTable` и у закреплённых
 * колонок `GrDataTable`. Отделяет панель тень, а не рамка: рамка добавляет
 * высоту и сдвигает раскладку ровно в момент прилипания.
 *
 * Дефолт фона — `--gr-bg`, а не `--gr-card`: аффикс стоит на странице, и
 * содержимое обязано под ним исчезать, а не наезжать на вторую поверхность.
 * Внутри карточки перекрывается строкой `style="--gr-affix-bg: var(--gr-card)"`.
 *
 * Тень направлена от края прилипания, поэтому наборов два. Верхний берёт
 * системный уровень elevation — тема даёт ему свою плотность. У нижнего
 * направление обратное, системного зеркала нет, и он собирается подмесом
 * `--gr-fg`: подмес переворачивается вместе с темой, литеральный `rgba` — нет.
 */
export const affixSurfaceClass: Record<GrAffixPlacement, string> = {
  top: 'bg-[var(--gr-affix-bg,var(--gr-bg))] shadow-[var(--gr-affix-shadow,var(--gr-shadow-2))]',
  bottom: 'bg-[var(--gr-affix-bg,var(--gr-bg))] shadow-[var(--gr-affix-shadow,0_-8px_24px_-12px_color-mix(in_srgb,var(--gr-fg)_45%,transparent))]',
}

/**
 * Сентинел — зонд положения в потоке: отмечает место, где коробка стояла бы, не
 * будь она липкой. Раскладку не сдвигает, потому что пиксель высоты гасится
 * пикселем отрицательного поля с той стороны, где стоит коробка.
 *
 * Высота именно пиксель, а не ноль: нулевая площадь у цели
 * `IntersectionObserver` — спорный по спецификации угол, и полагаться на него
 * незачем, когда пиксель ничего не стоит.
 */
export const affixSentinelClass: Record<GrAffixPlacement, string> = {
  top: 'h-px -mb-px pointer-events-none',
  bottom: 'h-px -mt-px pointer-events-none',
}

export function grAffixRootClass(placement: GrAffixPlacement, sticky: boolean, surface: boolean): string {
  return [
    affixBaseClass,
    sticky ? affixStickyClass : '',
    sticky ? affixEdgeClass[placement] : '',
    surface ? affixSurfaceClass[placement] : '',
  ].filter(Boolean).join(' ')
}
