import { afterEach, describe, expect, it } from 'vitest'

import { resolveComposable, tokenFormsIn } from '../gates/dynamicTokens'

import { createFixturePackage } from './fixture'

/**
 * Доллар отдельной константой: литерал `${…}` внутри обычной строки ловит
 * `no-template-curly-in-string`, а фикстурам нужен именно он — гейт читает
 * шаблонные строки чужого кода.
 */
const D = '$'

/** Ветка `calc(var(--token) + N)` в том виде, в каком её пишет композабл. */
const calcBranch = (token: string): string => `return \`calc(var(--${token}) + ${D}{modals})\`\n`

const cleanups: Array<() => void> = []

function fixture(files: Record<string, string>): string {
  const { dir, cleanup } = createFixturePackage(files)
  cleanups.push(cleanup)

  return dir
}

afterEach(() => {
  while (cleanups.length > 0)
    cleanups.pop()?.()
})

describe('tokenFormsIn', () => {
  it('ветка calc() даёт безусловное имя', () => {
    expect(tokenFormsIn(calcBranch('gr-z-modal'))).toEqual({ always: ['gr-z-modal'], defaults: [] })
  })

  it('`??`-дефолт даёт дефолтное имя во всех трёх кавычках', () => {
    // Одинарные — исходники, двойные — `dist`, откуда читает гейт спутника.
    const source = 'a ?? \'--gr-z-dropdown\'\nb ?? "--gr-z-modal"\nc ?? `--gr-z-toast`\n'

    expect(tokenFormsIn(source).defaults).toEqual(['gr-z-dropdown', 'gr-z-modal', 'gr-z-toast'])
  })

  it('дефолтный параметр `??`-дефолтом не считается', () => {
    // `modalLayerZIndex(depth, zIndexVar = '--gr-z-modal')` в продакшн-пути не
    // вызывается без второго аргумента: имя приходит от `useModalOverlay`.
    expect(tokenFormsIn('function f(depth, zIndexVar = \'--gr-z-modal\') {}\n').defaults).toEqual([])
  })

  it('имя, склеиваемое из переменной, именем не считается', () => {
    expect(tokenFormsIn(`return \`var(${D}{zIndexVar})\`\n`)).toEqual({ always: [], defaults: [] })
  })

  it('комментарии не читаются', () => {
    // Докблок переживает правку кода и оставил бы гейту имя, которого в коде
    // уже нет, — гейт продолжал бы требовать старое и оставался зелёным.
    const source = [
      ' * статический `calc(var(--gr-z-old) + N)` оставлял панель под окном',
      '// раньше было `?? \'--gr-z-legacy\'`',
      calcBranch('gr-z-modal'),
    ].join('\n')

    expect(tokenFormsIn(source)).toEqual({ always: ['gr-z-modal'], defaults: [] })
  })
})

describe('resolveComposable', () => {
  it('выводит имена из перечисленных модулей, а не из имени композабла', () => {
    // Ветка `calc()` у `useFloating` лежит в `overlayStack`, а его собственный
    // дефолт — в нём самом: один файл не покрывает композабл целиком.
    const dir = fixture({
      'useFloating.ts': 'zIndex: floatingLayerZIndex(options.zIndexVar ?? \'--gr-z-dropdown\')\n',
      'internal/overlayStack.ts': calcBranch('gr-z-modal'),
    })

    const resolved = resolveComposable({ name: 'useFloating', modules: ['useFloating', 'overlayStack'] }, [dir])

    expect(resolved.problem).toBeUndefined()
    expect(resolved.always).toEqual(['gr-z-modal'])
    expect(resolved.defaultToken).toBe('gr-z-dropdown')
  })

  it('находит модуль в чанке с хешем — так композабл виден спутнику', () => {
    const dir = fixture({ 'chunks/overlayStack-DH4Z7am1.js': calcBranch('gr-z-modal') })

    expect(resolveComposable({ name: 'useFloating', modules: ['overlayStack'] }, [dir]).always)
      .toEqual(['gr-z-modal'])
  })

  it('корни перебираются по порядку: свой `src` опережает `dist` ядра', () => {
    const own = fixture({ 'overlayStack.ts': calcBranch('gr-z-own') })
    const core = fixture({ 'chunks/overlayStack-DH4Z7am1.js': calcBranch('gr-z-core') })

    expect(resolveComposable({ name: 'x', modules: ['overlayStack'] }, [own, core]).always)
      .toEqual(['gr-z-own'])
  })

  it('модуль не найден — это проблема, а не пустой результат', () => {
    // Гейт, который не может посмотреть, обязан падать: зелёный означал бы
    // только то, что он ослеп.
    const resolved = resolveComposable({ name: 'useFloating', modules: ['overlayStack'] }, [fixture({})])

    expect(resolved.problem).toContain('модули не найдены: overlayStack')
    expect(resolved.always).toEqual([])
  })

  it('из найденного не выведено ни одного имени — тоже проблема', () => {
    // Форма чтения, которой гейт не знает: вызывающие остались бы без проверки
    // при зелёном прогоне.
    const dir = fixture({ 'overlayStack.ts': `return \`var(${D}{zIndexVar})\`\n` })

    expect(resolveComposable({ name: 'x', modules: ['overlayStack'] }, [dir]).problem)
      .toContain('не выведено ни одного имени')
  })

  it('несколько дефолтов — проблема, пока выбор не задан явно', () => {
    const dir = fixture({ 'x.ts': 'a ?? \'--gr-z-modal\'\nb ?? \'--gr-z-toast\'\n' })
    const composable = { name: 'x', modules: ['x'] }

    expect(resolveComposable(composable, [dir]).problem).toContain('дефолтов выведено несколько')
    expect(resolveComposable({ ...composable, defaultToken: 'gr-z-modal' }, [dir]).defaultToken)
      .toBe('gr-z-modal')
  })

  it('`always` в опциях дополняет выведенное, а не заменяет его', () => {
    const dir = fixture({ 'x.ts': calcBranch('gr-z-modal') })

    expect(resolveComposable({ name: 'x', modules: ['x'], always: ['gr-z-extra'] }, [dir]).always)
      .toEqual(['gr-z-modal', 'gr-z-extra'])
  })

  it('тесты модуля источником не считаются', () => {
    // Иначе гейт вычитал бы имя из ожиданий теста и краснел бы ровно тогда,
    // когда тест ещё не поправлен, — то есть никогда.
    const dir = fixture({
      '__tests__/overlayStack.ts': calcBranch('gr-z-fromtest'),
      'overlayStack.test.ts': calcBranch('gr-z-fromtest'),
      'overlayStack.ts': calcBranch('gr-z-modal'),
    })

    expect(resolveComposable({ name: 'x', modules: ['overlayStack'] }, [dir]).always).toEqual(['gr-z-modal'])
  })
})
