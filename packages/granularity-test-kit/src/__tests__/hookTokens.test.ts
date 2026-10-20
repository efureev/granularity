import { afterEach, describe, expect, it } from 'vitest'

import { withRegistryHookTokens } from '../hookTokens'
import { createFixturePackage } from './fixture'

function registry(tokens: Record<string, string>): string {
  return JSON.stringify({
    tokens: Object.entries(tokens).map(([name, kind]) => ({ name, kind, default: '0', description: 'x' })),
  })
}

describe('withRegistryHookTokens', () => {
  let cleanup = (): void => {}
  afterEach(() => cleanup())

  it('хуки — свои, группы и объявленные руками; остальные природы не хуки', () => {
    const fixture = createFixturePackage({
      'src/components/GrBar/tokens.json': registry({ '--gr-bar-fill': 'hook', '--gr-bar-bg': 'theme', '--gr-bar-width': 'inline' }),
      'src/components/GrFrame/tokens.json': registry({ '--gr-frame-grid': 'hook' }),
      'src/components/GrPlain/tokens.json': registry({ '--gr-plain-bg': 'theme' }),
    })
    cleanup = fixture.cleanup
    const provider = {
      id: '@p/ui',
      components: [
        { name: 'GrBar', group: 'GrFrame', hookTokens: ['--gr-other-duration'] },
        { name: 'GrPlain', hookTokens: [] },
        { name: 'GrNoRegistry' },
      ],
    }

    const hooked = withRegistryHookTokens(provider, `${fixture.dir}/src`)

    expect(hooked.components[0]!.hookTokens).toEqual(['--gr-other-duration', '--gr-bar-fill', '--gr-frame-grid'])
    expect(hooked.components[1]).toBe(provider.components[1])
    expect(hooked.components[2]).toBe(provider.components[2])
    expect(hooked.id).toBe('@p/ui')
    expect(provider.components[0]!.hookTokens).toEqual(['--gr-other-duration'])
  })
})
