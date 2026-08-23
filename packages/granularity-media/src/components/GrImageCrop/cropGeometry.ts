/**
 * Геометрия кропа: где именно вырезается кадр.
 *
 * Модель — «рамка неподвижна, двигается изображение»: окно кропа занимает весь
 * видимый прямоугольник, а пользователь тянет и масштабирует картинку под ним.
 * Обратная модель (рамка ездит по картинке) требует от пользователя двух
 * жестов вместо одного и на телефоне промахивается по ручкам рамки.
 *
 * Всё здесь — чистые функции над числами: ни DOM, ни canvas. Кроп ошибается
 * незаметно (кадр съезжает на пару процентов, и это видно только на результате),
 * поэтому арифметика вынесена туда, где её можно проверить без рендера.
 */

export interface GrCropSize {
  width: number
  height: number
}

export interface GrCropOffset {
  x: number
  y: number
}

/** Прямоугольник исходного изображения, попадающий в кадр. */
export interface GrCropRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

/**
 * Масштаб, при котором изображение покрывает окно целиком.
 *
 * Именно `max`, а не `min`: при `min` картинка вписалась бы внутрь окна и по
 * краям остались бы поля, то есть кадр содержал бы пустоту, которой в исходнике
 * нет.
 */
export function coverScale(image: GrCropSize, viewport: GrCropSize): number {
  if (image.width <= 0 || image.height <= 0)
    return 1

  return Math.max(viewport.width / image.width, viewport.height / image.height)
}

/** Размер изображения на экране при данном увеличении. */
export function displaySize(image: GrCropSize, viewport: GrCropSize, zoom: number): GrCropSize {
  const scale = coverScale(image, viewport) * zoom

  return { width: image.width * scale, height: image.height * scale }
}

/**
 * Насколько изображение может съехать, не обнажив край окна.
 *
 * Предел считается от **отображаемого** размера, а не от исходного: при
 * увеличении запас растёт, и жёсткая граница в пикселях исходника заперла бы
 * увеличенную картинку в центре.
 */
export function offsetBounds(image: GrCropSize, viewport: GrCropSize, zoom: number): GrCropOffset {
  const display = displaySize(image, viewport, zoom)

  return {
    x: Math.max(0, (display.width - viewport.width) / 2),
    y: Math.max(0, (display.height - viewport.height) / 2),
  }
}

/** Смещение, подрезанное до пределов: за ними в кадр попала бы пустота. */
export function clampOffset(
  offset: GrCropOffset,
  image: GrCropSize,
  viewport: GrCropSize,
  zoom: number,
): GrCropOffset {
  const bounds = offsetBounds(image, viewport, zoom)

  return {
    x: Math.min(bounds.x, Math.max(-bounds.x, offset.x)),
    y: Math.min(bounds.y, Math.max(-bounds.y, offset.y)),
  }
}

/**
 * Область исходного изображения под окном кропа.
 *
 * Смещение подрезается здесь же, а не доверяется вызывающему: `zoom` меняется
 * колесом и слайдером, и уменьшение всегда сокращает пределы — смещение,
 * законное миг назад, после него выводит кадр за край.
 */
export function cropRect(
  image: GrCropSize,
  viewport: GrCropSize,
  zoom: number,
  offset: GrCropOffset,
): GrCropRect {
  const scale = coverScale(image, viewport) * zoom

  // Окно ещё не измерено: до первого `ResizeObserver` его ширина — ноль, и
  // деление на масштаб дало бы `Infinity` в каждом поле. Пустой прямоугольник
  // честнее: рисовать пока нечего.
  if (scale <= 0)
    return { sx: 0, sy: 0, sw: 0, sh: 0 }
  const safe = clampOffset(offset, image, viewport, zoom)
  const display = displaySize(image, viewport, zoom)

  return {
    sx: (display.width - viewport.width) / 2 / scale - safe.x / scale,
    sy: (display.height - viewport.height) / 2 / scale - safe.y / scale,
    sw: viewport.width / scale,
    sh: viewport.height / scale,
  }
}

/**
 * Высота окна при заданном соотношении сторон.
 *
 * Соотношение задаётся числом, а не строкой `'16:9'`: строку пришлось бы
 * разбирать в рантайме, а ошибка формата всплыла бы уже на экране.
 */
export function viewportFor(width: number, aspectRatio: number): GrCropSize {
  const ratio = aspectRatio > 0 ? aspectRatio : 1

  return { width, height: width / ratio }
}
