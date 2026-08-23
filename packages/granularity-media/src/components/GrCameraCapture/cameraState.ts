/**
 * Состояния камеры и разбор отказов.
 *
 * Вынесено из компонента, потому что именно здесь живёт вся неочевидность:
 * `getUserMedia` отвечает `DOMException` с полудюжиной имён, и от того, в какое
 * из них попал отказ, зависит текст, который увидит пользователь. Проверить это
 * рендером нельзя — камеры у тестового окружения нет.
 */

export type GrCameraStatus
  /** Камера ещё не запрашивалась. */
  = | 'idle'
  /** Разрешение запрошено, ответа нет. */
    | 'starting'
  /** Поток идёт. */
    | 'live'
  /** Пользователь отказал или запретила политика. */
    | 'denied'
  /** Камеры в системе нет. */
    | 'missing'
  /** Устройство занято другим приложением. */
    | 'busy'
  /** Страница открыта не по HTTPS: API просто отсутствует. */
    | 'insecure'
    | 'error'

/**
 * Имя `DOMException` → состояние.
 *
 * Названия заданы спецификацией, но разные браузеры выбирают из них по-разному
 * в одной и той же ситуации: отказ пользователя — `NotAllowedError` везде, а
 * вот занятое устройство Safari называет `NotReadableError`, Firefox —
 * `AbortError`. Поэтому разбор по имени, а не по сообщению: сообщение
 * локализовано браузером и меняется между версиями.
 */
export function cameraStatusFromError(error: unknown): GrCameraStatus {
  const name = error instanceof Error ? error.name : ''

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
    case 'PermissionDeniedError':
      return 'denied'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'missing'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy'
    default:
      return 'error'
  }
}

/**
 * Доступен ли API вовсе.
 *
 * На `http://` (кроме localhost) `navigator.mediaDevices` не существует —
 * не «отказ», а отсутствие. Сообщение «разрешите доступ к камере» в этом случае
 * отправляет пользователя искать настройку, которой нет.
 */
export function cameraSupported(navigatorLike: Pick<Navigator, 'mediaDevices'> | undefined): boolean {
  // `typeof`, а не приведение к булеву: обращение к методу без вызова линт
  // справедливо считает потерей `this`, а нам нужен только факт наличия.
  return typeof navigatorLike?.mediaDevices?.getUserMedia === 'function'
}

/**
 * Зеркалить ли превью.
 *
 * Фронтальную камеру зеркалят всегда: человек видит себя как в зеркале, и
 * незеркальное превью читается как чужое лицо. Тыловую — никогда: там в кадре
 * мир, а не ты.
 *
 * **Снимок при этом не зеркалится.** Иначе текст на визитке или в документе
 * уедет в зазеркалье — а снимают ими ровно это.
 */
export function shouldMirrorPreview(facing: 'user' | 'environment', mirror: boolean | undefined): boolean {
  return mirror ?? facing === 'user'
}
