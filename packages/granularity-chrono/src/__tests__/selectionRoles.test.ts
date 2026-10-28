import { describe, expect, it } from 'vitest'

import { calendarDayClass, calendarPeriodClass } from '../components/GrCalendar/grCalendarStyles'
import { timeOptionClass } from '../components/GrTimePicker/grTimePickerStyles'

/**
 * Выбор в пакете — роль выбора ядра, а не основной тон: выбранный день, период и
 * значение колонки времени красятся `--gr-selected` / `--gr-selected-fg`, как
 * отметки и пункты списков ядра. Контраст этой пары держит тема — её проверяет
 * `defineTheme` пакета токенов, — поэтому здесь проверяется только то, что
 * компонент берёт именно её. На `--gr-primary` выбор в «Глине» вышел бы глиняным,
 * а у ядра он графитовый.
 */
const SELECTED = ['var(--gr-selected)', 'var(--gr-selected-fg)']

describe('выбор красится ролью выбора', () => {
  it.each([
    ['день', calendarDayClass({ size: 'md', inMonth: true, today: false, selected: true, disabled: false })],
    ['период', calendarPeriodClass({ size: 'md', selected: true, current: false, disabled: false })],
    ['значение колонки времени', timeOptionClass({ size: 'md', selected: true, active: false, disabled: false })],
  ])('%s', (_name, classes) => {
    for (const role of SELECTED)
      expect(classes).toContain(role)
    expect(classes).not.toContain('--gr-primary')
  })
})
