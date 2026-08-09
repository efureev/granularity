import type { ShowcaseComponentExampleDoc } from '../types'

export const grInputTagExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-tag-validation',
    title: 'Проверка тега перед добавлением',
    description: 'Асинхронный `beforeAdd` со спиннером, событие `reject` для объяснения отказа и `clearable` для сброса набора.',
    status: 'ready',
    previewKey: 'gr-input-tag-validation',  },
  {
    id: 'input-tag-basic-flow',
    title: 'Basic tag entry with live summary',
    description: 'Базовый live-demo фиксирует основной UX: ввод, `Enter`/separator commit и отражение списка тегов на стороне хоста.',
    status: 'ready',
    previewKey: 'gr-input-tag-basic-flow',  },
  {
    id: 'input-tag-max-state',
    title: 'Controlled limit with semantic state',
    description: 'Отдельно документируем сценарий с `max`: компонент удобно использовать для curated lists и constrained profile metadata.',
    status: 'ready',
    previewKey: 'gr-input-tag-max-state',  },
  {
    id: 'input-tag-custom-slot',
    title: 'Custom tag slot for semantic badges',
    description: 'Через slot `tag` витрина показывает, как host-screen может переоформить tag-pill и добавить собственные маркеры статуса.',
    status: 'ready',
    previewKey: 'gr-input-tag-custom-slot',  },
]
