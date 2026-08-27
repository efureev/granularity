/**
 * Откуда взялась тема.
 *
 * `data-theme` на корне и содержимое `localStorage` видно и в браузере — этот
 * раздел про другое: тема выбрана пользователем и сохранена, или подхвачена из
 * системной `prefers-color-scheme`, или хранение вообще выключено. Вопрос
 * «почему тёмная, я же выбрал светлую» — именно про источник, а не про
 * значение.
 */

export type ThemeSource = 'storage' | 'system' | 'not-persisted' | 'unknown'

export interface ThemeStateLike {
  theme: { value: string }
  storageKey: string
  persist: boolean
}

export interface ThemeReport {
  theme: string
  source: ThemeSource
  storageKey: string
  stored: string | null
  systemPrefersDark: boolean | null
}

export interface ThemeProbe {
  /** Значение из хранилища; `null` — ключа нет или доступ запрещён. */
  readStored: (key: string) => string | null
  /** Системная тема; `null` — `matchMedia` недоступен. */
  prefersDark: () => boolean | null
}

export function themeReport(state: ThemeStateLike | undefined, probe: ThemeProbe): ThemeReport | null {
  if (!state)
    return null

  const stored = state.persist ? probe.readStored(state.storageKey) : null
  const systemPrefersDark = probe.prefersDark()

  return {
    theme: state.theme.value,
    // Порядок тот же, что у самого ядра при старте: сохранённое сильнее
    // системного, а без хранения источником остаётся система.
    source: resolveSource(state, stored),
    storageKey: state.storageKey,
    stored,
    systemPrefersDark,
  }
}

function resolveSource(state: ThemeStateLike, stored: string | null): ThemeSource {
  if (!state.persist)
    return 'not-persisted'
  if (stored === null)
    return 'system'
  // Сохранённое есть, но тема другая — значит её сменили в рантайме и ещё не
  // записали, либо записал кто-то мимо контракта. Врать «из хранилища» нельзя.
  return stored === state.theme.value ? 'storage' : 'unknown'
}

const SOURCE_LABELS: Record<ThemeSource, string> = {
  'storage': 'saved by the user',
  'system': 'system preference (nothing saved)',
  'not-persisted': 'persistence is off — session only',
  'unknown': 'differs from the saved value — changed at runtime?',
}

export function themeState(report: ThemeReport): { key: string, value: unknown }[] {
  return [
    { key: 'theme', value: report.theme },
    { key: 'source', value: SOURCE_LABELS[report.source] },
    { key: 'storage key', value: report.storageKey },
    { key: 'stored value', value: report.stored ?? '—' },
    { key: 'system prefers dark', value: report.systemPrefersDark === null ? 'unknown' : report.systemPrefersDark },
  ]
}
