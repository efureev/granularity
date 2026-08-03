import { describe, expect, it } from 'vitest'

import RiskyPage from '../RiskyPage.vue'
import TeleportPage from '../TeleportPage.vue'
import { render } from '../entry-server'

/**
 * SSR-стенд: проверяет утверждения `packages/granularity/docs/ssr.md` не
 * аудитом исходников, а реальным `renderToString`.
 *
 * До появления этого приложения классификация компонентов в документе держалась
 * на чтении кода — здесь она становится исполняемой.
 */
/**
 * Отключённый телепорт всё равно оставляет в «ведре» якоря-комментарии — по ним
 * клиент находит целевой контейнер. Содержимого там быть не должно.
 */
function teleportedContent(teleports: Record<string, string>): string {
  return Object.values(teleports).join('').replace(/<!--[\s\S]*?-->/g, '').trim()
}

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
    const { html, teleports } = await render(TeleportPage)
    // GrTooltip: панель-элемент присутствует в HTML компонента (скрытая,
    // без текста) и НЕ уходит в телепорты.
    expect(html).toMatch(/data-gr-tooltip-panel/)
    expect(teleportedContent(teleports)).not.toMatch(/data-gr-tooltip-panel/)
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
    expect(teleportedContent(teleports)).not.toContain('Модалка закрыта на сервере')
  })

  /**
   * Контракт после починки ANALYSIS §60: телепорт включается только ПОСЛЕ
   * монтирования. Значит на сервере он выключен, а `:disabled` у телепорта
   * означает «рендерить на месте» — панели приходят внутри HTML компонента, и
   * `ssrContext.teleports` остаётся пустым.
   *
   * Если этот тест упадёт с непустыми `teleports` — значит кто-то вернул
   * телепорт, включённый на первом рендере, и гидрация снова сломана.
   */
  it('панели приходят на месте, а не в ssrContext.teleports', async () => {
    const { html, teleports } = await render(TeleportPage)

    expect(teleportedContent(teleports), 'в «ведре» только якоря, без содержимого').toBe('')

    expect(html).toMatch(/data-gr-select-panel/)
    expect(html).toMatch(/data-gr-dropdown-panel/)
    expect(html).toMatch(/data-gr-tooltip-panel/)

    // Триггеры, разумеется, тоже на месте — первый экран не «прыгает».
    expect(html).toContain('Меню')
    expect(html).toMatch(/aria-haspopup/)
  })

  it('панель селекта приходит скрытой, а не видимой', async () => {
    const { html } = await render(TeleportPage)

    // `v-show="false"` рендерится инлайновым `display:none`. Если бы этого не
    // было, до гидрации пользователь увидел бы раскрытый список.
    expect(html).toMatch(/display\s*:\s*none/)
  })
})

/**
 * Компоненты, которые ломает не телепорт, а браузерный API, `navigator` и
 * авто-id в setup. До починки первый же тест здесь падал `ReferenceError:
 * Image is not defined` — и вместе с ним весь рендер страницы.
 */
describe('серверный рендер: браузерные API и авто-id', () => {
  it('проходит без исключений при закрытом GrImageViewer', async () => {
    // `new Image()` в setup ронял рендер страницы, где просмотрщик просто
    // присутствует в шаблоне закрытым — состояние `modelValue` роли не играло.
    await expect(render(RiskyPage)).resolves.toBeDefined()
  })

  /**
   * Почему подсказки хоткея нет в серверном HTML вообще: `GrCommandPalette`
   * живёт внутри `GrModal`, а тот построен на `Dialog`/`TransitionRoot` из
   * HeadlessUI — они не рендерят содержимое на сервере даже при `show=true`.
   *
   * Это и есть причина, по которой `isAppleDevice()` в первом рендере не давал
   * наблюдаемого расхождения гидрации. Тест закрепляет именно это допущение:
   * если HeadlessUI (или `GrModal`) начнёт рендериться на сервере, подсказка
   * станет реальным риском расхождения — и тест об этом сообщит.
   */
  it('содержимое модальных оверлеев на сервер не попадает', async () => {
    const { html } = await render(RiskyPage)

    expect(html).not.toContain('⌘')
    expect(html).not.toContain('Ctrl')
    // Пункт палитры — тоже внутри модалки.
    expect(html).not.toContain('Открыть файл')
  })

  it('id строятся из useId(), а не из сквозного счётчика инстансов', async () => {
    const { html } = await render(RiskyPage)

    const ids = [...html.matchAll(/gr-collapse-header-([\w-]+)/g)].map(match => match[1])

    expect(ids.length).toBeGreaterThan(0)
    // `useId()` даёт префикс `v-`; `instance.uid` дал бы голое число, которое
    // на сервере растёт между запросами, а на клиенте стартует с нуля.
    expect(ids.every(id => id.startsWith('v-')), ids.join(', ')).toBe(true)
    expect(html).toMatch(/name="gr-segmented-v-/)
  })

  it('GrToaster на сервере требует плагин и с ним рендерится', async () => {
    // `useToast` намеренно запрещает модульный синглтон на сервере: он тёк бы
    // между запросами. Контракт держится тем, что `app.ts` ставит плагин.
    const { html } = await render(RiskyPage)

    expect(html).toContain('data-gr-toaster')
  })
})
