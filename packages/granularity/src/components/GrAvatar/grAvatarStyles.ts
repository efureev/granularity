export type GrAvatarShape = 'circle' | 'square'

/** Статус участника. Точка декоративна — смысл несёт скрытая подпись. */
export const GR_AVATAR_STATUSES = ['online', 'offline', 'busy', 'away'] as const
export type GrAvatarStatus = typeof GR_AVATAR_STATUSES[number]

export const shapes: Record<GrAvatarShape, string> = {
  circle: 'rounded-[var(--gr-radius-full)]',
  square: 'rounded-[var(--gr-avatar-square-radius,10px)]',
}

export const rootBaseClass = 'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[var(--gr-brd)] font-700'

/** Цвет по умолчанию. Отделён от базы, иначе он спорил бы с автоцветом порядком правил. */
export const rootNeutralClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

/**
 * Палитра автоцвета: подложка и инициалы одним классом на слот.
 *
 * Цвета сюда не попадают — только имена слотов. Что стоит за слотом, решает
 * тема (`--gr-avatar-N-bg`/`-fg` ссылаются на пары `-light`/`-text` тонов), и
 * приложение вправе переопределить любой, не трогая компонент.
 *
 * Классы статические: UnoCSS сканирует литералы, и собранный в рантайме
 * `bg-[var(--gr-avatar-${n}-bg)]` в CSS не превратился бы.
 */
export const avatarToneClasses: string[] = [
  'bg-[var(--gr-avatar-1-bg)] text-[var(--gr-avatar-1-fg)]',
  'bg-[var(--gr-avatar-2-bg)] text-[var(--gr-avatar-2-fg)]',
  'bg-[var(--gr-avatar-3-bg)] text-[var(--gr-avatar-3-fg)]',
  'bg-[var(--gr-avatar-4-bg)] text-[var(--gr-avatar-4-fg)]',
  'bg-[var(--gr-avatar-5-bg)] text-[var(--gr-avatar-5-fg)]',
  'bg-[var(--gr-avatar-6-bg)] text-[var(--gr-avatar-6-fg)]',
]

/**
 * Слот палитры по имени: тот же человек — тот же цвет.
 *
 * Стабильность здесь и есть смысл функции: цвет не должен меняться ни между
 * сессиями, ни между сервером и клиентом, иначе аватар мигает на гидрации, а
 * узнаваемость — то, ради чего автоцвет и заводят, — теряется. Отсюда обычный
 * детерминированный перебор кодов, а не хеш из окружения.
 *
 * `>>> 0` обязателен: без него сумма уходит в отрицательные на длинных именах,
 * и остаток от деления даёт отрицательный индекс.
 */
export function avatarToneIndex(name: string): number {
  let hash = 0
  for (const char of name.trim())
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0

  return hash % avatarToneClasses.length
}

/** Индикатор статуса: кольцо цветом фона отделяет точку от самого аватара. */
export const statusDotClass = 'absolute bottom-0 right-0 block h-1/4 w-1/4 min-h-2 min-w-2 rounded-[var(--gr-radius-full)] ring-2 ring-[var(--gr-bg)]'

export const statusToneClass: Record<GrAvatarStatus, string> = {
  online: 'bg-[var(--gr-success)]',
  offline: 'bg-[var(--gr-muted-fg)]',
  busy: 'bg-[var(--gr-danger)]',
  away: 'bg-[var(--gr-warning)]',
}

/**
 * Статус рисуется поверх картинки, поэтому у корня со статусом не может быть
 * `overflow-hidden` — точка обрезалась бы кругом. Скругление вместо этого
 * держит внутренняя обёртка изображения.
 */
export const rootStatusClass = 'overflow-visible'

/**
 * Обёртка растянута на весь аватар, поэтому корневой `justify-center`
 * центрирует её саму, а не содержимое: центрирование обязано быть здесь.
 */
export const mediaClass = 'flex h-full w-full items-center justify-center'

/**
 * Со статусом корень уходит в `overflow-visible`, чтобы не срезать точку, и
 * резать по форме становится некому — тогда это берёт на себя обёртка.
 */
export const mediaClipClass = 'overflow-hidden'

/**
 * Размер бывает произвольным числом пикселей, поэтому кегль считается, а не
 * берётся картой по ступеням. Пол в 10px: у аватара 24px пропорциональные 8px
 * не читаются.
 */
export function avatarFontSizePx(sizePx: number): number {
  return Math.max(10, Math.round(sizePx / 3))
}

export const groupBaseClass = 'inline-flex items-center'

/** Перекрытие соседей: кольцо цветом фона отделяет аватары друг от друга. */
export const groupItemClass = '-ml-2 first:ml-0 ring-2 ring-[var(--gr-bg)]'

export const groupOverflowClass = 'inline-flex items-center justify-center bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] font-700'

export function grAvatarClass(shape: GrAvatarShape): string {
  return [shapes[shape]].join(' ')
}

/**
 * Инициалы из имени: первые буквы двух первых слов. Вынесено чистой функцией —
 * тестируется без монтирования.
 */
export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0)
    return ''

  return words
    .slice(0, 2)
    .map(word => [...word][0]?.toUpperCase() ?? '')
    .join('')
}
