import type { ShowcaseComponentExampleDoc } from '../types'

export const grAlertExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'alert-tone-matrix',
    title: 'Semantic tones for inline feedback',
    description: 'Базовая матрица фиксирует ключевые alert-tone состояния, чтобы на странице компонента сразу был виден визуальный диапазон `info/success/warning/danger/slate/azure`.',
    status: 'ready',
    previewKey: 'gr-alert-variant-matrix',  },
  {
    id: 'alert-closable-flow',
    title: 'Closable alert with host-level state',
    description: 'Отдельно показываем, что `GrAlert` не скрывается сам по себе: родительский экран получает `close` и сам решает, когда вернуть banner обратно.',
    status: 'ready',
    previewKey: 'gr-alert-closable-flow',  },
  {
    id: 'alert-custom-colors',
    title: 'Brand-specific colors without layout overrides',
    description: 'Сценарий нужен для dashboard-команд, которым важно подстроить alert под доменный бренд, но сохранить icon/layout API компонента.',
    status: 'ready',
    previewKey: 'gr-alert-custom-colors',  },
]
