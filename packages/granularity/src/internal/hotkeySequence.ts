import type { ParsedHotkeyCombo } from './keyboard'
import { matchesHotkeyCombo } from './keyboard'

/**
 * Сопоставление последовательностей клавиш («G, затем I»).
 *
 * Хранится буфер недавних нажатий, а хвост буфера сверяется с шагами хоткея.
 * Буфер, а не автомат на каждый хоткей: цепочки с общим началом (`g i` и `g p`)
 * буфер разводит сам, тогда как набор автоматов пришлось бы синхронизировать
 * между собой — и первый же сброс одного из них ронял бы второй.
 */

/** Пауза, после которой набранное забывается. */
export const HOTKEY_SEQUENCE_TIMEOUT_MS = 1000

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])

export interface HotkeySequenceTracker {
  /**
   * Принять нажатие. Возвращает `false`, если событие в буфер не пошло —
   * потребителю это говорит, что состояние не изменилось.
   */
  push: (event: KeyboardEvent, now: number) => boolean
  /** Совпадает ли хвост буфера со всеми шагами. */
  matches: (steps: readonly ParsedHotkeyCombo[], apple?: boolean) => boolean
  reset: () => void
}

export function createHotkeySequenceTracker(
  timeoutMs: number = HOTKEY_SEQUENCE_TIMEOUT_MS,
): HotkeySequenceTracker {
  let buffer: KeyboardEvent[] = []
  let lastAt = 0

  function push(event: KeyboardEvent, now: number): boolean {
    /*
     * Нажатия одних модификаторов в буфер не идут: `Shift` перед `I` — часть
     * самого `I`, а не отдельный шаг, и попав в буфер он рвал бы цепочку.
     */
    if (MODIFIER_KEYS.has(event.key))
      return false

    // Пауза стирает буфер целиком, а не по одному событию: «полшага назад» —
    // состояние, которого пользователь не видит и предсказать не может.
    if (buffer.length > 0 && now - lastAt > timeoutMs)
      buffer = []

    buffer.push(event)
    lastAt = now

    // Длиннее самой длинной мыслимой цепочки буфер держать незачем.
    if (buffer.length > 8)
      buffer = buffer.slice(-8)

    return true
  }

  function matches(steps: readonly ParsedHotkeyCombo[], apple?: boolean): boolean {
    if (steps.length === 0 || buffer.length < steps.length)
      return false

    const tail = buffer.slice(-steps.length)

    return tail.every((event, index) => matchesHotkeyCombo(event, steps[index], apple))
  }

  return {
    push,
    matches,
    reset: () => {
      buffer = []
      lastAt = 0
    },
  }
}
