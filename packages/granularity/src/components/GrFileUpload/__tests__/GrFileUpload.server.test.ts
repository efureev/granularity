// @vitest-environment node

import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'

import GrFileUpload from '../GrFileUpload.vue'

/**
 * Scoped-слот зоны на сервере.
 *
 * Компонент пробует дефолтный слот, чтобы понять, своя это зона или подпись в
 * стандартной. Проба шла с пустым объектом вместо пропов, и слот, читающий
 * `state.phase` или `files.length` при рендере, бросал `TypeError` — серверный
 * рендер страницы отдавал 500. Окружение — Node, а не jsdom: там нет `window`,
 * как на настоящем сервере.
 */
describe('GrFileUpload: scoped-слот на сервере', () => {
  it('слот, читающий `state` и `files`, рендерится, а не роняет страницу', async () => {
    const app = createSSRApp({
      render: () => h(GrFileUpload, null, {
        default: ({ state, files }: { state: { phase: string }, files: File[] }) =>
          h('span', { 'data-own-zone': '' }, `${state.phase} · ${files.length}`),
      }),
    })

    const html = await renderToString(app)

    expect(html).toContain('data-own-zone')
    expect(html).toContain('idle · 0')
  })
})
