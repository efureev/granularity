// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app'
import { componentPath } from '../catalog/fixtures'
import { resolvePage } from '../pages'

/**
 * Медиа, решившееся до гидрации.
 *
 * Серверный HTML уже содержит `<img>` и `<video>` с `src`: браузер грузит их,
 * пока скрипты ещё едут, и `load`, `error`, `loadedmetadata` приходят, когда
 * слушателей нет. Компонент обязан свериться с самим элементом после
 * гидрации — иначе плитка навсегда остаётся скелетом над готовой картинкой.
 *
 * Состояние элемента подменяется до гидрации: jsdom картинок не грузит, а
 * `complete` и `naturalWidth` — ровно то, что браузер к этому моменту знает.
 */

interface SsrSnapshot {
  html: string
  teleports: Record<string, string>
  error?: string
}

const snapshots = JSON.parse(
  readFileSync(resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json'), 'utf8'),
) as Record<string, SsrSnapshot>

async function hydrate(name: string): Promise<void> {
  const path = componentPath(name)
  const snapshot = snapshots[path]!

  expect(snapshot.error, snapshot.error).toBeUndefined()
  document.body.innerHTML = `<div id="app">${snapshot.html}</div>`
  createApp(resolvePage(path)).mount(document.querySelector('#app')!)
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('GrFilePreview: картинка решилась до гидрации', () => {
  it('сервер отдаёт картинку под скелетом', () => {
    const html = snapshots[componentPath('GrFilePreview')]!.html

    expect(html).toContain('data-gr-file-preview-image')
    expect(html).toContain('data-gr-file-preview-skeleton')
  })

  it('загруженная — после гидрации видна, скелета нет', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(113)
    await hydrate('GrFilePreview')

    expect(document.querySelector('[data-gr-file-preview-skeleton]')).toBeNull()
    expect(document.querySelector('[data-gr-file-preview-image]')?.classList.contains('invisible')).toBe(false)
  })

  it('сорвавшаяся — после гидрации заглушка, а не вечный скелет', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0)
    await hydrate('GrFilePreview')

    expect(document.querySelector('[data-gr-file-preview-skeleton]')).toBeNull()
    expect(document.querySelector('[data-gr-file-preview-fallback]')).not.toBeNull()
  })
})

describe('GrFileUpload: scoped-слот зоны', () => {
  it('сервер рендерит слот с настоящими пропами', () => {
    const snapshot = snapshots[componentPath('GrFileUpload')]!

    expect(snapshot.error, snapshot.error).toBeUndefined()
    expect(snapshot.html).toContain('idle · 0')
  })

  it('и после гидрации слот тот же', async () => {
    await hydrate('GrFileUpload')

    expect(document.querySelector('[data-own-zone]')?.textContent).toBe('idle · 0')
  })
})

describe('GrVideoPlayer: метаданные прочитаны до гидрации', () => {
  it('длительность видна без события `loadedmetadata`', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(HTMLMediaElement.HAVE_METADATA)
    Object.defineProperty(HTMLMediaElement.prototype, 'duration', { configurable: true, get: () => 90 })
    try {
      await hydrate('GrVideoPlayer')

      expect(document.querySelector('[role="slider"]')?.getAttribute('aria-valuemax')).toBe('90')
    }
    finally {
      Reflect.deleteProperty(HTMLMediaElement.prototype, 'duration')
    }
  })
})
