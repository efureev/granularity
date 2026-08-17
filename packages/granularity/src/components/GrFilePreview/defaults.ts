import type { GrSizeWithPx } from '../shared/sizes'

import type { GrFilePreviewRatio } from './grFilePreviewStyles'

/**
 * Пропы `GrFilePreview`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrFilePreview: { … } }">`.
 *
 * Только оформление: `src`, `mime` и `name` принадлежат файлу. Размер и
 * пропорции здесь потому, что лента вложений выглядит одинаково на всех
 * страницах, и повторять решение у каждой плитки значит однажды разойтись.
 */
export interface GrFilePreviewConfigurableProps {
  tileSize: GrSizeWithPx
  ratio: GrFilePreviewRatio
  loading: 'lazy' | 'eager'
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFilePreview: GrFilePreviewConfigurableProps
  }
}
