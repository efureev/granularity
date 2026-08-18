import type { ShowcaseComponentExampleDoc } from '../types'

export const grChipExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'chip-tags',
    title: 'Метки записи со снятием',
    description: 'Крестик у каждой метки, состав ведёт приложение.',
    status: 'ready',
    previewKey: 'gr-chip-tags',
    note: 'Событие `remove` — это просьба: чип не прячет себя сам, потому что массив лежит у вас.',
  },
  {
    id: 'chip-icon',
    title: 'Иконка, переключатель, выключенный чип',
    description: 'Три состояния подряд: метка с иконкой, чип-переключатель и недоступный чип.',
    status: 'ready',
    previewKey: 'gr-chip-icon',
    note: 'У выключенного чипа крестика нет вовсе: он обещал бы действие, которого нет.',
  },
  {
    id: 'chip-tones',
    title: 'Тона и размеры',
    description: 'Восемь тонов в светлом и плотном вариантах и четыре ступени размера.',
    status: 'ready',
    previewKey: 'gr-chip-tones',
  },
]
