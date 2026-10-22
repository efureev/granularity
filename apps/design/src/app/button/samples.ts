/**
 * Строки сравнения тем: одно и то же содержимое в каждой теме каталога. Набор
 * покрывает то, чем темы кнопки различаются, — объём, рамки весов, ячейку
 * иконки, загрузку, недоступность и группу (`docs/design/GrButton.md`).
 */
export const buttonSamples = [
  { id: 'main', title: 'Главное и второстепенное' },
  { id: 'weights', title: 'Веса тона' },
  { id: 'icon', title: 'С иконкой' },
  { id: 'loading', title: 'Загрузка' },
  { id: 'disabled', title: 'Недоступная' },
  { id: 'group', title: 'Группа' },
] as const

export type ButtonSampleId = typeof buttonSamples[number]['id']
