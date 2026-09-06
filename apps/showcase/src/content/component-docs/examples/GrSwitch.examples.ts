import type { ShowcaseComponentExampleDoc } from '../types'

export const grSwitchExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'switch-builder',
    title: 'Interactive switch constructor',
    description: 'Соберите `GrSwitch` под ваш сценарий: меняйте состояние, size, подпись и локальные color overrides, сразу получая итоговый snippet.',
    status: 'ready',
    previewKey: 'gr-switch-builder',
    hideCode: true,
  },
  {
    id: 'switch-size-scale',
    title: 'Size scale from compact to prominent',
    description: 'Один сценарий показывает, как переключатель масштабируется от компактных control bars до больших form-sections без изменения поведения.',
    status: 'ready',
    previewKey: 'gr-switch-size-scale',
  },
  {
    id: 'switch-disabled-labeled',
    title: 'Labeled switches and disabled state',
    description: 'Показываем, что label живёт в default slot, а disabled-режим одинаково корректно работает и для управляемого, и для статически включённого switch.',
    status: 'ready',
    previewKey: 'gr-switch-disabled-labeled',
  },
  {
    id: 'switch-state-text',
    title: 'On/off labels inside the track',
    description: 'Состояние читается без сравнения с соседями: подпись стоит в свободной части дорожки. Тексты берутся из локали или задаются пропами; на `xs` и `sm` подписи нет — там для неё нет места.',
    status: 'ready',
    previewKey: 'gr-switch-state-text',
  },
  {
    id: 'switch-thumb-icon',
    title: 'Action icon on the thumb',
    description: 'Знак на самом бегунке, свой у каждого состояния: галочка и крестик, луна и солнце. Размер идёт за ступенью переключателя, а на время запроса знак сменяет спиннер.',
    status: 'ready',
    previewKey: 'gr-switch-thumb-icon',
  },
  {
    id: 'switch-auto-width',
    title: 'Track that grows with the label',
    description: 'Отдельный режим `autoWidth`: дорожка растягивается под подпись, а ступень размера остаётся нижней границей. Ширина не дёргается при переключении — её держит невидимый дубль противоположного текста.',
    status: 'ready',
    previewKey: 'gr-switch-auto-width',
  },
  {
    id: 'switch-custom-colors',
    title: 'Custom active and inactive colors',
    description: 'Фиксируем одну из ключевых интеграционных возможностей компонента: локально переопределять цвета трека без изменения глобальной темы.',
    status: 'ready',
    previewKey: 'gr-switch-custom-colors',
  },
]
