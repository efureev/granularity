import { splitClassTokens } from '../../internal/classTokens'

export type GrRichTextSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Кегль и минимальная высота поля — ступенями шкалы контролов.
 *
 * Межстрочный идёт парой с кеглем: утилита `text-*` в UnoCSS задаёт оба, и
 * кегль, переведённый на токен в одиночку, отдал бы интервал на откуп `body`
 * приложения. Высота — покомпонентным токеном, потому что она про площадь
 * ввода, а не про ступень контрола: её потребитель меняет чаще всего.
 */
export const sizeClasses = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrRichTextSize, string>

/** Ступень кнопки тулбара — на ступень мельче поля: панель не спорит с текстом. */
export const toolbarButtonSize = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
} as const satisfies Record<GrRichTextSize, 'xs' | 'sm'>

/**
 * Кнопка пузырька — всегда самая мелкая ступень, независимо от размера поля.
 *
 * Панель сверху живёт в раме поля и растёт вместе с ним; пузырёк висит **над
 * текстом**, который читают, и там уместна наименьшая площадь, дающая цель
 * нажатия 28×28 — выше требуемых WCAG 2.2 двадцати четырёх.
 *
 * Это решение об оформлении, а не обход ограничения: ширину панели пузырёк
 * снимает хуком `--gr-popover-max-width`, и в потолок не упирается.
 */
export const bubbleButtonSize = {
  xs: 'xs',
  sm: 'xs',
  md: 'xs',
  lg: 'xs',
} as const satisfies Record<GrRichTextSize, 'xs'>

export const rootClass = 'relative overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]'

export const rootFocusClass = 'focus-within:border-[var(--gr-primary)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const rootInvalidClass = 'border-[var(--gr-invalid-brd)] focus-within:border-[var(--gr-invalid-brd)] focus-within:ring-[var(--gr-invalid-ring)]'

export const rootDisabledClass = 'bg-[var(--gr-muted)] cursor-not-allowed'

export const toolbarClass = 'flex flex-wrap items-center gap-1 border-b border-[var(--gr-brd)] bg-[var(--gr-muted)] px-2 py-1.5'

export const toolbarSeparatorClass = 'mx-1 h-4 w-px bg-[var(--gr-brd)]'

/**
 * Группа кнопок — единица переноса, а не просто набор соседей.
 *
 * `flex-wrap` на самой панели рвёт ряд там, где кончилось место, и разлучает
 * кнопки одного смысла: «Заголовок» уезжает в одну строку, «Подзаголовок» — в
 * другую, хотя между ними нет даже разделителя. Обёртка с `flex-none` этого не
 * допускает: переносится целая группа со своим разделителем, и строки читаются
 * теми же блоками, что и один ряд.
 */
export const toolbarGroupClass = 'flex flex-none items-center gap-1'

/**
 * Пузырёк несёт своё поле, а поповер получает `padding="none"`: 20px поля панели
 * — это две трети кнопки, а места в пузырьке считаный десяток пикселей.
 *
 * `flex-wrap` — не украшение, а гарантия: квадратная кнопка не сжимается
 * (`min-w` в `GrButton`), поэтому строка, не поместившаяся в панель, вылезала бы
 * за её край наружу — панель `overflow: visible`. Потолок ширины пузырёк снял,
 * но предел вьюпорта не снимается ничем, и на узком экране перенос — это то, что
 * между «встало второй строкой» и «уехало за край».
 */
/**
 * Снятый потолок ширины для панели пузырька.
 *
 * Класс, а не инлайновый стиль: панель `GrPopover` телепортируется в портал, и
 * кастомное свойство, поставленное на обёртку триггера, до неё не наследуется —
 * она ей не потомок. Единственный путь на саму панель — `contentClass`.
 *
 * Зачем вообще: по умолчанию поповер держит `22rem` — читаемую ширину колонки
 * текста, — а пузырёк несёт тулбар, которому эта мера чужая. Предел «не шире
 * вьюпорта» остаётся: он второй операнд `min()` и хуком не снимается.
 */
export const bubblePanelClass = '[--gr-popover-max-width:100vw]'

export const bubbleClass = 'flex flex-wrap items-center gap-1 p-1'

export const contentClass = 'px-3 py-2 outline-none'

/**
 * Шапка и подвал поля: своя полоса над текстом и под ним.
 *
 * Отбиваются рамкой изнутри, как тулбар, — и по той же причине: у края поля
 * линия сходится со скруглением рамки, поэтому она принадлежит границе между
 * зонами, а не самой зоне. Фона у них нет: тулбар — панель управления и потому
 * подложен `--gr-muted`, а шапка с подвалом несут содержимое потребителя, и
 * вторая подложка спорила бы с ним.
 */
export const fieldHeaderClass = 'border-b border-[var(--gr-brd)] px-3 py-2'
export const fieldFooterClass = 'border-t border-[var(--gr-brd)] px-3 py-2'

/** Иконка кнопки: размер ведёт кегль, поэтому в `em`, а не в пикселях. */
export const iconClass = 'h-[1.15em] w-[1.15em]'

/**
 * Классы из `.ts`-хелпера обязаны быть в safelist: бандлер выносит модуль в
 * общий `dist/chunks/`, а пресет сканирует только `dist/components/<Name>/**`.
 * Симптом пропуска — поле без рамки и фокус-кольца у того, кто импортировал
 * один компонент.
 */
export const grRichTextSafelist: string[] = [
  ...Object.values(sizeClasses).flatMap(splitClassTokens),
  ...splitClassTokens(rootClass),
  ...splitClassTokens(rootFocusClass),
  ...splitClassTokens(rootInvalidClass),
  ...splitClassTokens(rootDisabledClass),
  ...splitClassTokens(toolbarClass),
  ...splitClassTokens(toolbarSeparatorClass),
  ...splitClassTokens(toolbarGroupClass),
  ...splitClassTokens(bubbleClass),
  ...splitClassTokens(bubblePanelClass),
  ...splitClassTokens(contentClass),
  ...splitClassTokens(fieldHeaderClass),
  ...splitClassTokens(fieldFooterClass),
  ...splitClassTokens(iconClass),
]
