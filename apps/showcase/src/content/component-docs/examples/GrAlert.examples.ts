import type { ShowcaseComponentExampleDoc } from '../types'

export const grAlertExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'alert-actions',
    title: 'Actions, self-dismissal and a message without an icon',
    description: 'Слот `actions` даёт кнопкам своё место под текстом, `v-model:visible` позволяет алерту скрыть себя, а `:icon="false"` убирает глиф там, где сообщение должно звучать спокойно.',
    status: 'ready',
    previewKey: 'gr-alert-actions',
  },
  {
    id: 'alert-tone-matrix',
    title: 'Semantic tones for inline feedback',
    description: 'Базовая матрица фиксирует ключевые alert-tone состояния, чтобы на странице компонента сразу был виден визуальный диапазон `info/success/warning/danger/slate/azure`.',
    status: 'ready',
    previewKey: 'gr-alert-variant-matrix',
  },
  {
    id: 'alert-closable-flow',
    title: 'Closable alert with host-level state',
    description: 'Без `v-model:visible` алерт себя не прячет: он шлёт `close`, а родительский экран сам решает, скрыть banner или спросить подтверждение.',
    status: 'ready',
    previewKey: 'gr-alert-closable-flow',
  },
  {
    id: 'alert-custom-colors',
    title: 'Brand-specific colors without layout overrides',
    description: 'Сценарий нужен для dashboard-команд, которым важно подстроить alert под доменный бренд, но сохранить icon/layout API компонента.',
    status: 'ready',
    previewKey: 'gr-alert-custom-colors',
  },
]
