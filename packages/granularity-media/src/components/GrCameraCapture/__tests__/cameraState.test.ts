import { describe, expect, it } from 'vitest'

import {
  cameraFrameRect,
  cameraStatusFromError,
  cameraSupported,
  shouldMirrorPreview,
} from '../cameraState'

function domError(name: string): Error {
  const error = new Error('camera')
  error.name = name

  return error
}

describe('cameraStatusFromError', () => {
  it('отказ пользователя и запрет политики — одно состояние', () => {
    expect(cameraStatusFromError(domError('NotAllowedError'))).toBe('denied')
    expect(cameraStatusFromError(domError('SecurityError'))).toBe('denied')
  })

  it('отсутствие устройства не путается с отказом', () => {
    // «Разрешите доступ» при отсутствующей камере отправляет пользователя
    // искать настройку, которой нет.
    expect(cameraStatusFromError(domError('NotFoundError'))).toBe('missing')
    expect(cameraStatusFromError(domError('OverconstrainedError'))).toBe('missing')
  })

  it('занятое устройство опознаётся во всех трёх браузерных именах', () => {
    for (const name of ['NotReadableError', 'TrackStartError', 'AbortError'])
      expect(cameraStatusFromError(domError(name))).toBe('busy')
  })

  it('незнакомое имя не выдаёт себя за отказ', () => {
    expect(cameraStatusFromError(domError('WeirdError'))).toBe('error')
    expect(cameraStatusFromError('строка вместо ошибки')).toBe('error')
  })
})

describe('cameraSupported', () => {
  it('без `mediaDevices` API считается недоступным', () => {
    expect(cameraSupported(undefined)).toBe(false)
    expect(cameraSupported({} as Navigator)).toBe(false)
  })

  it('наличие объекта без метода не считается поддержкой', () => {
    expect(cameraSupported({ mediaDevices: {} } as Navigator)).toBe(false)
  })

  it('метод на месте — поддержка есть', () => {
    expect(cameraSupported({ mediaDevices: { getUserMedia: () => {} } } as unknown as Navigator)).toBe(true)
  })
})

describe('shouldMirrorPreview', () => {
  it('фронтальную зеркалит, тыловую — нет', () => {
    expect(shouldMirrorPreview('user', undefined)).toBe(true)
    expect(shouldMirrorPreview('environment', undefined)).toBe(false)
  })

  it('явный проп сильнее умолчания по камере', () => {
    expect(shouldMirrorPreview('user', false)).toBe(false)
    expect(shouldMirrorPreview('environment', true)).toBe(true)
  })
})

describe('cameraFrameRect', () => {
  it('из широкого кадра берёт центральный квадрат', () => {
    const rect = cameraFrameRect({ width: 1280, height: 720 }, 1)

    expect(rect.sw).toBeCloseTo(720)
    expect(rect.sh).toBeCloseTo(720)
    expect(rect.sx).toBeCloseTo((1280 - 720) / 2)
    expect(rect.sy).toBeCloseTo(0)
  })

  it('из высокого кадра срезает по вертикали', () => {
    const rect = cameraFrameRect({ width: 720, height: 1280 }, 1)

    expect(rect.sh).toBeCloseTo(720)
    expect(rect.sy).toBeCloseTo((1280 - 720) / 2)
  })

  it('совпадающее соотношение ничего не срезает', () => {
    expect(cameraFrameRect({ width: 1600, height: 900 }, 16 / 9)).toEqual({
      sx: 0,
      sy: 0,
      sw: 1600,
      sh: 900,
    })
  })

  it('до первого кадра отдаёт пустой прямоугольник, а не деление на ноль', () => {
    expect(cameraFrameRect({ width: 0, height: 0 }, 1)).toEqual({ sx: 0, sy: 0, sw: 0, sh: 0 })
  })
})
