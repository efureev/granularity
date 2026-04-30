import { splitClassTokens } from '../shared/classTokens'
import {
  DEFAULT_GR_DIALOG_BODY_CONFIG,
  DEFAULT_GR_DIALOG_FOOTER_CONFIG,
  DEFAULT_GR_DIALOG_HEADER_CONFIG,
} from './dialogShared'

// В safelist попадают ТОЛЬКО токены, которые нельзя обнаружить статическим
// сканом шаблонов: значения из дефолтных конфигов секций (`paddingX`/`paddingY`),
// которые используются через `:class` и могут переопределяться консьюмером.
//
// Все литералы, прописанные напрямую в шаблонах (`class="..."` или
// статические строки в `:class="[...]"` внутри .vue), UnoCSS найдёт сам —
// дублировать их здесь не нужно.
function configTokens(config: { paddingX: string, paddingY: string }): string[] {
  return [
    ...splitClassTokens(config.paddingX),
    ...splitClassTokens(config.paddingY),
  ]
}

export const grDialogSafelist = [...new Set([
  ...configTokens(DEFAULT_GR_DIALOG_HEADER_CONFIG),
  ...configTokens(DEFAULT_GR_DIALOG_FOOTER_CONFIG),
  ...configTokens(DEFAULT_GR_DIALOG_BODY_CONFIG),
])]
