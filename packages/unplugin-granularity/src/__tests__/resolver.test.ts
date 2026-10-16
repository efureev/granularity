import type { ComponentResolverObject } from 'unplugin-vue-components/types'
import { describe, expect, it } from 'vitest'

import { createGranularResolver, GranularityResolver } from '../resolver'

function resolveWith(resolver: ComponentResolverObject, name: string) {
  return (resolver.resolve as (name: string) => unknown)(name)
}

describe('createGranularResolver', () => {
  it('resolves by prefix to granular subpath (with styles side-effect when importStyle is on)', () => {
    const resolver = createGranularResolver({
      packageName: '@feugene/granularity',
      prefix: 'Gr',
      importStyle: true,
    })

    expect(resolveWith(resolver, 'GrButton')).toEqual({
      name: 'GrButton',
      from: '@feugene/granularity/components/GrButton',
      sideEffects: '@feugene/granularity/components/GrButton/styles.css',
    })
    // Non-matching prefix is ignored.
    expect(resolveWith(resolver, 'ElButton')).toBeUndefined()
  })

  it('omits the styles side-effect when importStyle is false (inlined CSS)', () => {
    const resolver = createGranularResolver({
      packageName: '@feugene/granularity-chrono',
      components: ['GrDatePicker'],
      importStyle: false,
    })

    expect(resolveWith(resolver, 'GrDatePicker')).toEqual({
      name: 'GrDatePicker',
      from: '@feugene/granularity-chrono/components/GrDatePicker',
    })
  })

  it('whitelist matches only listed names — avoids the greedy Gr* collision', () => {
    const resolver = createGranularResolver({
      packageName: '@feugene/granularity-chrono',
      components: ['GrDateTimePicker', 'GrDatePicker', 'GrTimePicker', 'GrDateRangePicker'],
    })

    expect(resolveWith(resolver, 'GrDateRangePicker')).toEqual({
      name: 'GrDateRangePicker',
      from: '@feugene/granularity-chrono/components/GrDateRangePicker',
    })
    // A core component (not in the whitelist) is left for the core resolver.
    expect(resolveWith(resolver, 'GrButton')).toBeUndefined()
  })

  it('honors exclude and returns nothing without prefix/components', () => {
    const excluded = createGranularResolver({
      packageName: '@feugene/granularity',
      prefix: 'Gr',
      exclude: /^GrInternal/,
    })
    expect(resolveWith(excluded, 'GrInternalThing')).toBeUndefined()
    expect(resolveWith(excluded, 'GrButton')).toBeTruthy()

    const noMatcher = createGranularResolver({ packageName: '@feugene/x' })
    expect(resolveWith(noMatcher, 'GrButton')).toBeUndefined()
  })
})

describe('GranularityResolver', () => {
  it('returns a component resolver + a directive resolver by default', () => {
    const [component, directive] = GranularityResolver() as ComponentResolverObject[]

    expect(component?.type).toBe('component')
    // Без `sideEffects`: CSS компонента приносит granum из манифеста, а
    // subpath на `styles.css` пакеты не публикуют — ссылка на него ломала бы
    // сборку потребителя.
    expect(resolveWith(component!, 'GrInput')).toEqual({
      name: 'GrInput',
      from: '@feugene/granularity/components/GrInput',
    })

    expect(directive?.type).toBe('directive')
    expect(resolveWith(directive!, 'Hotkey')).toEqual({
      name: 'vHotkey',
      from: '@feugene/granularity/directives/hotkey',
    })
    expect(resolveWith(directive!, 'Unknown')).toBeUndefined()
  })

  it('подключает CSS только по явной просьбе', () => {
    const [component] = GranularityResolver({ importStyle: true }) as ComponentResolverObject[]

    expect(resolveWith(component!, 'GrInput')).toEqual({
      name: 'GrInput',
      from: '@feugene/granularity/components/GrInput',
      sideEffects: '@feugene/granularity/components/GrInput/styles.css',
    })
  })

  it('omits the directive resolver when directives=false and drops styles when importStyle=false', () => {
    const resolvers = GranularityResolver({ directives: false, importStyle: false }) as ComponentResolverObject[]
    expect(resolvers).toHaveLength(1)
    expect(resolveWith(resolvers[0]!, 'GrCard')).toEqual({
      name: 'GrCard',
      from: '@feugene/granularity/components/GrCard',
    })
  })

  it('не резолвит имя, которого пакеты не экспортируют, — вместо пути в никуда', () => {
    const [component] = GranularityResolver() as ComponentResolverObject[]

    expect(resolveWith(component!, 'GrNope')).toBeUndefined()
    expect(resolveWith(component!, 'ElButton')).toBeUndefined()
  })

  it('один резолвер на ядро и спутники — без списков и без порядка', () => {
    const [component] = GranularityResolver({
      packages: ['@feugene/granularity-chrono', '@feugene/granularity'],
    }) as ComponentResolverObject[]

    expect(resolveWith(component!, 'GrDatePicker')).toEqual({
      name: 'GrDatePicker',
      from: '@feugene/granularity-chrono/components/GrDatePicker',
    })
    expect(resolveWith(component!, 'GrButton')).toEqual({
      name: 'GrButton',
      from: '@feugene/granularity/components/GrButton',
    })
  })

  it('exclude и prefix отсекают имя до индекса', () => {
    const [excluded] = GranularityResolver({ exclude: /^GrCard$/ }) as ComponentResolverObject[]
    expect(resolveWith(excluded!, 'GrCard')).toBeUndefined()
    expect(resolveWith(excluded!, 'GrButton')).toBeTruthy()

    const [prefixed] = GranularityResolver({ prefix: 'Xh' }) as ComponentResolverObject[]
    expect(resolveWith(prefixed!, 'GrButton')).toBeUndefined()
  })
})

describe('части составных компонентов', () => {
  const resolver = GranularityResolver()[0] as ComponentResolverObject

  /**
   * Своя запись в `exports` у части есть, но ведёт она в модуль родителя.
   * Резолвер импортирует часть из подпути родителя: селекция granum знает
   * компонент по нему, и guard проверяет импорт по нему же.
   */
  it('резолвятся из подпути родителя', () => {
    expect(resolveWith(resolver, 'GrTimelineItem')).toEqual({
      name: 'GrTimelineItem',
      from: '@feugene/granularity/components/GrTimeline',
    })

    expect(resolveWith(resolver, 'GrListItem')).toEqual({
      name: 'GrListItem',
      from: '@feugene/granularity/components/GrList',
    })
  })

  /**
   * Провайдеру, который такие subpath ещё не публикует, карта по-прежнему
   * нужна: без неё путь ведёт в никуда и сборка падает у его потребителя.
   */
  it('карта уводит имя в subpath родителя — для провайдера без алиасов', () => {
    const legacy = createGranularResolver({
      packageName: '@acme/kit',
      prefix: 'Gr',
      subcomponents: { GrTimelineItem: 'GrTimeline' },
      importStyle: true,
    })

    expect(resolveWith(legacy, 'GrTimelineItem')).toEqual({
      name: 'GrTimelineItem',
      from: '@acme/kit/components/GrTimeline',
      // CSS тоже родительский: своей директории в `dist` у части нет.
      sideEffects: '@acme/kit/components/GrTimeline/styles.css',
    })
  })

  it('обычные компоненты картой не задеты', () => {
    const legacy = createGranularResolver({
      packageName: '@acme/kit',
      prefix: 'Gr',
      subcomponents: { GrTimelineItem: 'GrTimeline' },
    })

    expect(resolveWith(legacy, 'GrTimeline')).toMatchObject({
      from: '@acme/kit/components/GrTimeline',
    })
  })
})
