/**
 * Классы хрома просмотрщика.
 *
 * Целые литералы: granum извлекает их из чанков компонента сам, в какой бы
 * чанк бандлер ни вынес этот модуль, поэтому в safelist их нет.
 *
 * Цвета — покомпонентные токены (`themes/*.css`), а не литералы `bg-black/35`:
 * так потребитель может перекрасить панель под свой продукт, не переписывая
 * шаблон.
 */

export const scrimClass = 'absolute inset-0 bg-[var(--gr-image-viewer-scrim)] backdrop-blur-sm'

/** Круглая кнопка хрома: закрыть, предыдущее/следующее изображение. */
export const chromeButtonClass = 'flex items-center justify-center rounded-[var(--gr-radius-full)] border border-[var(--gr-image-viewer-chrome-brd)] bg-[var(--gr-image-viewer-chrome-bg)] text-[var(--gr-image-viewer-chrome-fg)] transition-colors hover:bg-[var(--gr-image-viewer-chrome-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-image-viewer-ring)]'

/** Кнопка внутри панели инструментов — без рамки, подсветка мягкая. */
export const toolbarButtonClass = 'flex items-center justify-center rounded-[var(--gr-radius-full)] text-[var(--gr-image-viewer-chrome-fg)] transition-colors hover:bg-[var(--gr-image-viewer-chrome-bg-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-image-viewer-ring)]'

export const toolbarShellClass = 'rounded-[var(--gr-radius-full)] border border-[var(--gr-image-viewer-chrome-brd)] bg-[var(--gr-image-viewer-chrome-bg)] p-1 backdrop-blur-sm flex items-center gap-1'

export const toolbarSeparatorClass = 'mx-1 h-6 w-px bg-[var(--gr-image-viewer-chrome-brd)]'

/** Плашки счётчика и масштаба. */
export const badgeClass = 'rounded-[var(--gr-radius-full)] bg-[var(--gr-image-viewer-chrome-bg)] px-3 py-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-image-viewer-chrome-fg)] sm:text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'

export const emptyStateClass = 'rounded-[var(--gr-radius-xl)] border border-[var(--gr-image-viewer-chrome-brd)] bg-[var(--gr-image-viewer-chrome-bg)] px-4 py-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-image-viewer-chrome-fg-muted)]'
