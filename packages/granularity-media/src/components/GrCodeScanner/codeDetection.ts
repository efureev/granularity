/**
 * Распознавание кодов: нативный путь и точка подключения для остальных.
 *
 * `BarcodeDetector` есть в Chrome и Edge, но его нет ни в Safari, ни в Firefox —
 * то есть на iPhone его нет вовсе, а там сканируют чаще всего. Тащить декодер в
 * пакет нельзя: у него нет ни одной зависимости, и ради одного компонента
 * появилась бы самая тяжёлая. Поэтому компонент умеет нативный путь сам, а
 * остальные браузеры закрывает детектором, который передаёт приложение.
 */

/** Один распознанный код. */
export interface GrCodeResult {
  /** Содержимое: адрес, номер товара, текст. */
  value: string
  /** Символика: `qr_code`, `ean_13`, `code_128`, … */
  format: string
}

/**
 * Детектор кадра. Ровно та форма, в которую заворачивается любая библиотека:
 * на вход — то, что умеет рисовать canvas, на выход — список кодов.
 */
export type GrCodeDetector = (source: CanvasImageSource) => Promise<GrCodeResult[]>

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string, format: string }[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike
  getSupportedFormats?: () => Promise<string[]>
}

/** Есть ли нативный `BarcodeDetector`. */
export function nativeDetectorSupported(scope: typeof globalThis = globalThis): boolean {
  return typeof (scope as { BarcodeDetector?: unknown }).BarcodeDetector === 'function'
}

/**
 * Нативный детектор в общей форме.
 *
 * Формат приводится к нашему типу здесь, а не в компоненте: спецификация зовёт
 * содержимое `rawValue`, и это единственное место, где чужое имя видно.
 */
export function createNativeDetector(
  formats: readonly string[] | undefined,
  scope: typeof globalThis = globalThis,
): GrCodeDetector | null {
  if (!nativeDetectorSupported(scope))
    return null

  const Detector = (scope as unknown as { BarcodeDetector: BarcodeDetectorConstructor }).BarcodeDetector
  const detector = new Detector(formats ? { formats: [...formats] } : undefined)

  return async (source) => {
    const found = await detector.detect(source)

    return found.map(code => ({ value: code.rawValue, format: code.format }))
  }
}

/**
 * Что сообщать наружу из очередного кадра.
 *
 * Камера отдаёт десятки кадров в секунду, и один и тот же код распознаётся в
 * каждом. Без фильтра приложение получило бы поток одинаковых событий и
 * оформило бы двадцать заказов вместо одного. Поэтому по умолчанию сообщается
 * только то, чего не было в предыдущем кадре.
 *
 * `continuous` нужен там, где сканируют подряд (приёмка на складе): там повтор
 * того же кода — законное второе событие.
 */
export function freshCodes(
  previous: readonly GrCodeResult[],
  next: readonly GrCodeResult[],
  continuous: boolean,
): GrCodeResult[] {
  if (continuous)
    return [...next]

  const seen = new Set(previous.map(code => `${code.format}:${code.value}`))

  return next.filter(code => !seen.has(`${code.format}:${code.value}`))
}
