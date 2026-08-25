import type { Placement } from '@floating-ui/dom'

import { overlayOriginClass } from '../shared/overlayOrigin'
import { overlayPanelSurfaceClass } from '../shared/overlayPanelSurface'
import type { GrComponentSize } from '../shared/sizes'

export type GrPopoverSize = GrComponentSize

/**
 * Роль панели.
 *
 * `dialog` — произвольный интерактивный контент (значение по умолчанию).
 * Остальные нужны компонентам, которые строятся поверх этого примитива:
 * меню (`GrMenu`, `GrContextMenu`), списки, палитры. Роль задаёт потребитель,
 * потому что клавиатурный паттерн принадлежит ему, а не поповеру.
 */
export type GrPopoverRole = 'dialog' | 'menu' | 'listbox' | 'grid' | 'group' | 'none'

/** Поле панели. `none` — поле рисует содержимое (меню, список опций). */
export type GrPopoverPadding = 'default' | 'none'

export const panelSizes: Record<GrPopoverSize, string> = {
  xs: 'p-2 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'p-2.5 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'p-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'p-4 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
}

/**
 * Поверхность панели.
 *
 * Ширина — `min()` из двух пределов, и они разной природы. Первый, `22rem`, —
 * потолок содержимого: читаемая ширина колонки текста. Он **дефолт**, а не
 * закон, и снимается хуком `--gr-popover-max-width` — примитив объявил, что
 * содержимое панели дело потребителя, и навязывать ему форму не вправе.
 * Тулбар, палитра и сетка шире прозы законно.
 *
 * Второй, `calc(100vw-1rem)`, — инвариант слоя: `useFloating` смещает панель в
 * пределах вьюпорта, но не сужает её. Он не настраивается ничем и снаружи не
 * отключается, потому что стоит вторым операндом `min()`: даже
 * `--gr-popover-max-width: 100vw` его не снимает, а лишь уступает ему место.
 *
 * Хуком, а не пропом, — по трём причинам. Спор специфичности не возникает
 * вовсе: кастомное свойство разрешается каскадом на самом элементе, а не
 * порядком правил в сгенерированном CSS (та же ловушка, что описана у
 * `panelSizesFlush`). Потолок можно менять по брейкпоинту и по теме — пропом
 * этого не сделать. И словарь компонента не растёт: значение остаётся
 * значением. Так же устроена высота списка у `GrCommandPalette`.
 */
/**
 * Кегль без поля.
 *
 * Отдельная мапа, а не `contentClass="p-0"`: поле и кегль приезжают одной
 * строкой равной специфичности, и кто победит — решал бы порядок правил в
 * сгенерированном CSS. Меню внутри поповера с `p-3` — визуально не меню.
 */
export const panelSizesFlush: Record<GrPopoverSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
}

export const popoverPanelBaseClass = `${overlayPanelSurfaceClass} max-w-[min(var(--gr-popover-max-width,22rem),calc(100vw-1rem))] focus:outline-none`

export function grPopoverPanelClass(
  size: GrPopoverSize,
  placement: Placement,
  extra?: string,
  padding: GrPopoverPadding = 'default',
): string {
  return [
    popoverPanelBaseClass,
    padding === 'none' ? panelSizesFlush[size] : panelSizes[size],
    overlayOriginClass(placement),
    extra ?? '',
  ].filter(Boolean).join(' ')
}
