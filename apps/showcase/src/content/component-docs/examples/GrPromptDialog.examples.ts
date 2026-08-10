import type { ShowcaseComponentExampleDoc } from '../types'

export const grPromptDialogExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'prompt-dialog-rename-flow',
    title: 'Rename flow with required value',
    description: 'Базовый сценарий для `GrPromptDialog`: controlled value, required validation и сохранение подтверждённого текста.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-rename-flow',
  },
  {
    id: 'prompt-dialog-optional-value',
    title: 'Optional input mode',
    description: 'Показываем `required=false`, placeholder и compact footer для необязательных handoff notes.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-optional-value',
  },
  {
    id: 'prompt-dialog-reset-flow',
    title: 'External source-of-truth reset',
    description: 'Изолируем кейс, когда значение приходит из внешнего store и должно сбрасываться на момент повторного открытия.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-reset-flow',
  },
  {
    id: 'prompt-dialog-imperative-service-link',
    title: 'Imperative service (useDialogService)',
    description: 'Нужен `prompt` без декларативного компонента в шаблоне? Императивный `useDialogService().prompt()` возвращает `Promise<string | null>` и собран с живыми примерами на отдельной странице composable.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-service-link',    note: 'Императивный prompt и остальные методы (confirm/alert) описаны на странице composable useDialogService.',
  },
  {
    id: 'prompt-dialog-multiline-rules',
    title: 'Multiline input with shared validation rules',
    description: '`multiline` даёт `GrTextarea` вместо однострочного поля, а `rules` — те же правила, что у `GrForm`: движок валидации в пакете один, а не отдельный у каждого компонента.',
    status: 'ready',
    previewKey: 'gr-prompt-dialog-multiline-rules',
  },
]
