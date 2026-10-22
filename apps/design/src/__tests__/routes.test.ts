import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { buildRoutes, type DesignPages, themeOnlyChange } from '../app/routes'

const page = () => Promise.resolve({ render: () => null })
const pages: DesignPages = { overview: page, foundation: page, themes: page, theme: page, component: page, notFound: page }

function setup(current = 'slate'): { router: Router, setCurrent: (id: string) => void } {
  let theme = current
  const router = createRouter({ history: createMemoryHistory(), routes: buildRoutes(['clay', 'slate'], () => theme, pages) })
  return {
    router,
    setCurrent: (id) => {
      theme = id
    },
  }
}

async function land(router: Router, path: string): Promise<string> {
  await router.push(path)
  return router.currentRoute.value.fullPath
}

describe('маршруты: тема — первый сегмент пути', () => {
  it('тема и параметры страницы берутся из адреса', () => {
    const { router } = setup()
    const route = router.resolve('/clay/foundations/color')

    expect(route.name).toBe('foundation')
    expect(route.params).toEqual({ theme: 'clay', foundation: 'color' })
    expect(router.resolve('/slate/themes/clay').params).toEqual({ theme: 'slate', slug: 'clay' })
    expect(router.resolve('/clay/components/button').params).toEqual({ theme: 'clay', component: 'button' })
  })

  it('префикс — только темы сборки: чужое слово — «не найдено»', () => {
    const { router } = setup()

    expect(router.resolve('/ink/foundations/color').name).toBe('not-found')
    expect(router.resolve('/ink').name).toBe('not-found')
  })

  it('корень ведёт в текущую тему документа', async () => {
    const { router, setCurrent } = setup('slate')

    expect(await land(router, '/')).toBe('/slate')
    setCurrent('clay')
    await router.push('/slate/themes')
    expect(await land(router, '/')).toBe('/clay')
  })

  it('адреса без темы живы: ведут туда же под текущей темой, с запросом', async () => {
    const { router } = setup('clay')

    expect(await land(router, '/foundations/color')).toBe('/clay/foundations/color')
    expect(await land(router, '/themes')).toBe('/clay/themes')
    expect(await land(router, '/themes/slate')).toBe('/clay/themes/slate')
    expect(await land(router, '/components/button?tab=tokens')).toBe('/clay/components/button?tab=tokens')
  })

  it('id темы после компонента ведёт в эту тему, чужое слово — в тему адреса', async () => {
    const { router } = setup()

    expect(await land(router, '/slate/components/button/clay?tab=tokens')).toBe('/clay/components/button?tab=tokens')
    expect(await land(router, '/clay/components/button/evolution')).toBe('/clay/components/button')
  })

  it('именованная ссылка без темы берёт её из текущего адреса; смена темы — та же страница', async () => {
    const { router } = setup()
    await router.push('/clay/themes')

    expect(router.resolve({ name: 'foundation', params: { foundation: 'color' } }).fullPath).toBe('/clay/foundations/color')
    await router.push('/clay/foundations/typography')
    expect(router.resolve({ params: { theme: 'slate' } }).fullPath).toBe('/slate/foundations/typography')
  })

  it('прокрутку сохраняет только смена одной темы', () => {
    const { router } = setup()
    const at = (path: string) => router.resolve(path)

    expect(themeOnlyChange(at('/slate/foundations/color'), at('/clay/foundations/color'))).toBe(true)
    expect(themeOnlyChange(at('/slate/foundations/color'), at('/slate/foundations/color'))).toBe(false)
    expect(themeOnlyChange(at('/slate/foundations/space'), at('/clay/foundations/color'))).toBe(false)
    expect(themeOnlyChange(at('/slate/themes'), at('/clay/foundations/color'))).toBe(false)
    expect(themeOnlyChange(at('/slate/components/button?tab=a'), at('/clay/components/button?tab=b'))).toBe(false)
  })
})
