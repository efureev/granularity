/**
 * Размер результата по заданной части `output`.
 *
 * Ловушка, ради которой это отдельная функция: задать **одну** сторону —
 * обычное дело («аватар шириной 256»), и вторая обязана считаться из
 * соотношения захваченной области. Взятая из исходника, она даёт растянутую
 * картинку: кадр камеры 640×480 при `output.width = 800` превращался в холст
 * 800×480, то есть в изображение, растянутое по горизонтали на четверть.
 *
 * Обе стороны заданы — это **габарит**, а не точный размер: кадр вписывается в
 * него, сохраняя свои пропорции. Взять их буквально значило бы растянуть
 * картинку, когда соотношения не совпали, — а пропорции съёмки в этом пакете
 * не искажаются никогда.
 */
export interface GrOutputRequest {
  width?: number
  height?: number
}

export interface GrOutputSize {
  width: number
  height: number
}

/**
 * `ratio` — соотношение, которое область держит по построению (рамка кропа).
 * Без него оно выводится из самой области, а та несёт хвосты деления: на границе
 * `.5` они решают, в какую сторону округлится вторая сторона.
 */
export function outputSize(
  area: { sw: number, sh: number },
  output?: GrOutputRequest,
  ratio: number = area.sh > 0 ? area.sw / area.sh : 1,
): GrOutputSize {
  const round = (value: number) => Math.max(1, Math.round(value))

  if (output?.width && output?.height) {
    return output.width / output.height > ratio
      ? { width: round(output.height * ratio), height: round(output.height) }
      : { width: round(output.width), height: round(output.width / ratio) }
  }

  if (output?.width)
    return { width: round(output.width), height: round(output.width / ratio) }

  if (output?.height)
    return { width: round(output.height * ratio), height: round(output.height) }

  return { width: round(area.sw), height: round(area.sh) }
}
