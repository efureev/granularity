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
    previewKey: 'gr-switch-size-scale',  },
  {
    id: 'switch-disabled-labeled',
    title: 'Labeled switches and disabled state',
    description: 'Показываем, что label живёт в default slot, а disabled-режим одинаково корректно работает и для управляемого, и для статически включённого switch.',
    status: 'ready',
    previewKey: 'gr-switch-disabled-labeled',  },
  {
    id: 'switch-custom-colors',
    title: 'Custom active and inactive colors',
    description: 'Фиксируем одну из ключевых интеграционных возможностей компонента: локально переопределять цвета трека без изменения глобальной темы.',
    status: 'ready',
    previewKey: 'gr-switch-custom-colors',  },
]
