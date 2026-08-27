import { describe, expect, it } from 'vitest'

import { createGrIssueLog, parseGrConsoleMessage } from '../resolve/issues'

describe('разбор сообщения консоли', () => {
  it('узнаёт общепакетный префикс', () => {
    expect(parseGrConsoleMessage(['[granularity] useToast() вызван вне setup'])).toEqual({
      component: null,
      message: 'useToast() вызван вне setup',
    })
  })

  it('узнаёт покомпонентный префикс и достаёт из него имя', () => {
    expect(parseGrConsoleMessage(['[GrModal] что-то не так'])).toEqual({
      component: 'GrModal',
      message: 'что-то не так',
    })
  })

  it('чужие сообщения не собирает', () => {
    expect(parseGrConsoleMessage(['[vite] connected'])).toBeNull()
    expect(parseGrConsoleMessage(['просто предупреждение'])).toBeNull()
    expect(parseGrConsoleMessage([{ not: 'a string' }])).toBeNull()
  })

  it('не принимает похожий префикс за свой', () => {
    expect(parseGrConsoleMessage(['[Grafana] отчёт готов'])).toBeNull()
  })
})

describe('журнал предупреждений', () => {
  it('повтор увеличивает счётчик, а не длину списка', () => {
    const log = createGrIssueLog()

    log.add('warning', ['[granularity] size="xs" не поддерживается'])
    log.add('warning', ['[granularity] size="xs" не поддерживается'])

    expect(log.list()).toHaveLength(1)
    expect(log.list()[0]?.count).toBe(2)
  })

  it('одно и то же сообщение из warn и error — разные записи', () => {
    const log = createGrIssueLog()

    log.add('warning', ['[GrModal] дубль'])
    log.add('error', ['[GrModal] дубль'])

    expect(log.list().map(issue => issue.kind)).toEqual(['warning', 'error'])
  })

  it('сообщает вызывающему, взял ли запись', () => {
    const log = createGrIssueLog()

    expect(log.add('warning', ['[granularity] своё'])).toBe(true)
    expect(log.add('warning', ['[webpack] чужое'])).toBe(false)
    expect(log.list()).toHaveLength(1)
  })

  it('очистка опустошает список', () => {
    const log = createGrIssueLog()
    log.add('warning', ['[granularity] своё'])
    log.clear()

    expect(log.list()).toEqual([])
  })
})
