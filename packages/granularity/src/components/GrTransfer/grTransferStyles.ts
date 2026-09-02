import type { GrComponentSize } from '../shared/sizes'

export type GrTransferSize = GrComponentSize

export const transferRootBase = 'flex items-stretch gap-4'

export const transferPanelBase = 'flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)]'

/**
 * Панель под указателем во время переноса.
 *
 * Одной рамки мало: на широком экране она за пределами взгляда, занятого
 * курсором. Мягкая подложка сообщает «сюда» там, где человек и смотрит.
 */
export const transferPanelDropClass = 'border-[var(--gr-transfer-drop-brd,var(--gr-primary))] bg-[var(--gr-transfer-drop-bg,color-mix(in_srgb,var(--gr-primary)_6%,transparent))]'

export const transferHeaderBase = 'flex items-center gap-2 border-b border-[var(--gr-brd)]'

export const transferTitleClass = 'min-w-0 flex-1 truncate font-600 text-[var(--gr-fg)]'

export const transferCounterClass = 'shrink-0 text-[var(--gr-muted-fg)] tabular-nums'

export const transferSearchBase = 'border-b border-[var(--gr-brd)]'

/**
 * Список — скроллер, но своего таб-стопа не получает: его строки фокусируемы,
 * и вторая остановка `Tab` перед ними была бы лишней (приём `GrTabs`).
 */
export const transferListBase = 'relative min-h-0 flex-1 overflow-y-auto'

export const transferOptionBase = 'relative flex w-full select-none items-center gap-2 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-inset'

/** Строку можно взять — курсор обязан это предложить до нажатия, а не после. */
export const transferOptionGrabClass = 'cursor-grab'

export const transferOptionPlainClass = 'cursor-pointer'

export const transferOptionStates = {
  // Тон, а не заливка: строка остаётся читаемой обычным `--gr-fg`, и контраст
  // не приходится выверять заново. Мягкой подложки под `--gr-primary` в темах
  // нет (есть только у danger/info/success/warning), поэтому `color-mix` —
  // тот же приём, которым красят наведение `GrTabs` и `GrSelect`.
  selected: 'bg-[var(--gr-transfer-selected-bg,color-mix(in_srgb,var(--gr-primary)_12%,transparent))] text-[var(--gr-fg)]',
  idle: 'text-[var(--gr-fg)] hover:bg-[var(--gr-muted)]',
  // Гашение фоном, а не `opacity`: прозрачность разбавляет выверенные на AA
  // токены текста и роняет контраст.
  disabled: 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-disabled-fg)]',
} as const

/**
 * Строка, только что приехавшая из соседней панели.
 *
 * Статичный итог перенос уже показывает — строка приходит отмеченной, счётчики
 * меняются, — но само **движение** ничем не выдано: строки просто возникают.
 * Короткая подсветка связывает «нажал» и «появилось». Под `prefers-reduced-motion`
 * её гасит глобальный кламп, и остаётся тот же статичный итог.
 */
export const transferOptionArrivedClass = 'gr-transfer-arrived'

/**
 * Место, откуда строку унесли.
 *
 * Правило живёт в `<style>` компонента, а не утилитой: цвет текста строки задаёт
 * класс состояния той же специфичности, и кто победит, решал бы порядок правил в
 * собранном CSS — та же ловушка, что записана в `grTabsStyles.ts`.
 */
export const transferOptionDraggingClass = 'gr-transfer-vacated'

/**
 * Отметка строки декоративна: `GrCheckbox` внутрь `role="option"` вложить
 * нельзя — его индикатор сам `role="checkbox"` с `tabindex="0"`, то есть ровно
 * `nested-interactive`. Состояние объявляет `aria-selected` самой строки.
 */
export const transferMarkBase = 'inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-sm)] border border-[var(--gr-brd)] bg-[var(--gr-bg)]'

export const transferMarkStates = {
  selected: 'border-[var(--gr-primary)] bg-[var(--gr-primary)] text-[var(--gr-primary-fg)]',
  idle: '',
} as const

export const transferMarkIconClass = 'h-3 w-3'

export const transferLabelClass = 'min-w-0 flex-1 truncate'

/**
 * Место вставки — псевдоэлемент строки-соседа, а не отдельный узел: лишний узел
 * между строками ломает подсчёт позиций и разделители.
 */
export const transferIndicatorBeforeClass = 'before:absolute before:inset-x-0 before:top-0 before:h-[var(--gr-transfer-indicator-width,3px)] before:rounded-[var(--gr-radius-full)] before:bg-[var(--gr-transfer-indicator,var(--gr-primary))] before:content-empty'

export const transferIndicatorAfterClass = 'after:absolute after:inset-x-0 after:bottom-0 after:h-[var(--gr-transfer-indicator-width,3px)] after:rounded-[var(--gr-radius-full)] after:bg-[var(--gr-transfer-indicator,var(--gr-primary))] after:content-empty'

export const transferEmptyClass = 'flex h-full items-center justify-center px-4 py-6 text-center text-[var(--gr-muted-fg)]'

export const transferActionsClass = 'flex shrink-0 items-center'

/**
 * Кнопки перестановки в шапке правой панели. Перестановка обязана быть видимой:
 * сочетание `Alt` + стрелка её ускоряет, но само по себе неоткрываемо, а на
 * macOS ещё и неудобно — почти все мета-клавиши там заняты системой.
 *
 * Стрелки горизонтальные, потому что порядок — это **последовательность**, а не
 * положение на экране: правая панель задаёт порядок колонок отчёта или полей
 * выгрузки, и они читаются слева направо.
 *
 * Сочетание при этом остаётся вертикальным (`Alt` + `↑`/`↓`), и расхождение с
 * иконками намеренное: в Chrome и Firefox под Windows и Linux `Alt` + `←`/`→` —
 * это «назад/вперёд» в истории браузера. В Safari навигация висит на
 * `Cmd` + стрелках, то есть там сочетание было бы свободно, — но пакет едет ко
 * всем, и ориентироваться на одну платформу нельзя.
 */
export const transferReorderBase = 'inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const transferReorderSizes: Record<GrTransferSize, string> = {
  xs: 'h-5 w-5',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
}

export const transferReorderIconClass = 'h-3.5 w-3.5'

export function grTransferReorderClass(size: GrTransferSize): string {
  return [transferReorderBase, transferReorderSizes[size]].join(' ')
}

export const transferActionIconClass = 'h-4 w-4 shrink-0'

/**
 * Кнопка без пути наружу остаётся в таб-порядке — нативный `disabled` уронил бы
 * фокус в тело документа. Показывает она это правилом в `<style>` компонента, а
 * не утилитой: у `GrButton` свой фон классом той же специфичности, и кто победит,
 * решал бы порядок в сгенерированном CSS, то есть через раз.
 */
export const transferActionInertClass = 'cursor-not-allowed'

/**
 * Предпросмотр переносимого: он и есть ответ на «где сейчас элемент».
 *
 * Без него строка оставалась на месте, а за курсором не двигалось ничего — жест
 * выглядел так, будто ничего не происходит. Узел не ловит указатель
 * (`pointer-events: none`), иначе он перехватывал бы попадание у самих панелей.
 */
export const transferGhostClass = 'pointer-events-none fixed left-0 top-0 z-10 flex max-w-[16rem] items-center gap-2 rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-transfer-ghost-bg,var(--gr-card))] px-3 py-1.5 text-[var(--gr-fg)] shadow-[var(--gr-shadow-2)]'

export const transferGhostLabelClass = 'min-w-0 flex-1 truncate text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]'

/** Сколько строк едет разом: одну видно по подписи, остальные — числом. */
export const transferGhostCountClass = 'shrink-0 rounded-[var(--gr-radius-full)] bg-[var(--gr-primary)] px-1.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)] text-[var(--gr-primary-fg)] tabular-nums'

export const transferStatusClass = 'sr-only'

export const transferHeaderSizes: Record<GrTransferSize, string> = {
  xs: 'px-2 py-1 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'px-2.5 py-1.5 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'px-3 py-2 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'px-4 py-2.5 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const transferOptionSizes: Record<GrTransferSize, string> = {
  xs: 'px-2 py-1 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'px-2.5 py-1.5 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'px-3 py-2 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'px-4 py-2.5 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const transferMarkSizes: Record<GrTransferSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export const transferSearchSizes: Record<GrTransferSize, string> = {
  xs: 'p-1',
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

export const transferEmptySizes: Record<GrTransferSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const transferActionsSizes: Record<GrTransferSize, string> = {
  xs: 'px-1',
  sm: 'px-1.5',
  md: 'px-2',
  lg: 'px-2.5',
}

export interface GrTransferOptionClassOptions {
  size: GrTransferSize
  selected: boolean
  disabled: boolean
  draggable: boolean
  dragging: boolean
  arrived: boolean
  indicator: 'before' | 'after' | null
}

export function grTransferOptionClass(options: GrTransferOptionClassOptions): string {
  const state = options.disabled
    ? transferOptionStates.disabled
    : options.selected ? transferOptionStates.selected : transferOptionStates.idle

  return [
    transferOptionBase,
    options.draggable && !options.disabled ? transferOptionGrabClass : transferOptionPlainClass,
    transferOptionSizes[options.size],
    state,
    options.dragging ? transferOptionDraggingClass : '',
    options.arrived ? transferOptionArrivedClass : '',
    options.indicator === 'before' ? transferIndicatorBeforeClass : '',
    options.indicator === 'after' ? transferIndicatorAfterClass : '',
  ].filter(Boolean).join(' ')
}

export function grTransferMarkClass(size: GrTransferSize, selected: boolean): string {
  return [
    transferMarkBase,
    transferMarkSizes[size],
    selected ? transferMarkStates.selected : transferMarkStates.idle,
  ].filter(Boolean).join(' ')
}

export function grTransferPanelClass(dropActive: boolean): string {
  return [transferPanelBase, dropActive ? transferPanelDropClass : ''].filter(Boolean).join(' ')
}

export function grTransferEmptyClass(size: GrTransferSize): string {
  return [transferEmptyClass, transferEmptySizes[size]].join(' ')
}

export function grTransferHeaderClass(size: GrTransferSize): string {
  return [transferHeaderBase, transferHeaderSizes[size]].join(' ')
}

export function grTransferSearchClass(size: GrTransferSize): string {
  return [transferSearchBase, transferSearchSizes[size]].join(' ')
}

export function grTransferActionsClass(size: GrTransferSize): string {
  return [transferActionsClass, transferActionsSizes[size]].join(' ')
}
