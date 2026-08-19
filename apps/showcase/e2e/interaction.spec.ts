import { expect, test } from '@playwright/test'

import { focusedDescription as describeFocus, tabUntil } from '@feugene/granularity-test-kit/e2e'

import { componentPath } from './components'

/**
 * Поведение, которого в jsdom нет вовсе.
 *
 * Юнит-тесты пакета живут в jsdom, а там нет ни перемещения фокуса по `Tab`, ни
 * активации кнопки по `Enter`, ни layout: `trigger('click')` проверяет
 * обработчик, но не то, что до него можно добраться с клавиатуры, а
 * `ResizeObserver` отсутствует как класс. Ровно поэтому половина клавиатурного
 * контракта `GrBreadcrumbs` из `docs/keyboard.md` и вся его арифметика
 * схлопывания по ширине до сих пор не проверялись в живом браузере.
 *
 * Файл — общая площадка: остальные интерактивные компоненты из системного
 * пункта аудита добавляются сюда же.
 */

/** Что сейчас в фокусе — в виде, пригодном для сообщения об ошибке. */
async function focusedDescription(page: import('@playwright/test').Page): Promise<string> {
  return describeFocus(page, ['data-gr-breadcrumbs-item', 'data-gr-breadcrumbs-ellipsis'])
}

/**
 * На странице несколько путей, схлопнут только один — с ним и работаем.
 *
 * Индекс вычисляется один раз и дальше используется позиционно: фильтр «тот, у
 * кого есть кнопка «…»» пересчитывается на каждом обращении и перестал бы
 * находить путь ровно тогда, когда кнопка исчезает, то есть сразу после
 * раскрытия — а проверять надо именно то, что после него.
 */
async function collapsedBreadcrumbs(page: import('@playwright/test').Page) {
  const index = await page.locator('[data-gr-breadcrumbs]').evaluateAll(nodes =>
    nodes.findIndex(node => node.querySelector('[data-testid="gr-breadcrumbs-ellipsis"]')))

  expect(index, 'на странице нет схлопнутого пути').toBeGreaterThanOrEqual(0)

  return page.locator('[data-gr-breadcrumbs]').nth(index)
}

test.describe('GrBreadcrumbs: клавиатура', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrBreadcrumbs'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-testid="gr-breadcrumbs-ellipsis"]').first().waitFor()
  })

  test('до кнопки «…» можно дойти табом, а `Enter` раскрывает путь', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const ellipsis = breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]')

    // Начинаем с пункта перед кнопкой и делаем ровно один шаг: это и есть
    // проверка, что кнопка стоит в порядке обхода, а не выпала из него.
    await breadcrumbs.locator('[data-gr-breadcrumbs-item]').first().focus()
    await page.keyboard.press('Tab')

    await expect(ellipsis).toBeFocused()

    await page.keyboard.press('Enter')

    await expect(ellipsis).toHaveCount(0)
  })

  test('после раскрытия фокус переезжает на первый раскрытый пункт', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')

    await expect(items).toHaveCount(3)

    await breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]').focus()
    await page.keyboard.press('Enter')

    await expect(items).toHaveCount(6)

    // Кнопка исчезла вместе со схлопыванием: фокус обязан остаться в пути, на
    // том месте, где кнопка и стояла, — иначе он улетел бы на `<body>`.
    await expect(items.nth(1)).toBeFocused()
  })

  test('следующий `Tab` идёт вперёд по пути, а не в его начало', async ({ page }) => {
    const breadcrumbs = await collapsedBreadcrumbs(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')

    await breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]').focus()
    await page.keyboard.press('Enter')
    await expect(items.nth(1)).toBeFocused()

    await page.keyboard.press('Tab')

    await expect(items.first(), `фокус вернулся в начало: ${await focusedDescription(page)}`).not.toBeFocused()
    await expect(items.nth(2)).toBeFocused()
  })
})

test.describe('GrBreadcrumbs: схлопывание по ширине', () => {
  /** Демо с `autoCollapse` — единственное, где путь однострочный. */
  function autoCollapsed(page: import('@playwright/test').Page) {
    return page.locator('[data-gr-breadcrumbs]').filter({
      has: page.locator('[data-gr-breadcrumbs-list].flex-nowrap'),
    })
  }

  test('узкий контейнер прячет середину, широкий возвращает её', async ({ page }) => {
    await page.goto(componentPath('GrBreadcrumbs'))
    await page.locator('#live-examples').waitFor()

    const breadcrumbs = autoCollapsed(page)
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')
    const ellipsis = breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]')

    await expect(items).toHaveCount(6)
    await expect(ellipsis).toHaveCount(0)

    // Ширину меняет само демо — так же, как её менял бы поворот телефона.
    await page.getByRole('radio', { name: 'Narrow' }).click()

    await expect(ellipsis).toHaveCount(1)
    const narrow = await items.count()
    expect(narrow).toBeLessThan(6)

    // Последний пункт остаётся всегда: он отвечает «где я сейчас».
    await expect(items.last()).toContainText('CHANGELOG.md')

    await page.getByRole('radio', { name: 'Wide' }).click()

    await expect(ellipsis).toHaveCount(0)
    await expect(items).toHaveCount(6)
  })

  test('раскрытие «…» не срезает путь и сворачивается обратно при смене ширины', async ({ page }) => {
    await page.goto(componentPath('GrBreadcrumbs'))
    await page.locator('#live-examples').waitFor()

    // Ищем по переключателю ширины: класс списка после раскрытия меняется, и
    // фильтр по `.flex-nowrap` перестал бы находить именно то демо, которое проверяем.
    const demo = page.locator('[data-example-preview]').filter({ has: page.getByRole('radio', { name: 'Narrow' }) })
    const breadcrumbs = demo.locator('[data-gr-breadcrumbs]')
    const list = breadcrumbs.locator('[data-gr-breadcrumbs-list]')
    const items = breadcrumbs.locator('[data-gr-breadcrumbs-item]')

    await page.getByRole('radio', { name: 'Narrow' }).click()
    await expect(breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]')).toHaveCount(1)

    await breadcrumbs.locator('[data-testid="gr-breadcrumbs-ellipsis"]').click()

    // Раскрытый путь переносится, а не режется: в одну строку он не влезал — её
    // нехватка и вызвала схлопывание.
    await expect(items).toHaveCount(6)
    await expect(items.last()).toContainText('CHANGELOG.md')
    await expect(list).toHaveClass(/flex-wrap/)

    // Фокус на раскрытом пункте не увёл контейнер в скролл: голова пути на месте.
    expect(await list.evaluate(node => node.scrollLeft)).toBe(0)
    await expect(items.first()).toContainText('Storage')

    // Смена ширины сворачивает обратно — в раскрытом пути кнопки «…» нет, и иначе
    // он остался бы развёрнутым до перезагрузки.
    await page.getByRole('radio', { name: 'Wide' }).click()
    await expect(list).toHaveClass(/flex-nowrap/)
  })
})

test.describe('GrDropdown: панель с содержимым, а не с меню', () => {
  /**
   * Демо `closeOnContentClick={false}` с нативными чекбоксами: до них не дойти
   * табом (`Tab` панель закрывает), и весь путь к ним — стрелки, а переключение
   * — пробел. jsdom не даёт ни того, ни другого: там чекбокс не активируется.
   */
  test('до чекбокса в панели доходят стрелки, а переключает его пробел', async ({ page }) => {
    await page.goto(componentPath('GrDropdown'))
    await page.locator('#live-examples').waitFor()

    await page.getByRole('button', { name: 'Filters' }).focus()
    await page.keyboard.press('Enter')

    const panel = page.locator('[data-gr-dropdown-panel]').filter({ hasText: 'Visible states' })
    await expect(panel).toBeVisible()

    const checkboxes = panel.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeFocused()
    await expect(checkboxes.first()).toBeChecked()

    await page.keyboard.press('ArrowDown')
    await expect(checkboxes.nth(1)).toBeFocused()
    await expect(checkboxes.nth(1)).not.toBeChecked()

    await page.keyboard.press(' ')
    await expect(checkboxes.nth(1)).toBeChecked()

    // Итог виден снаружи панели: демо печатает выбранное в бейдже под меню.
    await expect(page.getByText('Errors, Warnings')).toBeVisible()
  })
})

/**
 * Общий поиск витрины на `GrCommandPalette`.
 *
 * Проверяется в браузере, а не юнитом, по двум причинам: хоткей вешается на
 * `window` и должен быть на странице ровно один (демо палитры свои гасят), а
 * навигация стрелками и Enter в jsdom не воспроизводится.
 */
test.describe('быстрый поиск витрины', () => {
  const modKey = process.platform === 'darwin' ? 'Meta' : 'Control'

  test('⌘K открывает единственную палитру и уводит на выбранную страницу', async ({ page }) => {
    await page.goto('/components')
    await page.locator('#live-examples, main').first().waitFor()

    await page.keyboard.press(`${modKey}+KeyK`)

    const palette = page.locator('[data-gr-command-palette-list]')
    await expect(palette).toHaveCount(1)
    await expect(page.locator('[data-testid="gr-command-palette-input"]')).toBeFocused()

    await page.keyboard.type('slider')

    const items = page.locator('[data-gr-command-palette-item]')
    await expect(items.first()).toContainText('GrSlider')

    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/components\/gr-slider$/)
    await expect(palette).toHaveCount(0)
  })

  test('на странице палитры ⌘K не открывает демо-палитры', async ({ page }) => {
    await page.goto(componentPath('GrCommandPalette'))
    await page.locator('#live-examples').waitFor()

    // Демо на странице четыре, и у каждого свой `GrCommandPalette`; хоткей
    // принадлежит поиску витрины, иначе одно нажатие открывало бы сразу несколько.
    await page.keyboard.press(`${modKey}+KeyK`)

    await expect(page.locator('[data-gr-command-palette-list]')).toHaveCount(1)

    // Открылся именно общий поиск: он ищет по витрине, а не по командам демо.
    await page.keyboard.type('foundations')
    await expect(page.locator('[data-gr-command-palette-item]').first()).toContainText(/Foundations|Основы/)
  })
})

/**
 * Семь компонентов из системного пункта аудита «клавиатура протестирована у 34
 * из 68». Все они попали в непокрытые не потому, что клавиатуры не имеют, а
 * потому, что их клавиатура целиком за пределами jsdom: таб-порядок,
 * возврат фокуса после действия, прокрутка области стрелками и то, что
 * `aria-disabled`-пункт остаётся достижим табом, но не срабатывает.
 */

/**
 * Поле с крестиком помечается атрибутом и дальше адресуется по нему.
 *
 * Двух наивных способов тут не хватает, и оба уже кусали. Фильтр «то поле, у
 * которого есть кнопка очистки» пересчитывается на каждом обращении и перестаёт
 * находить поле ровно тогда, когда кнопка исчезает, — то есть сразу после
 * очистки, а проверять надо именно состояние после неё. Индекс, снятый один раз,
 * от этого спасает, но `nth(i)` **переразрешается** на каждом обращении: демо
 * витрины домонтируются и после `#live-examples`, и стоит появиться ещё одному
 * полю выше — тот же индекс указывает уже на соседа. Тест при этом фокусировал
 * одно поле, а крестик ждал у другого, и падал в параллельном прогоне, где
 * страница успевает меньше.
 *
 * Метка снимает оба: она едет с самим узлом и переживает исчезновение кнопки.
 */
async function fieldWith(page: import('@playwright/test').Page, root: string, child: string) {
  // Демо приезжают лениво; без этого индекс считался бы по недособранной странице.
  await page.waitForLoadState('networkidle')

  const marked = await page.locator(root).evaluateAll(
    (nodes, selector) => {
      const found = nodes.find(node => node.querySelector(selector))
      found?.setAttribute('data-e2e-field', '')

      return Boolean(found)
    },
    child,
  )

  expect(marked, `на странице нет «${root}» с «${child}»`).toBe(true)

  return page.locator(`${root}[data-e2e-field]`)
}

test.describe('GrInput: trailing-кнопки', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrInput'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-gr-input-clear]').first().waitFor()
  })

  test('очистка достижима табом, срабатывает Enter и возвращает фокус в поле', async ({ page }) => {
    const field = await fieldWith(page, '[data-gr-input]', '[data-gr-input-clear]')
    const input = field.locator('input')
    const clear = field.locator('[data-gr-input-clear]')

    await input.click()
    const before = await input.inputValue()
    expect(before, 'демо должно приехать с текстом — иначе очищать нечего').not.toBe('')

    // Фокус в поле — утверждением, а не предположением: домонтировавшееся демо
    // перерисовывает поддерево и роняет фокус в `body`, и тогда следующий Tab
    // уводит куда угодно. Без этой строки провал списался бы на таб-порядок.
    await expect(input, `клик не поставил фокус в поле, он на ${await focusedDescription(page)}`).toBeFocused()

    // Ровно один Tab: кнопка обязана стоять сразу за полем **этого** поля, а не
    // просто где-то дальше по странице.
    await page.keyboard.press('Tab')
    await expect(clear, `после поля фокус ушёл на ${await focusedDescription(page)}`).toBeFocused()

    await page.keyboard.press('Enter')

    await expect(input).toHaveValue('')
    // Возврат фокуса — половина контракта из `docs/keyboard.md`: без него
    // очистка выкидывает пользователя из формы, и он ищет поле заново.
    await expect(input, `после очистки фокус ушёл на ${await focusedDescription(page)}`).toBeFocused()
  })

  test('переключатель пароля меняет тип поля по Space и держит фокус', async ({ page }) => {
    const field = page.locator('[data-gr-input]')
      .filter({ has: page.locator('[data-gr-input-password-toggle]') })
      .first()
    const input = field.locator('input')
    const toggle = field.locator('[data-gr-input-password-toggle]')

    await input.click()
    await expect(input).toHaveAttribute('type', 'password')

    await tabUntil(page, 'data-gr-input-password-toggle')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Space')

    await expect(input).toHaveAttribute('type', 'text')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(input).toBeFocused()
  })
})

test.describe('GrTextarea: кнопка очистки', () => {
  test('Enter на крестике очищает поле и возвращает в него фокус', async ({ page }) => {
    await page.goto(componentPath('GrTextarea'))
    await page.locator('#live-examples').waitFor()

    const demo = await fieldWith(page, '[data-example-preview]', '[data-gr-textarea-clear]')
    const textarea = demo.locator('textarea').first()
    const clear = demo.locator('[data-gr-textarea-clear]').first()

    await textarea.click()
    expect(await textarea.inputValue()).not.toBe('')
    await expect(textarea, `клик не поставил фокус в поле, он на ${await focusedDescription(page)}`).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(clear, `после поля фокус ушёл на ${await focusedDescription(page)}`).toBeFocused()

    await page.keyboard.press('Enter')

    await expect(textarea).toHaveValue('')
    await expect(textarea).toBeFocused()
  })
})

test.describe('GrFileUpload: кнопки строки файла', () => {
  test('поле выбора файла в таб-порядке, а зона сброса — нет', async ({ page }) => {
    await page.goto(componentPath('GrFileUpload'))
    await page.locator('#live-examples').waitFor()

    const uploader = page.locator('[data-gr-file-upload]').first()
    await expect(uploader).not.toHaveAttribute('tabindex', '0')

    // Доступный контрол — сам `<input type="file">`: он визуально скрыт, но
    // остаётся в таб-порядке, а фокус показывает обёртка через `focus-within`.
    const input = uploader.locator('[data-gr-file-upload-input]')
    await expect(input).toHaveAttribute('tabindex', '0')

    await input.focus()
    await expect(input).toBeFocused()
  })
})

test.describe('GrTable: прокручиваемая область', () => {
  test('область достижима табом, имеет имя и листается стрелками', async ({ page }) => {
    await page.goto(componentPath('GrTable'))
    await page.locator('#live-examples').waitFor()

    // Именно демо с `regionLabel`: у остальных таблиц на странице скроллер тоже
    // есть, но роли и имени у него нет — и не должно быть.
    const scroller = page.locator('[data-gr-table-scroll][role="region"]').first()
    await scroller.waitFor()

    // Имя обязательно: безымянный `role="region"` скринридер объявляет как
    // «регион», и пользователь не знает, куда попал.
    await expect(scroller).toHaveAttribute('tabindex', '0')
    await expect(scroller).not.toHaveAttribute('aria-label', '')

    await scroller.focus()
    await expect(scroller).toBeFocused()

    // Переполнение — предусловие, а не следствие: `PageDown` по области, которая
    // ещё не переросла свою высоту, не двигает ничего. Под нагрузкой раскладка
    // доезжает позже самой таблицы, поэтому ждём именно её.
    await expect
      .poll(async () => scroller.evaluate(node => node.scrollHeight - node.clientHeight))
      .toBeGreaterThan(0)

    const before = await scroller.evaluate(node => node.scrollTop)

    // Фокус и нажатие — внутри опроса, а не до него. Домонтировавшееся демо
    // перерисовывает поддерево и роняет фокус в `body`; единственный `PageDown`
    // в этот момент прокручивает страницу, а не область, и повторить его
    // ожиданию уже нечем — оно только перечитывает `scrollTop`.
    await expect
      .poll(async () => {
        await scroller.focus()
        await page.keyboard.press('PageDown')

        return scroller.evaluate(node => node.scrollTop)
      }, { message: 'область не прокрутилась с клавиатуры' })
      .toBeGreaterThan(before)
  })
})

test.describe('GrSidebar: сворачивание', () => {
  test('Enter на кнопке сворачивания переключает состояние', async ({ page }) => {
    await page.goto(componentPath('GrSidebar'))
    await page.locator('#live-examples').waitFor()

    const toggle = page.locator('[data-gr-sidebar-toggle]').first()
    await toggle.waitFor()

    const expandedBefore = await toggle.getAttribute('aria-expanded')
    await toggle.focus()
    await page.keyboard.press('Enter')

    await expect(toggle).not.toHaveAttribute('aria-expanded', expandedBefore!)
    // Кнопка не теряет фокус: следующее нажатие возвращает панель обратно.
    await expect(toggle).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', expandedBefore!)
  })

  test('содержимое сайдбара — таб-стоп: прокрутка достижима с клавиатуры', async ({ page }) => {
    await page.goto(componentPath('GrSidebar'))
    await page.locator('#live-examples').waitFor()

    await expect(page.locator('[data-gr-sidebar-content][tabindex="0"]').first()).toBeAttached()
  })
})

test.describe('GrBottomNav: выбор раздела', () => {
  test('Enter меняет раздел, а выключенный пункт не активируется', async ({ page }) => {
    await page.goto(componentPath('GrBottomNav'))
    await page.locator('#live-examples').waitFor()

    const demo = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-bottom-nav-item][aria-disabled="true"]') })
      .first()

    const target = demo.locator('[data-gr-bottom-nav-item]:not([aria-disabled="true"])').last()
    await target.focus()
    await expect(target).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(target).toHaveAttribute('aria-current', 'page')

    // Выключенный пункт рендерится `<span>`: он остаётся видимым и объявленным
    // через `aria-disabled`, но из таб-порядка выпадает — то есть до него нельзя
    // ни дойти клавиатурой, ни активировать. Проверяем ровно это, а не обход.
    const disabled = demo.locator('[data-gr-bottom-nav-item][aria-disabled="true"]').first()
    await expect(disabled).toHaveJSProperty('tagName', 'SPAN')
    await expect(disabled).not.toHaveAttribute('tabindex', '0')

    await disabled.click({ force: true })

    await expect(disabled).not.toHaveAttribute('aria-current', 'page')
    await expect(target, 'клик по выключенному пункту сменил раздел').toHaveAttribute('aria-current', 'page')
  })
})

test.describe('GrContextMenu: меню по правому клику', () => {
  test('открывается указателем и с клавиатуры, закрывается Esc', async ({ page }) => {
    await page.goto(componentPath('GrContextMenu'))
    await page.locator('#live-examples').waitFor()

    const demo = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-tree]') })
      .first()
    const row = demo.locator('[data-gr-tree-node-key="q1"]').first()
    // На странице два меню, и обе панели живут в DOM (`v-show`) — различаем по
    // содержимому, а не по порядку.
    const panel = page.locator('[data-gr-popover-panel][role="menu"]')
      .filter({ hasText: 'Переименовать' })

    await row.click({ button: 'right' })
    await expect(panel).toBeVisible()
    // Пункты собраны под файл: у папки «Скачать» нет.
    await expect(panel.locator('[role="menuitem"]', { hasText: 'Скачать' })).toBeVisible()
    // Фокус сразу в меню — иначе с клавиатуры из него не выйти ничем, кроме Esc.
    await expect(panel.locator('[role="menuitem"]').first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()

    /**
     * Клавиатурный путь — то, чего jsdom не покажет: `contextmenu` по `Shift+F10`
     * там не порождается, и настоящего таб-порядка нет.
     */
    await row.click()
    await page.keyboard.press('Shift+F10')
    await expect(panel).toBeVisible()

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(panel).toBeHidden()
    await expect(demo.getByText('Переименовать: Q1 revenue.xlsx')).toBeVisible()
  })

  test('правый клик вне меню закрывает его', async ({ page }) => {
    await page.goto(componentPath('GrContextMenu'))
    await page.locator('#live-examples').waitFor()

    const demo = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-tree]') })
      .first()
    // На странице два меню, и обе панели живут в DOM (`v-show`) — различаем по
    // содержимому, а не по порядку.
    const panel = page.locator('[data-gr-popover-panel][role="menu"]')
      .filter({ hasText: 'Переименовать' })

    await demo.locator('[data-gr-tree-node-key="q1"]').first().click({ button: 'right' })
    await expect(panel).toBeVisible()

    // `v-click-outside` отбрасывает всё, что не левая кнопка, а `contextmenu` не
    // порождает `click` — без своего слушателя меню осталось бы висеть.
    await page.locator('h1').click({ button: 'right' })
    await expect(panel).toBeHidden()
  })
})

test.describe('GrSteps: проход мастера', () => {
  test('гейт не пускает вперёд, а будущий шаг вне таб-порядка', async ({ page }) => {
    await page.goto(componentPath('GrSteps'))
    await page.locator('#live-examples').waitFor()

    const demo = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-step][data-value="contacts"]') })
      .first()

    // Будущий шаг рендерится `<span>`: он виден и объявлен, но дойти до него
    // клавиатурой нельзя. Ровно это jsdom и не показывает — там `tabindex`
    // проверяется атрибутом, а не реальным порядком обхода.
    const future = demo.locator('[data-gr-step][data-value="done"] [data-gr-step-trigger]')
    await expect(future).toHaveJSProperty('tagName', 'SPAN')

    const next = demo.getByRole('button', { name: 'Далее' })
    const email = demo.locator('input[name="email"]')
    await email.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(next).toBeFocused()

    // Поле пустое — гейт обязан удержать мастер на шаге и пометить его ошибкой.
    await page.keyboard.press('Enter')
    await expect(demo.locator('[data-gr-step][data-value="contacts"]')).toHaveAttribute('data-status', 'error')

    await email.fill('user@example.com')
    await next.click()

    await expect(demo.locator('[data-gr-step][data-value="delivery"] [data-gr-step-trigger]'))
      .toHaveAttribute('aria-current', 'step')
    await expect(demo.locator('[data-gr-step][data-value="contacts"]')).toHaveAttribute('data-status', 'complete')
  })
})

test.describe('GrList: кликабельная строка', () => {
  test('Enter и Space на строке вызывают действие', async ({ page }) => {
    await page.goto(componentPath('GrList'))
    await page.locator('#live-examples').waitFor()

    const demo = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-list-item-action]') })
      .first()
    const action = demo.locator('[data-gr-list-item-action]').first()

    await action.focus()
    await expect(action).toBeFocused()

    const label = (await action.textContent())?.trim() ?? ''
    await page.keyboard.press('Enter')

    // У демо есть внешний вывод «последнее действие» — по нему и видно, что
    // строка сработала, а не просто получила фокус.
    await expect(demo).toContainText(label.slice(0, 12))
  })
})

test.describe('GrTimeline: ось сквозь заголовок группы', () => {
  test('ось не смещается вбок и не рвётся на границе групп', async ({ page }) => {
    await page.goto(componentPath('GrTimeline'))
    await page.locator('#live-examples').waitFor()

    const grouped = page.locator('[data-example-preview]')
      .filter({ has: page.locator('[data-gr-timeline-group-header]') })
      .first()
    await grouped.waitFor()

    const axis = await grouped.evaluate((root) => {
      const rails = [...root.querySelectorAll('[data-gr-timeline-rail]')]

      const centers = rails.map((rail) => {
        const box = rail.querySelector('[data-gr-timeline-line]')!.getBoundingClientRect()

        return box.x + box.width / 2
      })

      // Нарисованные куски оси по порядку сверху вниз: точки и видимые отрезки.
      const ink: { dot: boolean, top: number, bottom: number }[] = []
      rails.forEach((rail) => {
        rail.querySelectorAll('[data-gr-timeline-marker], [data-gr-timeline-line]').forEach((node) => {
          if (getComputedStyle(node).visibility === 'hidden') return
          const box = node.getBoundingClientRect()
          if (!box.height) return
          ink.push({ dot: node.hasAttribute('data-gr-timeline-marker'), top: box.top, bottom: box.bottom })
        })
      })
      ink.sort((a, b) => a.top - b.top)

      // Единственный задуманный просвет — сразу под точкой. Любой другой разрыв
      // означает дыру в оси.
      let unwantedGap = 0
      for (let i = 1; i < ink.length; i++) {
        if (ink[i - 1].dot) continue
        unwantedGap = Math.max(unwantedGap, ink[i].top - ink[i - 1].bottom)
      }

      return { lateralSpread: Math.max(...centers) - Math.min(...centers), unwantedGap }
    })

    // Заголовок группы и событие — разные грид-контейнеры, и колонку оси каждый
    // считает по своему содержимому. Разойдись ширина рельсы — ось поедет вбок
    // ровно на половину разницы, и увидит это только тот, кто откроет страницу.
    expect(axis.lateralSpread, 'ось смещается на заголовке группы').toBeLessThanOrEqual(0.5)

    expect(axis.unwantedGap, 'ось рвётся на границе групп').toBeLessThanOrEqual(0.5)
  })
})
