import type { App } from 'vue'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { installGranularityDevtools } from '../install'

vi.mock('@vue/devtools-api', () => ({ setupDevtoolsPlugin: vi.fn() }))

const setup = vi.mocked(setupDevtoolsPlugin)

function fakeApp(): App {
  return { config: { globalProperties: {} } } as unknown as App
}

function install(): void {
  installGranularityDevtools().install?.(fakeApp())
}

afterEach(() => {
  setup.mockClear()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('installGranularityDevtools', () => {
  it('returns a Vue plugin', () => {
    expect(typeof installGranularityDevtools().install).toBe('function')
  })

  it('registers the plugin in development', () => {
    vi.stubGlobal('window', {})
    vi.stubEnv('NODE_ENV', 'development')

    install()

    expect(setup).toHaveBeenCalledTimes(1)
    expect(setup.mock.calls[0]?.[0]).toMatchObject({
      id: 'org.feugene.granularity',
      label: 'Granularity',
      // Слои и объявления случаются раньше, чем пользователь откроет вкладку:
      // без раннего прокси панель стартовала бы с пустой картины.
      enableEarlyProxy: true,
    })
  })

  it('stays out of the way on the server', () => {
    install()

    expect(setup).not.toHaveBeenCalled()
  })

  // В dev-сервере Vite `process` в браузере не определён: гард «включаться,
  // только если точно dev» отключил бы панель ровно там, где она нужна.
  it('registers without a bundler-defined process', () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('process', undefined)

    install()

    expect(setup).toHaveBeenCalledTimes(1)
  })

  it('stays out of the way in production', () => {
    vi.stubGlobal('window', {})
    vi.stubEnv('NODE_ENV', 'production')

    install()

    expect(setup).not.toHaveBeenCalled()
  })
})
