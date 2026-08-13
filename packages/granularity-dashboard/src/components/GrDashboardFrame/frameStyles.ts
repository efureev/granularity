/**
 * Класс-константы общей рамы.
 *
 * Живут в `.ts`, поэтому на сборке уезжают в общий `dist/chunks/` — вне скана
 * пресета. Каждый компонент-потребитель обязан подмешать `frameSafelist` в свой
 * safelist, иначе рама отрисуется без цветов и фокус-колец.
 */

export const gridClass = 'relative grid w-full'

export const placeholderClass = [
  'pointer-events-none',
  'rounded-[var(--gr-dashboard-frame-placeholder-radius,var(--gr-radius-md))]',
  'bg-[var(--gr-dashboard-frame-placeholder-bg,var(--gr-muted))]',
  'border-2 border-dashed',
  'border-[var(--gr-dashboard-frame-placeholder-brd,var(--gr-primary))]',
  'transition-opacity duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
].join(' ')

const handleBaseClass = [
  'inline-flex items-center justify-center',
  'w-[var(--gr-dashboard-frame-handle-size,1.5rem)] h-[var(--gr-dashboard-frame-handle-size,1.5rem)]',
  'rounded-[var(--gr-radius-sm)]',
  'text-[var(--gr-dashboard-frame-handle-color,var(--gr-muted-fg))]',
  'bg-transparent border-0 p-0',
  // Без этого браузер отдаёт вертикальное движение прокрутке, и пальцем сетка
  // неуправляема (`docs/drag-gesture.md`).
  '[touch-action:none]',
  'select-none',
  'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
  'hover:text-[var(--gr-fg)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]',
].join(' ')

export const dragHandleClass = `${handleBaseClass} cursor-grab`

export const dragHandleGrabbedClass = 'cursor-grabbing text-[var(--gr-primary)]'

export const resizeHandleClass = [
  'absolute bottom-0 right-0 z-1',
  'w-[var(--gr-dashboard-frame-resize-size,14px)] h-[var(--gr-dashboard-frame-resize-size,14px)]',
  'bg-transparent p-0',
  'border-0 border-b-2 border-r-2 border-solid',
  'border-[var(--gr-dashboard-frame-handle-color,var(--gr-muted-fg))]',
  'cursor-nwse-resize [touch-action:none]',
  'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
  'hover:border-[var(--gr-primary)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]',
].join(' ')

/**
 * Переход позиции. На время жеста снимается: анимировать то, что и так следует
 * за пальцем, значит добавить задержку к каждому движению.
 */
export const animatedClass = 'transition-all duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

export const emptyClass = 'col-span-full text-[var(--gr-muted-fg)]'

export const srOnlyClass = 'sr-only'
