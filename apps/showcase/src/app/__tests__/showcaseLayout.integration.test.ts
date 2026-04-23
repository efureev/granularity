// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import { initThemeEarly } from '@feugene/granularity'

import App from '../../App.vue'
import { setupShowcaseI18n } from '../../i18n'
import ShowcaseLayout from '../../layouts/ShowcaseLayout.vue'
import { showcaseChildRoutes } from '../routeDefinitions'

const mountedWrappers: Array<ReturnType<typeof mount>> = []

function createStorageMock() {
  const store = new Map<string, string>()

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
    get length() {
      return store.size
    },
  }
}

function createShowcaseRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: ShowcaseLayout,
        children: [...showcaseChildRoutes],
      },
    ],
  })
}

async function mountShowcaseAt(path: string) {
  const router = createShowcaseRouter()
  const i18n = await setupShowcaseI18n()

  await router.push(path)
  await router.isReady()

  const wrapper = mount(App, {
    attachTo: document.body,
    global: {
      plugins: [i18n, router],
    },
  })

  mountedWrappers.push(wrapper)

  await flushPromises()

  return {
    router,
    wrapper,
  }
}

function findButtonByText(wrapper: Awaited<ReturnType<typeof mountShowcaseAt>>['wrapper'], text: string) {
  return wrapper.findAll('button').find(button => button.text().includes(text))
}

function findButtonByAriaLabel(wrapper: Awaited<ReturnType<typeof mountShowcaseAt>>['wrapper'], label: string) {
  return wrapper.findAll('button').find(button => button.attributes('aria-label') === label)
}

describe('showcase layout integration', () => {
  afterEach(() => {
    while (mountedWrappers.length > 0) {
      mountedWrappers.pop()?.unmount()
    }

    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    const storageMock = createStorageMock()

    vi.stubGlobal('localStorage', storageMock)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storageMock,
    })

    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')

    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))

    initThemeEarly()
  })

  it('рендерит breadcrumbs и doc sections для component detail route', async () => {
    const { wrapper } = await mountShowcaseAt('/components/ds-button')

    expect(wrapper.text()).toContain('Компоненты')
    expect(wrapper.text()).toContain('DsButton')
    expect(wrapper.text()).toContain('Живые примеры')
    expect(wrapper.text()).toContain('API')
    expect(wrapper.text()).toContain('Заметки по реализации')
  })

  it('рендерит package-level api, usage и breadcrumbs для composable detail route', async () => {
    const { wrapper } = await mountShowcaseAt('/composables/use-theme')

    expect(wrapper.text()).toContain('Composables')
    expect(wrapper.text()).toContain('useTheme')
    expect(wrapper.text()).toContain('Обзор пакета')
    expect(wrapper.text()).toContain('Канонический пример использования')
    expect(wrapper.text()).toContain('API')
  })

  it('показывает fallback для отсутствующей package entity и сохраняет CTA возврата', async () => {
    const { wrapper } = await mountShowcaseAt('/utilities/missing-entity')

    expect(wrapper.text()).toContain('Сущность пакета не найдена')
    expect(wrapper.text()).toContain('Перейти в directives')
    expect(wrapper.text()).toContain('Перейти в composables')
    expect(wrapper.text()).toContain('Перейти в utilities')
  })

  it('переключает тему через docs shell action', async () => {
    const { wrapper } = await mountShowcaseAt('/')
    const themeToggleButton = findButtonByAriaLabel(wrapper, 'Переключить тему')

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(themeToggleButton).toBeTruthy()

    await themeToggleButton?.trigger('click')
    await flushPromises()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('fint-ds-theme')).toBe('dark')
  })

  it('позволяет проверить theme-sensitive package demo без записи embedded state в localStorage', async () => {
    const { wrapper } = await mountShowcaseAt('/composables/use-theme')
    const runtimeThemeToggleButton = findButtonByText(wrapper, 'Toggle theme (light)')

    expect(wrapper.text()).toContain('Demo использует `persist: false`')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('showcase-package-demo-theme')).toBeNull()
    expect(runtimeThemeToggleButton).toBeTruthy()

    await runtimeThemeToggleButton?.trigger('click')
    await flushPromises()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(wrapper.text()).toContain('Toggle theme (dark)')
    expect(wrapper.text()).toContain('dark')
    expect(window.localStorage.getItem('showcase-package-demo-theme')).toBeNull()
  })

  it('открывает mobile drawer с внутристраничной навигацией и закрывает его при смене route', async () => {
    const { router, wrapper } = await mountShowcaseAt('/components/ds-button')
    const mobileMenuButton = findButtonByAriaLabel(wrapper, 'Открыть навигацию')

    expect(wrapper.find('[aria-label="Закрыть навигацию"]').exists()).toBe(false)
    expect(mobileMenuButton).toBeTruthy()

    await mobileMenuButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Навигация')
    expect(wrapper.text()).toContain('Контекстная навигация')
    expect(wrapper.find('[aria-label="Закрыть навигацию"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Действия')
    expect(wrapper.text()).toContain('DsButtonGroup')

    await router.push('/utilities')
    await flushPromises()

    expect(wrapper.find('[aria-label="Закрыть навигацию"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Утилиты каталог')
  })

  it('открывает quick search как CSS-sized панель с внутренним скроллом результатов', async () => {
    const { wrapper } = await mountShowcaseAt('/components/ds-button')
    const searchButton = findButtonByAriaLabel(wrapper, 'Открыть поиск')

    expect(searchButton).toBeTruthy()

    await searchButton?.trigger('click')
    await flushPromises()

    const searchPanel = wrapper.findAll('.showcase-overlay').find(node => node.text().includes('Быстрый поиск'))

    expect(searchPanel).toBeTruthy()
    expect(searchPanel?.classes()).toContain('absolute')
    expect(searchPanel?.classes()).toContain('flex')
    expect(searchPanel?.classes()).toContain('flex-col')
    expect(searchPanel?.classes()).toContain('top-[calc(100%+0.75rem)]')
    expect(searchPanel?.classes()).toContain('w-[min(92vw,30rem)]')
    expect(searchPanel?.classes()).toContain('max-h-[calc(100dvh-8rem)]')
    expect(searchPanel?.attributes('style')).toBeUndefined()

    const scrollableResults = searchPanel?.find('.overflow-y-auto')

    expect(scrollableResults?.exists()).toBe(true)
    expect(scrollableResults?.classes()).toContain('min-h-0')

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()

    expect(wrapper.findAll('.showcase-overlay').some(node => node.text().includes('Быстрый поиск'))).toBe(false)
  })
})