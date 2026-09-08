/**
 * Пипетка экрана поверх `EyeDropper`.
 *
 * API есть не везде (сегодня — браузеры на Chromium), поэтому вызывается через
 * проверку, а не через `try`: кнопка не должна появляться там, где нажатие
 * ничего не даст.
 *
 * Отказ пользователя ошибкой не считается. `open()` отклоняется `AbortError`
 * и на `Esc`, и на обрыв через `AbortSignal` — оба исхода означают «цвет не
 * выбран», и разговаривать о них с пользователем не о чем.
 */

/**
 * `EyeDropper` нет в `lib.dom`, поэтому форма описана здесь — узко и ровно та,
 * что читается ниже (приём `GrOtpInput` для WebOTP).
 */
interface EyeDropperApi {
  new (): { open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }> }
}

function eyeDropperApi(): EyeDropperApi | null {
  if (typeof window === 'undefined' || !('EyeDropper' in window))
    return null

  return (window as unknown as { EyeDropper: EyeDropperApi }).EyeDropper
}

/** Поддерживается ли пипетка. Зовётся после монтирования: на сервере `window` нет. */
export function isEyeDropperSupported(): boolean {
  return eyeDropperApi() !== null
}

/**
 * Открыть пипетку и дождаться цвета. `null` — пользователь отказался или API
 * недоступно.
 *
 * Вызов обязан идти прямо из обработчика нажатия: без свежего жеста браузер
 * отклоняет `open()` как `NotAllowedError`.
 */
export async function pickScreenColor(signal?: AbortSignal): Promise<string | null> {
  const Api = eyeDropperApi()
  if (!Api)
    return null

  try {
    const { sRGBHex } = await new Api().open(signal ? { signal } : undefined)
    return sRGBHex
  }
  catch {
    return null
  }
}
