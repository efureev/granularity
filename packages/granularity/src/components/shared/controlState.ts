/**
 * Небуквенный признак состояния форм-контрола.
 *
 * `state="success"`/`"warning"` до этого несли смысл **только цветом рамки**, а
 * это WCAG 1.4.1: цвет не может быть единственным носителем информации. Иконка
 * добавляет форму, а скрытая подпись — программный канал: у `success` и
 * `warning`, в отличие от `danger`, ARIA-состояния не существует вовсе, и
 * объявить их нечем, кроме текста в `aria-describedby`.
 *
 * Модуль общий на пять контролов (`GrInput`, `GrTextarea`, `GrNumberInput`,
 * `GrInputTag`, `GrTreeSelect`), поэтому его классы обязан объявить **каждый**
 * импортёр: в `dist` общий модуль лежит в чанке без адреса и в область скана
 * пресета не попадает.
 */

/** Состояния, у которых признак есть. `danger` его не получает — см. ниже. */
export type GrControlSignalState = 'success' | 'warning'

/**
 * `danger` в набор не входит намеренно. Его смысл уже несут два канала:
 * `aria-invalid` для скринридера и текст ошибки от `GrFormField` для глаз.
 * Третья иконка рядом с ними — шум, а не признак.
 */
export const controlStateIconClass = 'pointer-events-none flex h-6 w-6 shrink-0 items-center justify-center'

/**
 * Цвет иконки — роль `-text`, а не насыщенный тон: `--gr-success` выверен как
 * заливка и в роли текста не добирает AA. Гейт `styleTokens` это ловит.
 */
export const controlStateIconColors: Record<GrControlSignalState, string> = {
  success: 'text-[var(--gr-success-text)]',
  warning: 'text-[var(--gr-warning-text)]',
}

/** Ключ локали подписи. Текст один на все контролы: состояние у них общее. */
export const controlStateTextKey: Record<GrControlSignalState, string> = {
  success: 'gr.common.stateSuccess',
  warning: 'gr.common.stateWarning',
}

export const controlStateFallbackText: Record<GrControlSignalState, string> = {
  success: 'Valid',
  warning: 'Warning',
}

/**
 * Показывать ли признак: только у `success`/`warning` и только пока поле не
 * объявлено невалидным. Иначе галочка «корректно» соседствовала бы с
 * `aria-invalid="true"` и противоречила ему.
 */
export function controlSignalState(
  state: string | undefined,
  invalid: boolean,
): GrControlSignalState | undefined {
  if (invalid)
    return undefined
  if (state === 'success' || state === 'warning')
    return state

  return undefined
}
