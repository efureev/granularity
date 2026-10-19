import type { Component } from 'vue'

import IconAccessibility from '~icons/lucide/accessibility'
import IconActivity from '~icons/lucide/activity'
import IconPalette from '~icons/lucide/palette'
import IconPenLine from '~icons/lucide/pen-line'
import IconRuler from '~icons/lucide/ruler'
import IconShapes from '~icons/lucide/shapes'
import IconType from '~icons/lucide/type'

export interface Foundation {
  id: string
  title: string
  summary: string
  icon: Component
  load: () => Promise<{ default: Component }>
}

export const foundations: Foundation[] = [
  {
    id: 'color',
    title: 'Цвет',
    summary: 'Роли вместо оттенков, восемь тонов с одинаковым набором ролей, состояния и тёмная тема.',
    icon: IconPalette,
    load: () => import('./foundations/ColorFoundation.vue'),
  },
  {
    id: 'typography',
    title: 'Типографика',
    summary: 'Две шкалы — контент и контролы, кегль всегда в паре с межстрочным.',
    icon: IconType,
    load: () => import('./foundations/TypographyFoundation.vue'),
  },
  {
    id: 'space',
    title: 'Пространство и форма',
    summary: 'Отступы с шагом 4px, радиусы по назначению, три уровня тени и шкала слоёв.',
    icon: IconRuler,
    load: () => import('./foundations/SpaceFoundation.vue'),
  },
  {
    id: 'motion',
    title: 'Движение',
    summary: 'Три длительности и две кривые; с «уменьшить движение» уходят сдвиги, цвет остаётся.',
    icon: IconActivity,
    load: () => import('./foundations/MotionFoundation.vue'),
  },
  {
    id: 'accessibility',
    title: 'Доступность',
    summary: 'Фокус с клавиатуры, загрузка без потери фокуса, цвет не единственный носитель смысла.',
    icon: IconAccessibility,
    load: () => import('./foundations/AccessibilityFoundation.vue'),
  },
  {
    id: 'icons',
    title: 'Иконки',
    summary: 'Линейный набор Lucide, четыре ступени, ступень внутри контрола подсказывает сам контрол.',
    icon: IconShapes,
    load: () => import('./foundations/IconsFoundation.vue'),
  },
  {
    id: 'writing',
    title: 'Тексты интерфейса',
    summary: 'Кнопка — глагол и объект, опасное называется полностью, ошибка говорит, как исправить.',
    icon: IconPenLine,
    load: () => import('./foundations/WritingFoundation.vue'),
  },
]

export function findFoundation(id: string): Foundation | undefined {
  return foundations.find(item => item.id === id)
}
