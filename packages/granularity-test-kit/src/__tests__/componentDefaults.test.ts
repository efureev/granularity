import { describe, expect, it } from 'vitest'

import { collectReadsFrom } from '../gates/componentDefaults'

const read = (source: string) => collectReadsFrom([{ source }])

describe('collectReadsFrom', () => {
  it('однострочный литеральный вызов', () => {
    const evidence = read('const x = useGrComponentProp(\'GrChip\', \'tone\', () => props.tone, \'neutral\')')

    expect([...evidence.byComponent.get('GrChip') ?? []]).toEqual(['tone'])
  })

  it('многострочный вызов — имя и ключ на разных строках', () => {
    // Шесть таких в репозитории; наивная однострочная регулярка красила их все.
    const evidence = read('const x = useGrComponentProp(\n  \'GrChip\',\n  \'radius\',\n  () => props.radius,\n)')

    expect([...evidence.byComponent.get('GrChip') ?? []]).toEqual(['radius'])
  })

  it('`useGrComponentSize` засчитывает ключ `size`', () => {
    // Слова `size` в вызове нет вовсе — имя компонента приходит опцией.
    const evidence = read('const s = useGrComponentSize(() => props.size, {\n  component: \'GrInput\',\n})')

    expect([...evidence.byComponent.get('GrInput') ?? []]).toEqual(['size'])
  })

  it('ручная цепочка через `useGrComponentDefaults`', () => {
    // У пропа производный дефолт, и константный `fallback` не годится.
    const source = 'const d = useGrComponentDefaults(\'GrCalendar\')\n'
      + 'const w = computed(() => props.weekStart ?? d.value.weekStart ?? first(locale.value))'
    const evidence = read(source)

    expect(evidence.byComponent.get('GrCalendar')?.has('weekStart')).toBe(true)
  })

  it('нелитеральное имя компонента засчитывает ключ всем', () => {
    // `usePickerShell` служит четырём пикерам, и связать его с ними можно только
    // разобрав тип-объединение. Огрубление даёт ложные отрицания, не ложные
    // срабатывания.
    const evidence = read('useGrComponentProp(options.component, \'clearable\', () => props().clearable, false)')

    expect([...evidence.wildcard]).toEqual(['clearable'])
    expect(evidence.byComponent.size).toBe(0)
  })

  it('нелитеральный `component` у `useGrComponentSize` засчитывает `size` всем', () => {
    const evidence = read('useGrComponentSize(() => props().size, { component: options.component })')

    expect([...evidence.wildcard]).toEqual(['size'])
  })

  it('чужой вызов не засчитывается', () => {
    expect(read('const x = useSomethingElse("GrChip", "tone")').total).toBe(0)
  })
})
