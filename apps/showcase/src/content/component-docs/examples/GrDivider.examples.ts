import type { ShowcaseComponentExampleDoc } from '../types'

export const grDividerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'divider-basic',
    title: 'Horizontal, labeled and vertical',
    description: 'Простая линия (`<hr>`), линия с меткой (`label` + `align`) и вертикальный разделитель (`orientation="vertical"`).',
    status: 'ready',
    previewKey: 'gr-divider-basic',
  },
  {
    id: 'divider-variants',
    title: 'Line style, spacing and explicit length',
    description: '`variant` (`solid`/`dashed`/`dotted`), `thickness` через `--gr-divider-thickness`, `spacing` по шкале пакета и `length` — высота вертикального разделителя там, где flex-родителя нет и растянуться не от чего.',
    status: 'ready',
    previewKey: 'gr-divider-variants',
  },
]
