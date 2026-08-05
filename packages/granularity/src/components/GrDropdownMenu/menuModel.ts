import type { Component } from 'vue'

import type { GrDropdownMenuItemRole } from './GrDropdownMenuItem.vue'
import type { GrDropdownMenuItemVariant } from './grDropdownMenuStyles'

/**
 * Декларативная модель меню.
 *
 * Композиция из подкомпонентов остаётся основным способом — она нужна там, где
 * пункт нестандартный. Но девять меню из десяти однотипны («иконка, подпись,
 * шорткат, иногда разделитель»), и собирать их из пяти компонентов вручную
 * значит каждый раз заново решать, где `role`, где `disabled`, где ключ.
 */
export interface GrDropdownMenuAction {
  /** Ключ пункта — он же приходит в `select`. */
  key: string
  label: string
  icon?: Component
  shortcut?: string
  disabled?: boolean
  variant?: GrDropdownMenuItemVariant
  role?: GrDropdownMenuItemRole
  /** Состояние переключателя для `menuitemcheckbox`/`menuitemradio`. */
  checked?: boolean
  /** Пункт-ссылка: рендерится как `<a>` с этим `href`. */
  href?: string
}

export interface GrDropdownMenuSeparator {
  type: 'divider'
  inset?: boolean
}

export interface GrDropdownMenuSection {
  type: 'group'
  title?: string
  items: GrDropdownMenuAction[]
}

export type GrDropdownMenuEntry = GrDropdownMenuAction | GrDropdownMenuSeparator | GrDropdownMenuSection

export function isMenuSeparator(entry: GrDropdownMenuEntry): entry is GrDropdownMenuSeparator {
  return 'type' in entry && entry.type === 'divider'
}

export function isMenuSection(entry: GrDropdownMenuEntry): entry is GrDropdownMenuSection {
  return 'type' in entry && entry.type === 'group'
}

export function isMenuAction(entry: GrDropdownMenuEntry): entry is GrDropdownMenuAction {
  return !isMenuSeparator(entry) && !isMenuSection(entry)
}
