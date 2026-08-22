/**
 * Класс-константы общей рамы.
 *
 * Живут в `.ts`, поэтому на сборке уезжают в общий `dist/chunks/` — вне скана
 * пресета. Каждый компонент-потребитель обязан подмешать `frameSafelist` в свой
 * safelist, иначе рама отрисуется без цветов и фокус-колец.
 */

export const gridClass = 'relative grid w-full'

/**
 * Подложка — место, куда встанет переносимый виджет.
 *
 * Отступает внутрь своей ячейки: без отступа её пунктир ложится ровно на
 * границу соседа, и там, где стороны совпадают, рамка выглядывает из-под
 * чужой карточки — читается как дефект вёрстки, а не как показанное место.
 */
export const placeholderClass = [
  'pointer-events-none',
  'm-[var(--gr-dashboard-frame-placeholder-inset,4px)]',
  'rounded-[var(--gr-dashboard-frame-placeholder-radius,var(--gr-radius-lg))]',
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

export const dragHandleGrabbedClass = 'cursor-grabbing text-[var(--gr-primary-text)]'

/** Кнопка настроек виджета. Та же цель, что у ручки переноса, — но нажимается, а не тащится. */
export const settingsButtonClass = `${handleBaseClass} cursor-pointer`

/**
 * Уголок растягивания в правом нижнем углу виджета.
 *
 * Скруглён по тому же радиусу, что и сам виджет: прямой угол на скруглённой
 * карточке торчит за её край и выглядит приклеенным снаружи, а не частью её.
 */
export const resizeHandleClass = [
  'absolute bottom-0 right-0 z-1',
  'w-[var(--gr-dashboard-frame-resize-size,14px)] h-[var(--gr-dashboard-frame-resize-size,14px)]',
  'bg-transparent p-0',
  'border-0 border-b-2 border-r-2 border-solid',
  'border-[var(--gr-dashboard-frame-handle-color,var(--gr-muted-fg))]',
  'rounded-br-[var(--gr-dashboard-frame-resize-radius,var(--gr-radius-lg))]',
  'cursor-nwse-resize [touch-action:none]',
  'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
  'hover:border-[var(--gr-primary)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]',
].join(' ')

/**
 * Призрак — то, что видно между каталогом и сеткой.
 *
 * Слой выше окна: перенос начинают и из модалки, а призрак живёт ровно пока
 * палец на кнопке. `pointer-events: none` тут не украшение — без него призрак
 * перехватывает хит-тест и приёмник под курсором не находится никогда.
 */
export const ghostClass = [
  'fixed left-0 top-0',
  'z-[var(--gr-dashboard-frame-ghost-z,var(--gr-z-toast))]',
  'pointer-events-none select-none',
  'inline-flex items-center gap-2',
  'px-3 py-2',
  'rounded-[var(--gr-dashboard-frame-ghost-radius,var(--gr-radius-lg))]',
  'bg-[var(--gr-dashboard-frame-ghost-bg,var(--gr-card))]',
  'border border-solid border-[var(--gr-dashboard-frame-ghost-brd,var(--gr-primary))]',
  'shadow-[var(--gr-dashboard-frame-ghost-shadow,var(--gr-shadow-3))]',
  'text-[var(--gr-fg)]',
  'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
].join(' ')

export const ghostTitleClass = 'truncate max-w-[16rem] font-medium'

export const ghostMeasureClass = [
  'shrink-0 whitespace-nowrap',
  'text-[var(--gr-muted-fg)]',
  '[font-variant-numeric:tabular-nums]',
].join(' ')

/**
 * Переход позиции. На время жеста снимается: анимировать то, что и так следует
 * за пальцем, значит добавить задержку к каждому движению.
 */
export const animatedClass = 'transition-all duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]'

/**
 * Пустое состояние занимает всю ширину сетки.
 *
 * Обёртка обязательна: слот `#empty` — обычный ребёнок CSS Grid, и без
 * `col-span-full` любое содержимое приложения встало бы в одну колонку из
 * двенадцати, где текст рвётся по буквам. Знать про устройство сетки слот не
 * должен.
 */
export const emptyWrapClass = 'col-span-full'

export const emptyTextClass = 'text-[var(--gr-muted-fg)]'

export const srOnlyClass = 'sr-only'
