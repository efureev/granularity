import { grThemeCatalog } from './generated'
import type { GrColorScheme } from './types'

/** Тема каталога, которую берёт сборка без `theme` в конфиге granum. */
export const GR_DEFAULT_THEME_ID = 'slate'

export interface GrThemeManifestMode {
  readonly name: string
  readonly title?: string
  readonly colorScheme: GrColorScheme
  readonly value: string
}

/** Тема в манифесте: режимы с парами активации, режим по умолчанию. */
export interface GrThemeManifestTheme {
  readonly id: string
  readonly title: string
  readonly modes: readonly GrThemeManifestMode[]
  readonly defaultMode: string
}

/**
 * Манифест тем в форме `virtual:granum/themes`: темы с режимами и парами,
 * основная тема и атрибут активации. Адресов листов в нём нет — лист темы
 * подключает само приложение.
 */
export interface GrThemeManifest {
  readonly themes: readonly GrThemeManifestTheme[]
  readonly defaultTheme: string
  readonly activation: { readonly attribute: string, readonly value: string }
}

/**
 * Манифест темы каталога для приложения без плагина granum — тема подключена
 * готовым `@feugene/granularity/themes/<id>.css`. Пары собраны по правилу
 * granum по умолчанию: атрибут `data-theme`, значение `<тема>-<режим>`.
 * Приложение на granum берёт манифест из `virtual:granum/themes`: там пары тех
 * тем и того набора режимов, что попали в его CSS.
 */
export function grThemeManifest(id: string = GR_DEFAULT_THEME_ID): GrThemeManifest {
  const entry = grThemeCatalog.find(theme => theme.id === id)
  if (!entry)
    throw new Error(`grThemeManifest: темы "${id}" нет в каталоге — есть ${grThemeCatalog.map(theme => theme.id).join(', ')}`)
  // Режим по умолчанию первым — порядок блоков CSS и манифеста granum.
  const modes = [...entry.modes].sort((a, b) => Number(b.name === entry.defaultMode) - Number(a.name === entry.defaultMode))
  return {
    themes: [{
      id: entry.id,
      title: entry.title,
      modes: modes.map(mode => ({
        name: mode.name,
        ...(mode.title !== undefined ? { title: mode.title } : {}),
        colorScheme: mode.colorScheme,
        value: `${entry.id}-${mode.name}`,
      })),
      defaultMode: entry.defaultMode,
    }],
    defaultTheme: entry.id,
    activation: { attribute: 'data-theme', value: '{theme}-{mode}' },
  }
}
