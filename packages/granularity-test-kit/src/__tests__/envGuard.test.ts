import { describe, expect, it } from 'vitest'

import { handWrittenChecks, unguardedWarnings } from '../gates/envGuard'

const guard = '__GR_DEV__'

describe('handWrittenChecks', () => {
  it('находит голое `process.env.NODE_ENV` и `import.meta.env`', () => {
    const files = [
      { path: 'a.ts', code: 'const dev = process.env.NODE_ENV !== \'production\'\n' },
      { path: 'b.ts', code: 'const dev = import.meta.env?.DEV\n' },
    ]

    expect(handWrittenChecks(files)).toEqual(['a.ts:1', 'b.ts:1'])
  })

  it('сам гард нарушением не считает', () => {
    expect(handWrittenChecks([{ path: 'a.ts', code: 'if (__GR_DEV__) console.warn(1)\n' }])).toEqual([])
  })
})

describe('unguardedWarnings', () => {
  it('предупреждение без гарда — нарушение', () => {
    const files = [{ path: 'a.ts', code: 'function f() {\n  console.warn(1)\n}\n' }]

    expect(unguardedWarnings(files, { guard })).toEqual(['a.ts:2'])
  })

  it('инлайн-гард на той же строке засчитывается', () => {
    const files = [{ path: 'a.ts', code: 'if (x && __GR_DEV__) console.warn(1)\n' }]

    expect(unguardedWarnings(files, { guard })).toEqual([])
  })

  it('блочный гард закрывает несколько предупреждений подряд', () => {
    // Требовать гард на каждой строке значило бы ломать рабочий код: у одного
    // блока в ядре четыре предупреждения.
    const code = 'if (__GR_DEV__) {\n  console.warn(1)\n  console.warn(2)\n  console.error(3)\n}\n'

    expect(unguardedWarnings([{ path: 'a.ts', code }], { guard })).toEqual([])
  })

  it('забытый гард у соседнего предупреждения ловится', () => {
    // Слабая, файловая версия правила («гард есть где-то в файле») этот случай
    // пропускала — проверка мутацией показала это на первом же прогоне.
    const code = 'console.warn(1)\nif (__GR_DEV__) console.warn(2)\n'

    expect(unguardedWarnings([{ path: 'a.ts', code }], { guard })).toEqual(['a.ts:1'])
  })

  it('файл из `allowUnguarded` пропускается', () => {
    // Случай `GrConfigProvider/context.ts`: предупреждение в модульной функции,
    // гард — на стороне единственного вызова, то есть ниже по файлу.
    const files = [{ path: 'context.ts', code: 'function warn() {\n  console.warn(1)\n}\nif (__GR_DEV__) warn()\n' }]

    expect(unguardedWarnings(files, { guard })).toEqual(['context.ts:2'])
    expect(unguardedWarnings(files, { guard, allowed: { 'context.ts': 'гард у вызова' } })).toEqual([])
  })
})
