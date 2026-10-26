import type { GrButtonLoadingIndicator, GrButtonSize, GrButtonTone, GrButtonVariant } from '@feugene/granularity/components/GrButton'

import type { TokenGroup } from '../componentTokens'

export const variants: { id: GrButtonVariant, look: string, when: string }[] = [
  { id: 'primary', look: 'заливка тона', when: 'главное действие области — одно' },
  { id: 'secondary', look: 'подложка тона и рамка', when: 'сопутствующее; с neutral — обычная кнопка формы' },
  { id: 'outline', look: 'рамка тона', when: 'равноправные альтернативы' },
  { id: 'ghost', look: 'только подпись', when: 'строки таблиц, плотные панели' },
  { id: 'ghost-border', look: 'рамка под указателем', when: 'тулбары' },
]

export const tones: { id: GrButtonTone, verb: string }[] = [
  { id: 'primary', verb: 'Сохранить' },
  { id: 'neutral', verb: 'Продолжить' },
  { id: 'success', verb: 'Принять' },
  { id: 'warning', verb: 'Продолжить' },
  { id: 'danger', verb: 'Удалить' },
  { id: 'info', verb: 'Подробнее' },
  { id: 'slate', verb: 'В архив' },
  { id: 'azure', verb: 'Открыть' },
]

export const sizes: GrButtonSize[] = ['xs', 'sm', 'md', 'lg']

/** Умолчания пропов кнопки — резолверы `GrButton.vue`: их код примера не повторяет. */
const BUTTON_DEFAULTS = { variant: 'primary', tone: 'primary', size: 'md', loadingIndicator: 'spinner' } as const

/** Вид загрузки, пока ни тема, ни приложение его не выбрали. */
export const COMPONENT_LOADING_INDICATOR: GrButtonLoadingIndicator = BUTTON_DEFAULTS.loadingIndicator

export const loadingIndicators: { id: GrButtonLoadingIndicator, title: string, note: string }[] = [
  { id: 'spinner', title: 'спиннер', note: 'Спиннер встаёт на место иконки, а без неё ложится поверх подписи: ширина та же, соседи не едут.' },
  { id: 'track', title: 'отрезок по кромке', note: 'Отрезок бежит по нижней кромке, подпись и иконки на месте и чуть приглушены.' },
  { id: 'shimmer', title: 'свет по подписи', note: 'Свет проходит по глифам подписи; у кнопки из одной иконки остаётся спиннер.' },
]

const TONE_TOKEN = /^--gr-button-(primary|success|warning|danger|info|slate|azure)-/

/** Группы вкладки «Токены»: тоновые токены показываются по одному тону за раз. */
export const buttonTokenGroups: TokenGroup[] = [
  { id: 'tone', title: 'Цвет тона', match: TONE_TOKEN },
  { id: 'neutral', title: 'Нейтральная, прозрачные веса и недоступная', match: /^--gr-button-(?:neutral|ghost|disabled)-/ },
  { id: 'shape', title: 'Форма и подпись', match: /^--gr-button-(?:radius-|square-size|touch-size|font-weight|group-tray-)/ },
  { id: 'surface', title: 'Объём и свет', match: /^--gr-button-(?:shadow|surface-shadow|solid-image|glow|divider)/ },
  { id: 'motion', title: 'Движение и отклик', match: /^--gr-button-(?:motion|lift|press|response|shimmer|track|focus-offset)/ },
]

export function tokenTone(name: string): string | undefined {
  return TONE_TOKEN.exec(name)?.[1]
}

export type IconPlacement = 'none' | 'prefix' | 'suffix' | 'only'

export interface PlaygroundState {
  label: string
  variant: GrButtonVariant
  tone: GrButtonTone
  size: GrButtonSize
  icon: IconPlacement
  loading: boolean
  disabled: boolean
  block: boolean
  /** `theme` — проп не задан: вид загрузки выбирает тема. */
  indicator: 'theme' | GrButtonLoadingIndicator
}

export function initialPlayground(): PlaygroundState {
  return { label: 'Сохранить', variant: 'primary', tone: 'primary', size: 'md', icon: 'prefix', loading: false, disabled: false, block: false, indicator: 'theme' }
}

const escapeText = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
const escapeAttribute = (value: string): string => escapeText(value).replaceAll('"', '&quot;')

const ICON = '<GrIcon><IconPlus /></GrIcon>'
/** Длиннее — атрибуты по строке: так шаблон пишут руками. */
const INLINE_LIMIT = 72

/** Шаблон кнопки, как его написал бы потребитель: без пропов, совпавших с умолчанием. */
export function buttonSnippet(state: PlaygroundState): string {
  const attrs: string[] = []
  if (state.variant !== BUTTON_DEFAULTS.variant)
    attrs.push(`variant="${state.variant}"`)
  if (state.tone !== BUTTON_DEFAULTS.tone)
    attrs.push(`tone="${state.tone}"`)
  if (state.size !== BUTTON_DEFAULTS.size)
    attrs.push(`size="${state.size}"`)
  if (state.icon === 'only')
    attrs.push('square', `aria-label="${escapeAttribute(state.label)}"`)
  if (state.block)
    attrs.push('block')
  if (state.disabled)
    attrs.push('disabled')
  if (state.loading)
    attrs.push('loading')
  if (state.indicator !== 'theme')
    attrs.push(`loading-indicator="${state.indicator}"`)

  const inline = `<GrButton${attrs.map(attr => ` ${attr}`).join('')}>`
  const open = inline.length <= INLINE_LIMIT ? inline : `<GrButton\n${attrs.map(attr => `  ${attr}`).join('\n')}\n>`
  const label = escapeText(state.label)
  const body = {
    none: [label],
    prefix: ['<template #prefix>', `  ${ICON}`, '</template>', label],
    suffix: [label, '<template #suffix>', `  ${ICON}`, '</template>'],
    only: [ICON],
  }[state.icon]

  return [open, ...body.map(line => `  ${line}`), '</GrButton>'].join('\n')
}
