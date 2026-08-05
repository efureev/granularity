import { describe, expect, it } from 'vitest'

import {
  collectRequiredDependencies,
  isComponentDir,
  parseDependencyUsages,
  publicComponents,
  readDeclaredDependencies,
} from './componentGraph'

/**
 * Зависимости, объявленные сверх выведенных из исходников: компонент чужую
 * разметку не рендерит, но осмысленно не бывает без соседа.
 *
 * Каждая запись — решение, а не недосмотр; список закрытый, чтобы протухшее
 * объявление (сосед перестал использоваться) не пряталось за «ну и пусть».
 */
const INTENTIONAL_EXTRA: Readonly<Record<string, readonly string[]>> = {
  // `GrForm` рендерит только слот, но форма без полей не бывает: объявление
  // избавляет потребителя от ручного добавления `GrFormField` в селекцию.
  GrForm: ['GrFormField'],
}

/**
 * Гейт на рассинхрон `config.dependencies` с тем, что компонент реально
 * импортирует.
 *
 * Пропущенная зависимость не ломает ни сборку, ни типы: `dist` собирается,
 * компонент импортируется. Но при гранулярной селекции пресет сканирует
 * только `dist/components/<Выбранный>/` и подмешивает safelist только
 * выбранных — чужие классы в CSS не попадают, и вложенный компонент выходит
 * бесцветным уже у потребителя. Ловится это иначе только глазами и только
 * если кто-то соберёт приложение ровно с этой селекцией.
 */
describe('граф зависимостей компонентов', () => {
  it.each(publicComponents)('%s объявляет всё, что импортирует', (component) => {
    const required = collectRequiredDependencies(component)
    const declared = readDeclaredDependencies(component)

    const missing = required.filter(usage => !declared.includes(usage.dependency))
    const explain = missing
      .map(usage => `${usage.dependency} (${usage.kind} · ${usage.source})`)
      .join(', ')

    expect(missing.map(usage => usage.dependency), explain).toEqual([])
  })

  it.each(publicComponents)('%s не объявляет лишнего', (component) => {
    const required = collectRequiredDependencies(component).map(usage => usage.dependency)
    const allowed = new Set([...required, ...(INTENTIONAL_EXTRA[component] ?? [])])

    // Транзитивное пресет соберёт сам — объявлять его повторно значит
    // держать в конфиге факт, который никто не проверяет.
    const extra = readDeclaredDependencies(component).filter(name => !allowed.has(name))

    expect(extra).toEqual([])
  })

  /**
   * Критерий ребра нормативен (SPEC §4.1 пресета), поэтому проверяется прямо,
   * а не через компонент, который его случайно покрывает.
   */
  describe('критерий ребра', () => {
    it.each([
      ['дефолтный импорт бочки', 'import GrButton from \'../GrButton\'', 'component'],
      ['импорт SFC напрямую', 'import GrButton from \'../GrButton/GrButton.vue\'', 'component'],
      ['ленивый импорт бочки', 'const C = defineAsyncComponent(() => import(\'../GrButton\'))', 'component'],
      ['ленивый импорт SFC', 'const C = () => import(\'../GrButton/GrButton.vue\')', 'component'],
      ['чужой safelist', 'import { grButtonSafelist } from \'../GrButton/safelist\'', 'styles'],
      ['чужая мапа классов', 'import { buttonSizeMap } from \'../GrButton/grButtonStyles\'', 'styles'],
    ])('%s — ребро (%#)', (_, code, kind) => {
      expect(parseDependencyUsages(code)).toEqual([{ dependency: 'GrButton', kind }])
    })

    it.each([
      ['тип', 'import type GrButton from \'../GrButton\''],
      ['именованный тип', 'import type { GrButtonProps } from \'../GrButton\''],
      ['контекст соседа', 'import { GR_RADIO_GROUP_CONTEXT } from \'../GrRadio\''],
      ['композабл соседа', 'import { useGrComponentSize } from \'../GrConfigProvider/context\''],
      ['ленивый импорт не-компонента', 'await import(\'../GrButton/context\')'],
      ['закомментированный импорт', '// import GrButton from \'../GrButton\''],
      ['импорт в блочном комментарии', '/* import GrButton from \'../GrButton\' */'],
    ])('%s — не ребро', (_, code) => {
      expect(parseDependencyUsages(code)).toEqual([])
    })
  })

  it('объявленные зависимости ссылаются на существующие компоненты', () => {
    for (const component of publicComponents) {
      for (const dependency of readDeclaredDependencies(component)) {
        // Короткая форма разрешается в своём провайдере; квалифицированную
        // (`providerId:Name`) библиотека не использует.
        expect(dependency, `${component} → ${dependency}`).not.toContain(':')
        expect(isComponentDir(dependency), `${component} → ${dependency}`).toBe(true)
      }
    }
  })
})
