import { describe, expect, it } from 'vitest'

import type { ThemeStateLike } from '../resolve/theme'
import { themeReport, themeState } from '../resolve/theme'

const MANIFEST: ThemeStateLike['manifest'] = {
  themes: [
    {
      id: 'slate',
      title: 'Сланец',
      modes: [
        { name: 'light', colorScheme: 'light', value: 'slate-light' },
        { name: 'dark', colorScheme: 'dark', value: 'slate-dark' },
        { name: 'ocean', colorScheme: 'dark', value: 'slate-ocean' },
      ],
      defaultMode: 'light',
    },
    {
      id: 'clay',
      title: 'Глина',
      modes: [{ name: 'light', colorScheme: 'light', value: 'clay-light' }, { name: 'dark', colorScheme: 'dark', value: 'clay-dark' }],
      defaultMode: 'light',
      href: '/assets/granum-theme-clay.css',
    },
  ],
  defaultTheme: 'slate',
  activation: { attribute: 'data-theme' },
}

function state(patch: Partial<ThemeStateLike> = {}): ThemeStateLike {
  return { manifest: MANIFEST, theme: { value: 'slate' }, mode: { value: 'dark' }, storageKey: 'gr-theme', persist: true, ...patch }
}

function probe(stored: string | null, prefersDark: boolean | null = false, root: string | null = 'slate-dark') {
  return { readStored: () => stored, prefersDark: () => prefersDark, readRoot: () => root }
}

function row(rows: { key: string, value: unknown }[], key: string): unknown {
  return rows.find(item => item.key === key)?.value
}

describe('тема и режим', () => {
  it('без состояния молчит', () => {
    expect(themeReport(undefined, probe(null))).toBeNull()
  })

  it('тема сборки, режим с colorScheme и набор режимов — из манифеста', () => {
    const rows = themeState(themeReport(state({ mode: { value: 'ocean' } }), probe('ocean', false, 'slate-ocean'))!)

    expect(row(rows, 'theme')).toBe('slate')
    expect(row(rows, 'mode')).toBe('ocean (dark)')
    expect(row(rows, 'modes')).toBe('light, dark, ocean')
    expect(row(rows, 'root attribute')).toBe('slate-ocean')
  })

  it('тема, переключённая в рантайме, — её режимы и пары', () => {
    const rows = themeState(themeReport(state({ theme: { value: 'clay' } }), probe('clay-dark', false, 'clay-dark'))!)

    expect(row(rows, 'theme')).toBe('clay')
    expect(row(rows, 'modes')).toBe('light, dark')
    expect(row(rows, 'root attribute')).toBe('clay-dark')
    // Ключ выбора дополнительной темы — с её именем: это и есть «сохранено пользователем».
    expect(themeReport(state({ theme: { value: 'clay' } }), probe('clay-dark'))!.source).toBe('storage')
  })

  it('пара на корне разошлась с режимом — показываем обе', () => {
    const rows = themeState(themeReport(state(), probe('dark', false, 'slate-light'))!)

    expect(row(rows, 'root attribute')).toBe('slate-light — expected slate-dark')
  })

  it('у состояния свой target — атрибут читается с него, а не с документа', () => {
    const target = () => ({ getAttribute: () => 'slate-dark' })

    expect(themeReport(state({ target }), probe('dark', false, null))?.rootValue).toBe('slate-dark')
  })
})

describe('источник режима', () => {
  it('совпал с сохранённым — режим выбрал пользователь', () => {
    expect(themeReport(state(), probe('dark'))?.source).toBe('storage')
  })

  it('в хранилище пусто — режим пришёл из системы', () => {
    expect(themeReport(state(), probe(null, true))?.source).toBe('system')
  })

  it('хранение выключено — источник не хранилище, даже если там что-то лежит', () => {
    const report = themeReport(state({ persist: false }), probe('light'))

    expect(report?.source).toBe('not-persisted')
    // Читать хранилище при выключенном `persist` нельзя: ядро его не читает тоже.
    expect(report?.stored).toBeNull()
  })

  it('сохранено одно, показано другое — так и говорим, а не выдумываем', () => {
    expect(themeReport(state({ mode: { value: 'light' } }), probe('dark'))?.source).toBe('unknown')
  })

  it('без matchMedia системная схема остаётся неизвестной, а не «светлой»', () => {
    const rows = themeState(themeReport(state(), probe('dark', null))!)

    expect(row(rows, 'system prefers dark')).toBe('unknown')
  })
})
