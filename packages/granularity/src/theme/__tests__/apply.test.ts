import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { applyTheme, removeTheme } from '../apply'

afterEach(() => {
  document.head.innerHTML = ''
})

describe('подключение темы в рантайме', () => {
  it('вставляет стиль и снимает его возвращённой функцией', () => {
    const remove = applyTheme('[data-theme=\'ocean\'] { --gr-bg: #041e2b; }', { name: 'ocean' })

    expect(document.head.querySelector('style[data-gr-theme="ocean"]')?.textContent).toContain('--gr-bg')

    remove()

    expect(document.head.querySelector('style[data-gr-theme="ocean"]')).toBeNull()
  })

  it('повторный вызов заменяет содержимое, а не плодит слои', () => {
    applyTheme('a{}', { name: 'ocean' })
    applyTheme('b{}', { name: 'ocean' })

    const styles = document.head.querySelectorAll('style[data-gr-theme="ocean"]')

    expect(styles).toHaveLength(1)
    expect(styles[0].textContent).toBe('b{}')
  })

  it('разные имена живут рядом и снимаются по имени', () => {
    applyTheme('a{}', { name: 'ocean' })
    applyTheme('b{}', { name: 'sand' })

    removeTheme('ocean')

    expect(document.head.querySelector('style[data-gr-theme="ocean"]')).toBeNull()
    expect(document.head.querySelector('style[data-gr-theme="sand"]')).not.toBeNull()
  })

  it('можно вставить в свой контейнер, а не в head', () => {
    const host = document.createElement('div')
    document.body.append(host)

    applyTheme('a{}', { name: 'ocean', target: host })

    expect(host.querySelector('style[data-gr-theme="ocean"]')).not.toBeNull()
    expect(document.head.querySelector('style[data-gr-theme="ocean"]')).toBeNull()

    host.remove()
  })
})

describe('публикация точек входа', () => {
  const packageDir = process.cwd()

  it('`./theme` и `./theme/apply` объявлены в exports и в vite-entry', () => {
    const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>
    }
    const viteConfig = readFileSync(resolve(packageDir, 'vite.config.ts'), 'utf8')

    expect(packageJson.exports['./theme']).toBeDefined()
    expect(packageJson.exports['./theme/apply']).toBeDefined()
    expect(viteConfig).toContain('./src/theme/index.ts')
    expect(viteConfig).toContain('./src/theme/apply.ts')
  })

  /** Рантайм-часть не должна тянуть справочник токенов — ради этого она и отдельно. */
  it('рантайм не импортирует данные токенов', () => {
    const source = readFileSync(resolve(packageDir, 'src/theme/apply.ts'), 'utf8')

    expect(source).not.toContain('tokens')
    expect(source).not.toContain('./extendTheme')
  })

  it('тема не реэкспортируется из root-barrel', () => {
    expect(readFileSync(resolve(packageDir, 'src/index.ts'), 'utf8')).not.toContain('./theme')
  })
})
