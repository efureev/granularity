/**
 * Тема, режим и откуда взялся режим.
 *
 * `data-theme` на корне и содержимое хранилища видно и в браузере — этот
 * раздел про другое: режим выбран пользователем и сохранён, или подхвачен из
 * системной `prefers-color-scheme`, или хранение вообще выключено. Вопрос
 * «почему тёмный, я же выбрал светлый» — именно про источник, а не про
 * значение. Пара на корне показана рядом: разойдись она с режимом состояния —
 * атрибут переписал кто-то мимо `useTheme`.
 */

export type ThemeSource = 'storage' | 'system' | 'not-persisted' | 'unknown'

interface ModeEntryLike {
  name: string
  colorScheme: string
  value: string
}

export interface ThemeStateLike {
  manifest: {
    theme: { id: string }
    modes: readonly ModeEntryLike[]
    activation: { attribute: string }
  }
  mode: { value: string }
  storageKey: string
  persist: boolean
  target?: () => { getAttribute: (name: string) => string | null } | null
}

export interface ThemeReport {
  theme: string
  mode: string
  colorScheme: string | null
  modes: string[]
  /** Значение атрибута активации на корне приложения. */
  rootValue: string | null
  /** Пара текущего режима по манифесту. */
  expectedValue: string | null
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
  /** Атрибут корня документа, когда у состояния нет своего `target`. */
  readRoot: (attribute: string) => string | null
}

export function themeReport(state: ThemeStateLike | undefined, probe: ThemeProbe): ThemeReport | null {
  if (!state)
    return null

  const { manifest } = state
  const mode = state.mode.value
  const entry = manifest.modes.find(item => item.name === mode)
  const attribute = manifest.activation.attribute
  const root = state.target?.()
  const stored = state.persist ? probe.readStored(state.storageKey) : null

  return {
    theme: manifest.theme.id,
    mode,
    colorScheme: entry?.colorScheme ?? null,
    modes: manifest.modes.map(item => item.name),
    rootValue: root ? root.getAttribute(attribute) : probe.readRoot(attribute),
    expectedValue: entry?.value ?? null,
    // Порядок тот же, что у самого ядра при старте: сохранённое сильнее
    // системного, а без хранения источником остаётся система.
    source: resolveSource(state, stored),
    storageKey: state.storageKey,
    stored,
    systemPrefersDark: probe.prefersDark(),
  }
}

function resolveSource(state: ThemeStateLike, stored: string | null): ThemeSource {
  if (!state.persist)
    return 'not-persisted'
  if (stored === null)
    return 'system'
  // Сохранённое есть, но режим другой — пару принёс сервер или режим сменили
  // мимо хранилища. Врать «из хранилища» нельзя.
  return stored === state.mode.value ? 'storage' : 'unknown'
}

const SOURCE_LABELS: Record<ThemeSource, string> = {
  'storage': 'saved by the user',
  'system': 'system preference (nothing saved)',
  'not-persisted': 'persistence is off — session only',
  'unknown': 'differs from the saved value — set by the server or at runtime?',
}

export function themeState(report: ThemeReport): { key: string, value: unknown }[] {
  const rootMatches = report.rootValue === report.expectedValue

  return [
    { key: 'theme', value: report.theme },
    { key: 'mode', value: report.colorScheme ? `${report.mode} (${report.colorScheme})` : report.mode },
    { key: 'modes', value: report.modes.join(', ') },
    {
      key: 'root attribute',
      value: rootMatches
        ? report.rootValue
        : `${report.rootValue ?? '—'} — expected ${report.expectedValue ?? '—'}`,
    },
    { key: 'source', value: SOURCE_LABELS[report.source] },
    { key: 'storage key', value: report.storageKey },
    { key: 'stored value', value: report.stored ?? '—' },
    { key: 'system prefers dark', value: report.systemPrefersDark === null ? 'unknown' : report.systemPrefersDark },
  ]
}
