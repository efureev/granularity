import { describe, expect, it } from 'vitest'

import { schemaArrayListClass, schemaRowClass, schemaSectionsClass } from '../components/GrSchemaForm/grSchemaFormStyles'

/**
 * Своего вида у формы два места — промежуток между разделами и строка повторителя, —
 * и оба решает тема: «Сланец» держит разделы воздухом, а строки плитками, «Глина»
 * отбивает то и другое линиями. Линии — фоном: места они не занимают.
 */
describe('форма из схемы — вид у темы', () => {
  it('разделы: воздух, линия фоном и отступ от неё', () => {
    expect(schemaSectionsClass).toContain('gap-[var(--gr-schema-form-section-gap)]')
    expect(schemaSectionsClass).toContain('linear-gradient(var(--gr-schema-form-section-divider),var(--gr-schema-form-section-divider))')
    expect(schemaSectionsClass).toContain('[&>*+*]:pt-[var(--gr-schema-form-section-divider-space)]')
  })

  it('строка повторителя: рамка, скругление, поле и линия между строками', () => {
    expect(schemaRowClass).toContain('border-[var(--gr-schema-form-row-brd)]')
    expect(schemaRowClass).toContain('rounded-[var(--gr-schema-form-row-radius)]')
    expect(schemaRowClass).toContain('p-[var(--gr-schema-form-row-padding)]')
    expect(schemaArrayListClass).toContain('linear-gradient(var(--gr-schema-form-row-divider),var(--gr-schema-form-row-divider))')
  })
})
