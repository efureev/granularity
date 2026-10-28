import { componentSheet, lookElement } from '@feugene/granularity-test-kit/vue'
import { describe, expect, it } from 'vitest'

/**
 * Выбор в пакете — роль выбора ядра, а не основной тон: выбранный день, период и
 * значение колонки времени красятся `--gr-selected` / `--gr-selected-fg`, как
 * отметки и пункты списков ядра. Контраст этой пары держит тема — её проверяет
 * `defineTheme` пакета токенов, — поэтому здесь проверяется только то, что
 * компонент берёт именно её. На `--gr-primary` выбор в «Глине» вышел бы глиняным,
 * а у ядра он графитовый.
 */
const calendar = componentSheet('GrCalendar/GrCalendar.vue')
const time = componentSheet('GrTimePicker/GrTimePicker.vue')

describe('выбор красится ролью выбора', () => {
  it.each([
    ['день', calendar, lookElement('span', { 'data-gr-calendar-day': '', 'data-gr-selected': '' })],
    ['период', calendar, lookElement('span', { 'data-gr-calendar-period': '', 'aria-selected': 'true' })],
    ['значение колонки времени', time, lookElement('div', { 'data-gr-time-picker-option': '', 'aria-selected': 'true' })],
  ])('%s', (_name, sheet, element) => {
    const look = sheet.look(element)

    expect(look['background-color']).toContain('var(--gr-selected)')
    expect(look.color).toContain('var(--gr-selected-fg)')
    expect(JSON.stringify(look)).not.toContain('--gr-primary')
  })
})
