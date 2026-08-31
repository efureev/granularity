/**
 * Синхронизация документа CodeMirror с `v-model` — место, где ломаются все
 * обёртки.
 *
 * Модуль чистый и без импортов CodeMirror намеренно: считать минимальную замену
 * можно и нужно без редактора, а тест на это — единственный способ поймать
 * дефект, который иначе проявляется только на живом наборе текста.
 */

/** Минимальная замена: что и на что поменять, чтобы `from` стал `to`. */
export interface MinimalChange {
  from: number
  to: number
  insert: string
}

/**
 * Наименьший участок, которым один текст превращается в другой.
 *
 * Наивная обёртка заменяет документ целиком (`{ from: 0, to: doc.length }`) и
 * сбрасывает этим курсор, выделение и историю undo — на **каждом** раунд-трипе
 * `v-model`, то есть на каждой букве, если родитель кладёт значение в `ref` и
 * возвращает обратно.
 *
 * Возвращает `null`, когда менять нечего: пустая транзакция всё равно двигала бы
 * историю.
 */
export function minimalChange(current: string, next: string): MinimalChange | null {
  if (current === next)
    return null

  const max = Math.min(current.length, next.length)

  let prefix = 0
  while (prefix < max && current[prefix] === next[prefix])
    prefix += 1

  let suffix = 0
  while (
    suffix < max - prefix
    && current[current.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1
  }

  return {
    from: prefix,
    to: current.length - suffix,
    insert: next.slice(prefix, next.length - suffix),
  }
}

/** Замечание к коду: позиция, важность и текст. Даёт потребитель. */
export interface GrCodeIssue {
  from: number
  to: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

/**
 * Замечания, приведённые к границам документа.
 *
 * Валидатор считает позиции по строке, которую ему дали, а документ к моменту
 * отрисовки мог стать короче: ответ асинхронного `validate` приходит на текст,
 * которого уже нет. Замечание за границей уронило бы CodeMirror исключением при
 * построении декорации, поэтому обрезается здесь, а не там.
 */
export function clampIssues(issues: readonly GrCodeIssue[], length: number): GrCodeIssue[] {
  const clamped: GrCodeIssue[] = []

  for (const issue of issues) {
    const from = Math.max(0, Math.min(issue.from, length))
    const to = Math.max(from, Math.min(issue.to, length))

    // Замечание, схлопнувшееся в точку за концом документа, показывать не на чем.
    if (from === to && from >= length && length > 0)
      continue

    clamped.push({ ...issue, from, to })
  }

  return clamped
}
