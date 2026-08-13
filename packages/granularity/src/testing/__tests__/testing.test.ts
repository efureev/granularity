import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAnnouncer } from '../../composables/useAnnouncer'
import { ensurePortalRoot, getPortalRoot } from '../../composables/internal/portalRoot'
import { useGrComponentProp, useGrComponentSize } from '../../components/GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  announced,
  cancelPointer,
  drag,
  granularityGlobal,
  i18nAdapter,
  mockRect,
  move,
  press,
  release,
  resetGranularityDom,
  stackRects,
  stubMatchMedia,
} from '../index'

afterEach(() => {
  resetGranularityDom()
})

describe('указательные жесты', () => {
  it('нажатие идёт в элемент, движение и отпускание — в `window`', () => {
    const el = document.createElement('div')
    document.body.append(el)

    const onElement = vi.fn()
    const onWindow = vi.fn()

    el.addEventListener('pointerdown', onElement)
    window.addEventListener('pointermove', onWindow)
    window.addEventListener('pointerup', onWindow)

    press(el, { clientX: 10 })
    move({ clientX: 40 })
    release({ clientX: 40 })

    expect(onElement).toHaveBeenCalledTimes(1)
    expect(onWindow).toHaveBeenCalledTimes(2)

    window.removeEventListener('pointermove', onWindow)
    window.removeEventListener('pointerup', onWindow)
  })

  it('нажатие по умолчанию основной кнопкой — иначе жест не начнётся', () => {
    const el = document.createElement('div')
    const seen: number[] = []

    el.addEventListener('pointerdown', event => seen.push((event as MouseEvent).button))

    press(el)
    press(el, { button: 2 })

    expect(seen).toEqual([0, 2])
  })

  it('`cancelPointer` шлёт обрыв, а не отпускание', () => {
    const onCancel = vi.fn()
    const onUp = vi.fn()

    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('pointerup', onUp)

    cancelPointer()

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onUp).not.toHaveBeenCalled()

    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('pointerup', onUp)
  })

  it('`drag` проводит жест целиком', () => {
    const el = document.createElement('div')
    const seen: string[] = []

    el.addEventListener('pointerdown', () => seen.push('down'))
    const listener = (event: Event) => seen.push(event.type === 'pointermove' ? 'move' : 'up')
    window.addEventListener('pointermove', listener)
    window.addEventListener('pointerup', listener)

    drag(el, { clientY: 0 }, { clientY: 60 })

    expect(seen).toEqual(['down', 'move', 'up'])

    window.removeEventListener('pointermove', listener)
    window.removeEventListener('pointerup', listener)
  })
})

describe('геометрия', () => {
  it('недостающие стороны выводятся из заданных', () => {
    const el = document.createElement('div')

    mockRect(el, { left: 20, width: 100, top: 5, height: 40 })
    const rect = el.getBoundingClientRect()

    expect([rect.right, rect.bottom, rect.x, rect.y]).toEqual([120, 45, 20, 5])
  })

  it('повторный вызов переопределяет прямоугольник', () => {
    const el = document.createElement('div')

    mockRect(el, { width: 10 })
    mockRect(el, { width: 200 })

    expect(el.getBoundingClientRect().width).toBe(200)
  })

  it('`stackRects` кладёт элементы встык по своей оси', () => {
    const rows = [document.createElement('div'), document.createElement('div'), document.createElement('div')]

    stackRects(rows, { size: 20 })
    expect(rows.map(el => el.getBoundingClientRect().top)).toEqual([0, 20, 40])

    stackRects(rows, { size: 50, axis: 'horizontal', start: 100 })
    expect(rows.map(el => el.getBoundingClientRect().left)).toEqual([100, 150, 200])
  })
})

describe('уборка окружения', () => {
  it('снимает корень портала вместе с `body` — иначе следующий монтаж уедет из документа', () => {
    const first = ensurePortalRoot()
    expect(document.body.contains(first)).toBe(true)

    resetGranularityDom()

    expect(getPortalRoot()).toBeNull()
    expect(document.body.contains(ensurePortalRoot())).toBe(true)
  })

  it('гасит живой регион', async () => {
    useAnnouncer().announce('Строка перенесена')
    expect(await announced()).toBe('Строка перенесена')

    resetGranularityDom()

    expect(document.querySelector('[data-gr-announcer-region="polite"]')).toBeNull()
  })
})

describe('заглушка `matchMedia`', () => {
  it('`matchMedia` отвечает на запрос про движение и откатывается', () => {
    const restore = stubMatchMedia({ reducedMotion: true })

    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    expect(window.matchMedia('(min-width: 600px)').matches).toBe(false)

    restore()
  })
})

describe('окружение пакета для монтирования', () => {
  const Probe = defineComponent({
    props: { size: { type: String, default: undefined }, tone: { type: String, default: undefined } },
    setup(props) {
      const resolvedSize = useGrComponentSize(() => props.size as never, { component: 'GrButton' })
      const resolvedTone = useGrComponentProp('GrButton', 'tone' as never, () => props.tone as never, 'neutral' as never)
      const { t } = useGranularityTranslations()

      return () => h('div', {
        'data-size': resolvedSize.value,
        'data-tone': String(resolvedTone.value),
        'data-text': t('gr.select.loading', 'Loading…'),
      })
    },
  })

  it('доносит размер и дефолты компонентов без монтирования провайдера', () => {
    const wrapper = mount(Probe, {
      global: granularityGlobal({ size: 'sm', componentDefaults: { GrButton: { tone: 'success' } } as never }),
    })

    expect(wrapper.get('div').attributes('data-size')).toBe('sm')
    expect(wrapper.get('div').attributes('data-tone')).toBe('success')
  })

  it('локальный проп сильнее конфига', () => {
    const wrapper = mount(Probe, {
      props: { size: 'lg' },
      global: granularityGlobal({ size: 'sm' }),
    })

    expect(wrapper.get('div').attributes('data-size')).toBe('lg')
  })

  it('адаптер перевода принимается словарём', () => {
    const wrapper = mount(Probe, {
      global: granularityGlobal({ i18n: { 'gr.select.loading': 'Гружу…' } }),
    })

    expect(wrapper.get('div').attributes('data-text')).toBe('Гружу…')
  })

  it('`i18nAdapter` без словаря отдаёт сам ключ — видно, о чём спросили', () => {
    expect(i18nAdapter().t('gr.select.loading')).toBe('gr.select.loading')
    expect(i18nAdapter({ locale: 'de-DE' }).locale?.value).toBe('de-DE')
  })
})

describe('публикация точки входа', () => {
  it('подпуть `./testing` объявлен и в `exports`, и в vite-entry', () => {
    const packageDir = process.cwd()
    const packageJson = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>
    }

    expect(packageJson.exports['./testing']).toBeDefined()
    expect(readFileSync(resolve(packageDir, 'vite.config.ts'), 'utf8')).toContain('./src/testing/index.ts')
  })

  it('не реэкспортируется из root-barrel: тестовый код не место в бандле приложения', () => {
    expect(readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8')).not.toContain('./testing')
  })
})
