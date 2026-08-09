import type { ShowcaseComponentExampleDoc } from '../types'

export const grLinkExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'link-builder',
    title: 'Interactive link constructor',
    description: 'Соберите `GrLink` под ваш сценарий: переключайте tone, underline, size, навигационные атрибуты и сразу смотрите итоговый snippet.',
    status: 'ready',
    previewKey: 'gr-link-builder',
    hideCode: true,
  },
  {
    id: 'link-variants',
    title: 'Variants and underline modes',
    description: 'На витрине важно сравнить `tone`, `underline` и size contract, потому что `GrLink` часто используется как inline action вместо кнопки.',
    status: 'ready',
    previewKey: 'gr-link-variants',  },
  {
    id: 'link-external',
    title: 'Внешние ссылки и смена контекста',
    description: 'Ссылка, открывающаяся в новой вкладке, сама получает иконку, безопасный `rel` и скрытое предупреждение о смене контекста (WCAG 3.2.5).',
    status: 'ready',
    previewKey: 'gr-link-external',  },
  {
    id: 'link-disabled-states',
    title: 'Disabled and muted states',
    description: 'Отдельно показываем disabled/muted сценарии, чтобы было понятно, как `GrLink` деградирует до неинтерактивного inline элемента.',
    status: 'ready',
    previewKey: 'gr-link-disabled-states',  },
]
