import { describe, expect, it } from 'vitest'

import type { ThemeStateLike } from '../resolve/theme'
import { themeReport, themeState } from '../resolve/theme'

function state(patch: Partial<ThemeStateLike> = {}): ThemeStateLike {
  return { theme: { value: 'dark' }, storageKey: 'gr-theme', persist: true, ...patch }
}

function probe(stored: string | null, prefersDark: boolean | null = false) {
  return { readStored: () => stored, prefersDark: () => prefersDark }
}

describe('источник темы', () => {
  it('без состояния молчит', () => {
    expect(themeReport(undefined, probe(null))).toBeNull()
  })

  it('совпало с сохранённым — тему выбрал пользователь', () => {
    expect(themeReport(state(), probe('dark'))?.source).toBe('storage')
  })

  it('в хранилище пусто — тема пришла из системы', () => {
    expect(themeReport(state(), probe(null, true))?.source).toBe('system')
  })

  it('хранение выключено — источник не хранилище, даже если там что-то лежит', () => {
    const report = themeReport(state({ persist: false }), probe('light'))

    expect(report?.source).toBe('not-persisted')
    // Читать хранилище при выключенном `persist` нельзя: ядро его не читает тоже.
    expect(report?.stored).toBeNull()
  })

  it('сохранено одно, показано другое — так и говорим, а не выдумываем', () => {
    expect(themeReport(state({ theme: { value: 'light' } }), probe('dark'))?.source).toBe('unknown')
  })

  it('без matchMedia системная тема остаётся неизвестной, а не «светлой»', () => {
    const rows = themeState(themeReport(state(), probe('dark', null))!)

    expect(rows.find(row => row.key === 'system prefers dark')?.value).toBe('unknown')
  })
})
