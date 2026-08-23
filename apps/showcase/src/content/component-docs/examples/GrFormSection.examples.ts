import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormSectionExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-section-actions',
    title: 'Heading level, actions and slots',
    description: 'Заголовок секции — настоящий `h2`…`h6` (`heading-level`, по умолчанию `h3`): именно по заголовкам незрячий пользователь обходит длинную форму. Слот `#title` собирает заголовок разметкой, `#actions` кладёт кнопки в правую часть шапки. Лендмарком секция становится только по пропу `landmark` — иначе пять секций дали бы пять регионов в обзоре.',
    status: 'ready',
    previewKey: 'gr-form-section-actions',
  },
  {
    id: 'form-section-profile-layout',
    title: 'Section heading with profile fields',
    description: 'Показываем базовую роль `GrFormSection`: лёгкий heading-wrapper для связанных полей и описания секции.',
    status: 'ready',
    previewKey: 'gr-form-section-profile-layout',
  },
  {
    id: 'form-section-nested-groups',
    title: 'Grouped controls inside one section',
    description: 'Отдельный пример фиксирует composition-паттерн, где `GrFormSection` оборачивает и form fields, и более свободные control groups.',
    status: 'ready',
    previewKey: 'gr-form-section-nested-groups',
  },
  {
    id: 'form-section-stacked-flow',
    title: 'Stacked multi-section flow',
    description: 'Такой сценарий показывает, что несколько `GrFormSection` подряд могут собирать skeleton полноценной settings-страницы без тяжёлой layout-обвязки.',
    status: 'ready',
    previewKey: 'gr-form-section-stacked-flow',
  },
  {
    id: 'form-section-bordered',
    title: 'Bordered & rounded-border sections',
    description: 'У `GrFormSection` один корневой `<section>`, поэтому `class` проходит на него насквозь (fallthrough) и мержится с внутренним `grid gap-4`. Так секцию легко превратить в карточку — прямоугольная рамка (`border`) или скруглённая (`rounded-2xl border`) задаётся обычными utility-классами, без пропсов.',
    status: 'ready',
    previewKey: 'gr-form-section-bordered',
    note: 'Внутренний вертикальный ритм секции (`grid gap-4`) сохраняется — добавляемые классы только расширяют оформление (рамка, паддинги, фон, скругление).',
  },
]
