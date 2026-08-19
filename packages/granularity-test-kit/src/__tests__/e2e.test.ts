import { describe, expect, it } from 'vitest'

import { createA11yBaseline, selectRegressions } from '../e2e'

const violation = (id: string, impact: string, nodes = 1) => ({
  id,
  impact,
  help: `правило ${id}`,
  nodes: Array.from({ length: nodes }, () => ({})),
})

describe('selectRegressions', () => {
  it('пропускает только блокирующие impact', () => {
    const found = selectRegressions([
      violation('button-name', 'critical'),
      violation('region', 'moderate'),
      violation('label', 'serious'),
    ])

    expect(found.map(entry => entry.id)).toEqual(['button-name', 'label'])
  })

  it('вычитает долг по идентификатору правила, а не по узлам', () => {
    const found = selectRegressions(
      [violation('button-name', 'critical', 7), violation('label', 'serious')],
      { known: ['button-name'] },
    )

    expect(found.map(entry => entry.id)).toEqual(['label'])
  })

  it('отдаёт число узлов, а не сами узлы: в сообщении нужен размер, а не разметка', () => {
    expect(selectRegressions([violation('label', 'serious', 3)])[0]).toEqual({
      id: 'label',
      impact: 'serious',
      nodes: 3,
      help: 'правило label',
    })
  })

  it('нарушение без impact блокирующим не считается', () => {
    expect(selectRegressions([{ id: 'x', help: 'x', nodes: [] }])).toEqual([])
  })
})

describe('createA11yBaseline', () => {
  const known = { GrSelect: ['nested-interactive'], GrTree: ['aria-required-children'] }

  it('отдаёт долг цели и пустой список для незнакомой', () => {
    const baseline = createA11yBaseline(known, { env: {} })

    expect(baseline.knownIssuesFor('GrSelect')).toEqual(['nested-interactive'])
    expect(baseline.knownIssuesFor('GrButton')).toEqual([])
    expect(baseline.auditMode).toBe(false)
  })

  it('режим аудита обнуляет долг: прогон обязан упасть на всём, что есть', () => {
    const baseline = createA11yBaseline(known, { env: { A11Y_AUDIT: '1' } })

    expect(baseline.auditMode).toBe(true)
    expect(baseline.knownIssuesFor('GrSelect')).toEqual([])
  })

  it('любое другое значение переменной режим не включает', () => {
    expect(createA11yBaseline(known, { env: { A11Y_AUDIT: 'true' } }).auditMode).toBe(false)
  })
})
