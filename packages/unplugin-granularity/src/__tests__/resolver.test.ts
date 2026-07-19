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
      packageName: '@feugene/granularity-datepicker',
      components: ['GrDatePicker'],
      importStyle: false,
    })

    expect(resolveWith(resolver, 'GrDatePicker')).toEqual({
      name: 'GrDatePicker',
      from: '@feugene/granularity-datepicker/components/GrDatePicker',
    })
  })

  it('whitelist matches only listed names — avoids the greedy Gr* collision', () => {
    const resolver = createGranularResolver({
      packageName: '@feugene/granularity-datepicker',
      components: ['GrDateTimePicker', 'GrDatePicker', 'GrTimePicker', 'GrDateRangePicker'],
    })

    expect(resolveWith(resolver, 'GrDateRangePicker')).toEqual({
      name: 'GrDateRangePicker',
      from: '@feugene/granularity-datepicker/components/GrDateRangePicker',
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

describe('GranularityResolver (core preset)', () => {
  it('returns a component resolver + a directive resolver by default', () => {
    const [component, directive] = GranularityResolver() as ComponentResolverObject[]

    expect(component.type).toBe('component')
    expect(resolveWith(component, 'GrInput')).toEqual({
      name: 'GrInput',
      from: '@feugene/granularity/components/GrInput',
      sideEffects: '@feugene/granularity/components/GrInput/styles.css',
    })

    expect(directive?.type).toBe('directive')
    expect(resolveWith(directive!, 'Hotkey')).toEqual({
      name: 'vHotkey',
      from: '@feugene/granularity/directives/hotkey',
    })
    expect(resolveWith(directive!, 'Unknown')).toBeUndefined()
  })

  it('omits the directive resolver when directives=false and drops styles when importStyle=false', () => {
    const resolvers = GranularityResolver({ directives: false, importStyle: false }) as ComponentResolverObject[]
    expect(resolvers).toHaveLength(1)
    expect(resolveWith(resolvers[0]!, 'GrCard')).toEqual({
      name: 'GrCard',
      from: '@feugene/granularity/components/GrCard',
    })
  })
})
