import type { ShowcaseComponentExampleDoc } from '../types'

export const grButtonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-builder',
    title: 'Interactive button constructor',
    description: 'Живой playground для всех ключевых пропсов `GrButton`: меняйте `variant`, `tone`, size, type и состояния без переключения между отдельными demo-картами.',
    status: 'ready',
    previewKey: 'ds-button-builder',
    code: '',
    note: 'Лучший формат для дизайн-ревью и QA: один сценарий сразу покрывает все пропсы компонента и помогает быстро проверить доступность icon-only режима.',
  },
  {
    id: 'button-state-matrix',
    title: 'Tone × variant state matrix',
    description: 'Полная матрица по всем `tone` и `variant`, включая live, `hover`, `focus` и `active` для дизайн-ревью и визуальной регрессии.',
    status: 'ready',
    previewKey: 'ds-button-state-matrix',
    code: '',
    note: 'Это тот же сценарий, который раньше жил в `playground-5`: удобно сравнивать новые tones и проверять state-contract без ручного наведения.',
  },
]
