import { describe, expect, it } from 'vitest'

import ProblemPage from '../ProblemPage.vue'
import { render } from '../entry-server'

/**
 * SSR-стенд: проверяет утверждения `packages/granularity/docs/ssr.md` не
 * аудитом исходников, а реальным `renderToString`.
 *
 * До появления этого приложения классификация компонентов в документе держалась
 * на чтении кода — здесь она становится исполняемой.
 */
describe('серверный рендер', () => {
  it('проходит без исключений', async () => {
    await expect(render()).resolves.toBeDefined()
  })

  it('изоморфные компоненты приходят в серверном HTML целиком', async () => {
    const { html } = await render()

    // GrAlert: роль и текст на месте.
    expect(html).toContain('data-testid="isomorphic-alert"')
    expect(html).toContain('Этот блок отрисован на сервере целиком')

    // GrInput: значение модели попало в атрибут, а не появилось после гидрации.
    expect(html).toMatch(/<input[^>]*value="SSR"/)

    // GrCheckbox: роль виджета и состояние.
    expect(html).toContain('role="checkbox"')
    expect(html).toContain('aria-checked="true"')

    // GrTable: строки отрисованы сервером — это важно для SEO и первого экрана.
    expect(html).toContain('GrCard')
    expect(html).toContain('телепорт без гарда')

    // GrBadge.
    expect(html).toContain('server')
  })

  /**
   * Важная поправка к первому впечатлению: `:disabled` у телепорта означает не
   * «не рендерить», а «рендерить НА МЕСТЕ». Поэтому у оверлеев с гардом
   * содержимое остаётся в HTML компонента, а в `teleports` не попадает ничего.
   * Пусто на сервере они дают по другой причине — потому что закрыты.
   */
  it('оверлеи с гардом рендерятся на месте, а не в teleports', async () => {
    const { html, teleports } = await render(ProblemPage)
    const teleported = Object.values(teleports).join('')

    // GrTooltip: панель-элемент присутствует в HTML компонента (скрытая,
    // без текста) и НЕ уходит в телепорты.
    expect(html).toMatch(/data-gr-tooltip-panel/)
    expect(teleported).not.toMatch(/data-gr-tooltip-panel/)
  })

  /**
   * `GrSelect` по умолчанию — нативный `<select>`, а не кастомная панель.
   * Значит в дефолтной конфигурации он полностью изоморфен: опции приходят с
   * сервера, телепорта нет вовсе.
   */
  it('GrSelect по умолчанию отдаёт нативный select с опциями', async () => {
    const { html } = await render()

    expect(html).toMatch(/data-gr-select-native/)
    expect(html).toMatch(/<option value="nuxt"/)
  })

  it('модалка закрыта — не даёт ничего ни в HTML, ни в teleports', async () => {
    const { html, teleports } = await render()

    expect(html).not.toContain('Модалка закрыта на сервере')
    expect(Object.values(teleports).join('')).not.toContain('Модалка закрыта на сервере')
  })

  /**
   * Ключевая проверка. `GrSelect`/`GrDropdown` держат панель на `v-show`, а
   * телепорт не отключают, поэтому на сервере он выполняется: содержимое уходит
   * в `ssrContext.teleports`, а не в HTML компонента.
   *
   * Тест фиксирует ФАКТ, а не желаемое: если контракт когда-нибудь приведут к
   * общему виду (см. ANALYSIS §60), тест упадёт и его нужно будет обновить
   * вместе с `docs/ssr.md`.
   */
  it('floating-панели уходят в ssrContext.teleports, а не в HTML компонента', async () => {
    const { html, teleports } = await render(ProblemPage)

    expect(Object.keys(teleports).length, 'ожидались телепорты от GrSelect/GrDropdown')
      .toBeGreaterThan(0)

    const teleported = Object.values(teleports).join('')

    // Панель селекта (`optionsView="panel"`) и меню дропдауна — в «ведре»,
    // а не в HTML компонента.
    expect(teleported).toMatch(/data-gr-select-panel/)
    expect(teleported).toMatch(/data-gr-dropdown-panel/)
    expect(html).not.toMatch(/data-gr-select-panel/)
    expect(html).not.toMatch(/data-gr-dropdown-panel/)

    // Триггеры при этом на месте — первый экран не «прыгает».
    expect(html).toContain('Меню')
    expect(html).toMatch(/aria-haspopup/)
  })

  it('панель селекта приходит скрытой, а не видимой', async () => {
    const { teleports } = await render(ProblemPage)
    const teleported = Object.values(teleports).join('')

    // `v-show="false"` рендерится инлайновым `display:none`. Если бы этого не
    // было, до гидрации пользователь увидел бы раскрытый список.
    expect(teleported).toMatch(/display\s*:\s*none/)
  })
})
