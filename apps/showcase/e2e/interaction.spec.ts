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
          if (getComputedStyle(node).visibility === 'hidden')
            return
          const box = node.getBoundingClientRect()
          if (!box.height)
            return
          ink.push({ dot: node.hasAttribute('data-gr-timeline-marker'), top: box.top, bottom: box.bottom })
        })
      })
      ink.sort((a, b) => a.top - b.top)

      // Единственный задуманный просвет — сразу под точкой. Любой другой разрыв
      // означает дыру в оси.
      let unwantedGap = 0
      for (let i = 1; i < ink.length; i++) {
        if (ink[i - 1].dot)
          continue
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

/**
 * Карусель: `inert` и живая прокрутка полосы.
 *
 * В jsdom `inert` — просто атрибут: фокус он там не блокирует, и утверждение
 * «`Tab` не заходит в невидимый кадр» юнит-тестом недоказуемо. Прокрутка полосы
 * миниатюр и её признак переполнения тоже требуют раскладки, которой в jsdom
 * нет вовсе.
 */
test.describe('GrCarousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrCarousel'))
    await page.locator('#live-examples').waitFor()
  })

  test('Tab не заходит в кадры, которых не видно', async ({ page }) => {
    // Интерактив внутри кадра есть не у каждого демо: ищем по всей странице, а
    // не в первой карусели, иначе тест молча уходил бы в skip и не проверял ничего.
    const hidden = page.locator('[data-gr-carousel-slide][inert]').locator('a, button')

    // Ожидающее утверждение, а не `count()`: демо страницы монтируются
    // постепенно, и мгновенный снимок ловил пустую страницу примерно в одном
    // прогоне из четырёх — тест уходил в ложное падение.
    await expect(hidden.first(), 'на странице нет невидимого кадра с интерактивом — тест бесполезен').toBeAttached()

    await page.keyboard.press('Tab')
    for (let step = 0; step < 40; step += 1) {
      const inInert = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[data-gr-carousel-slide][inert]')))
      expect(inInert, 'фокус попал в кадр, помеченный inert').toBe(false)
      await page.keyboard.press('Tab')
    }
  })

  test('полоса миниатюр объявляет, что продолжается за краем', async ({ page }) => {
    const strip = page.locator('[data-gr-carousel-indicators][data-variant="thumbnails"]').first()
    await expect(strip).toHaveAttribute('data-overflow', /none|start|end|both/)
  })

  test('стрелка листает ленту в живом браузере', async ({ page }) => {
    const carousel = page.locator('[data-gr-carousel]').first()
    const track = carousel.locator('[data-gr-carousel-track]')

    await expect(track).toHaveAttribute('style', /--gr-carousel-index:\s*0/)

    await carousel.locator('[data-gr-carousel-next]').click()
    await expect(track).toHaveAttribute('style', /--gr-carousel-index:\s*1/)
  })
})

/**
 * `GrTransfer`: таб-порядок, активация кнопки и попадание указателя между двумя
 * панелями. В jsdom нет ни перемещения фокуса по `Tab`, ни активации по `Enter`,
 * ни раскладки — прямоугольники там нулевые, и геометрию задаёт сам тест.
 */
test.describe('GrTransfer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrTransfer'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-gr-transfer]').first().waitFor()
  })

  test('каждая панель держит ровно одну остановку Tab', async ({ page }) => {
    const transfer = page.locator('[data-gr-transfer]').first()
    const stops = await transfer.locator('[data-gr-transfer-option][tabindex="0"]').count()
    const total = await transfer.locator('[data-gr-transfer-option]').count()

    expect(total, 'на странице нет строк — тест бесполезен').toBeGreaterThan(1)
    // По одной остановке на панель: слева и справа.
    expect(stops).toBeLessThanOrEqual(2)
  })

  test('Enter на кнопке переноса действительно переносит', async ({ page }) => {
    const transfer = page.locator('[data-gr-transfer]').first()
    const source = transfer.locator('[data-gr-transfer-list="source"] [data-gr-transfer-option]')
    const target = transfer.locator('[data-gr-transfer-list="target"] [data-gr-transfer-option]')

    const before = await target.count()
    await source.first().click()
    await transfer.locator('[data-gr-transfer-to-target]').focus()
    await page.keyboard.press('Enter')

    await expect(target).toHaveCount(before + 1)
  })

  test('Shift-клик берёт диапазон настоящим модификатором', async ({ page }) => {
    const source = page.locator('[data-gr-transfer]').first().locator('[data-gr-transfer-list="source"] [data-gr-transfer-option]')

    await source.nth(0).click()
    await source.nth(2).click({ modifiers: ['Shift'] })

    const selected = page.locator('[data-gr-transfer-list="source"] [data-gr-transfer-option][aria-selected="true"]')
    await expect(selected).toHaveCount(3)
  })

  test('строка перетаскивается из левой панели в правую', async ({ page }) => {
    const transfer = page.locator('[data-gr-transfer]').first()
    const source = transfer.locator('[data-gr-transfer-list="source"] [data-gr-transfer-option]')
    const targetList = transfer.locator('[data-gr-transfer-list="target"]')

    const before = await targetList.locator('[data-gr-transfer-option]').count()

    // Прокрутка обязательна: `boundingBox()` отдаёт координаты относительно
    // вьюпорта, а демо лежит ниже сгиба — без неё указатель уезжает мимо строки
    // и жест не начинается вовсе, молча.
    await source.first().scrollIntoViewIfNeeded()
    const from = await source.first().boundingBox()
    const to = await targetList.boundingBox()
    expect(from && to, 'нет раскладки — тест бесполезен').toBeTruthy()

    await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2)
    await page.mouse.down()
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 12 })
    await page.mouse.up()

    await expect(targetList.locator('[data-gr-transfer-option]')).toHaveCount(before + 1)
  })
})

/**
 * `GrAffix`: прилипание. В jsdom нет ни прокрутки, ни раскладки, ни UnoCSS — то
 * есть нет ничего, из чего состоит этот компонент: там не проверяются ни момент
 * переключения состояния, ни то, что классы фона и тени вообще превратились в CSS.
 *
 * Прокрутка везде колесом, а не присвоением `scrollTop`: программная прокрутка
 * из скрипта не даёт `IntersectionObserver` записи, и тест молча проверял бы
 * компонент, который не получил ни одного вызова.
 */
test.describe('GrAffix: прилипание', () => {
  /** Прямоугольник скроллпорта, внутри которого живёт панель. */
  async function scrollerBox(affix: import('@playwright/test').Locator) {
    return affix.evaluate((el) => {
      let scroller = el.parentElement
      while (scroller && !['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY))
        scroller = scroller.parentElement

      const rect = scroller!.getBoundingClientRect()

      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })
  }

  async function wheelOver(page: import('@playwright/test').Page, box: { x: number, y: number, width: number, height: number }, delta: number) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, delta)
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrAffix'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-gr-affix]').first().waitFor()
  })

  test('панель прилипает к краю своего скроллера, а не к окну', async ({ page }) => {
    const affix = page.locator('[data-gr-affix][data-placement="top"]').first()
    await affix.scrollIntoViewIfNeeded()

    const scroller = await scrollerBox(affix)
    await wheelOver(page, scroller, 200)

    await expect(affix).toHaveAttribute('data-stuck', 'true')

    const pinned = (await affix.boundingBox())!
    // Верх панели совпал с верхом блока, а не с верхом вьюпорта: корнем
    // наблюдателя стал ближайший скроллпорт.
    expect(Math.abs(pinned.y - scroller.y)).toBeLessThanOrEqual(2)
    expect(scroller.y).toBeGreaterThan(4)
  })

  test('фон и тень приезжают вместе с прилипанием и уезжают с ним', async ({ page }) => {
    const affix = page.locator('[data-gr-affix][data-placement="top"]').first()
    await affix.scrollIntoViewIfNeeded()

    const surface = () => affix.evaluate((el) => {
      const style = getComputedStyle(el)

      return { shadow: style.boxShadow, alpha: style.backgroundColor.includes('rgba(0, 0, 0, 0)') ? 0 : 1 }
    })

    // Проверка того, что класс вообще превратился в CSS: в jsdom это
    // недостижимо, там `boxShadow` пуст у любого элемента.
    expect(await surface()).toEqual({ shadow: 'none', alpha: 0 })

    const scroller = await scrollerBox(affix)
    await wheelOver(page, scroller, 200)
    await expect(affix).toHaveAttribute('data-stuck', 'true')

    // Ожидающие утверждения, а не мгновенный снимок: фон и тень едут переходом,
    // и первый кадр после переключения состояния ещё держит прежние значения.
    await expect.poll(async () => (await surface()).alpha, {
      message: 'прилипшая панель обязана быть непрозрачной',
    }).toBe(1)
    await expect.poll(async () => (await surface()).shadow).not.toBe('none')

    await wheelOver(page, scroller, -400)
    await expect(affix).not.toHaveAttribute('data-stuck', 'true')
    await expect.poll(async () => (await surface()).shadow).toBe('none')
  })

  test('раскладка не дёргается в момент прилипания', async ({ page }) => {
    const affix = page.locator('[data-gr-affix][data-placement="top"]').first()
    await affix.scrollIntoViewIfNeeded()

    const before = (await affix.boundingBox())!
    const scroller = await scrollerBox(affix)
    await wheelOver(page, scroller, 200)
    await expect(affix).toHaveAttribute('data-stuck', 'true')

    const after = (await affix.boundingBox())!
    // Ради этого граница сделана тенью, а не рамкой: рамка добавила бы высоту
    // ровно в момент прилипания.
    expect(after.height).toBe(before.height)
  })

  test('нижняя панель прилипла с самого начала и отпускается в конце формы', async ({ page }) => {
    const affix = page.locator('[data-gr-affix][data-placement="bottom"]').first()
    await affix.scrollIntoViewIfNeeded()

    // Первую запись наблюдатель отдаёт сразу после `observe()`, поэтому
    // состояние верно ещё до единой прокрутки.
    await expect(affix).toHaveAttribute('data-stuck', 'true')

    const scroller = await scrollerBox(affix)
    const pinned = (await affix.boundingBox())!
    expect(Math.abs((pinned.y + pinned.height) - (scroller.y + scroller.height))).toBeLessThanOrEqual(2)

    await wheelOver(page, scroller, 2000)
    await expect(affix).not.toHaveAttribute('data-stuck', 'true')
  })

  test('прилипшая панель перекрывает уезжающее под неё содержимое', async ({ page }) => {
    const affix = page.locator('[data-gr-affix][data-placement="top"]').first()
    await affix.scrollIntoViewIfNeeded()

    const scroller = await scrollerBox(affix)
    await wheelOver(page, scroller, 200)
    await expect(affix).toHaveAttribute('data-stuck', 'true')

    // Порядок отрисовки проверяется попаданием точки, а не числом `z-index`:
    // числа локальны, а важно, кто оказался сверху.
    const onTop = await affix.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)

      return Boolean(hit && el.contains(hit))
    })

    expect(onTop, 'строка списка оказалась поверх прилипшей панели').toBe(true)
  })

  test('выключенная панель не прилипает и остаётся в потоке', async ({ page }) => {
    const toggle = page.getByRole('switch').first()
    await toggle.scrollIntoViewIfNeeded()

    // Демо с переключателем — последнее на странице, поэтому и панель последняя.
    const affix = page.locator('[data-gr-affix]').last()
    await expect(affix).toHaveClass(/sticky/)

    await toggle.click()

    await expect(affix).not.toHaveClass(/sticky/)
    await expect(affix).not.toHaveAttribute('data-stuck', 'true')
  })
})

/**
 * `GrScrollSpy`: подсветка по прокрутке. В jsdom нет ни прокрутки, ни раскладки,
 * ни UnoCSS — то есть нет ничего, из чего этот компонент состоит: там не
 * проверяются ни момент смены активного раздела, ни то, что классы вообще
 * превратились в CSS.
 *
 * Прокрутка везде колесом, а не присвоением `scrollTop`: программная прокрутка
 * из скрипта не даёт `IntersectionObserver` записи, и тест молча проверял бы
 * компонент, который не получил ни одного вызова.
 */
test.describe('GrScrollSpy: подсветка', () => {
  /** Прямоугольник скроллпорта, внутри которого лежат разделы этого оглавления. */
  async function scrollerBox(page: import('@playwright/test').Page, sectionId: string) {
    return page.evaluate((id) => {
      let scroller = document.getElementById(id)?.parentElement ?? null

      while (scroller && !['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY))
        scroller = scroller.parentElement

      const rect = scroller!.getBoundingClientRect()

      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }, sectionId)
  }

  async function wheelOver(page: import('@playwright/test').Page, box: { x: number, y: number, width: number, height: number }, delta: number) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, delta)
  }

  test.beforeEach(async ({ page }) => {
    await page.goto(componentPath('GrScrollSpy'))
    await page.locator('#live-examples').waitFor()
    await page.locator('[data-gr-scroll-spy]').first().waitFor()
  })

  test('активный пункт едет по разделам вместе с прокруткой', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').first()
    await nav.scrollIntoViewIfNeeded()

    await expect(nav.locator('[aria-current="location"]')).toHaveText('Назначение')

    const box = await scrollerBox(page, 'spy-basic-purpose')
    await wheelOver(page, box, 150)

    await expect(nav.locator('[aria-current="location"]')).not.toHaveText('Назначение')
    // Текущим объявлен ровно один пункт: «текущее место» может быть только одно.
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1)
  })

  test('дно скроллпорта активирует последний раздел', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').first()
    await nav.scrollIntoViewIfNeeded()

    const box = await scrollerBox(page, 'spy-basic-purpose')
    // Последний раздел короче остатка экрана: до линии он не доезжает никогда,
    // и без отдельного правила остался бы недостижим.
    await wheelOver(page, box, 2000)

    await expect(nav.locator('[aria-current="location"]')).toHaveText('Исключения')
  })

  test('классы активного пункта превратились в CSS', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').first()
    await nav.scrollIntoViewIfNeeded()

    const colors = await nav.evaluate((el) => {
      const active = el.querySelector('[aria-current="location"]')!
      const idle = [...el.querySelectorAll('[data-gr-scroll-spy-item]')].find(item => item !== active)!

      return {
        activeRail: getComputedStyle(active).borderInlineStartColor,
        idleRail: getComputedStyle(idle).borderInlineStartColor,
        activeWeight: getComputedStyle(active).fontWeight,
        idleWeight: getComputedStyle(idle).fontWeight,
      }
    })

    // Активность различима не только цветом — иначе она не существует при
    // монохромном зрении.
    expect(colors.activeRail).not.toBe(colors.idleRail)
    expect(colors.activeWeight).not.toBe(colors.idleWeight)
  })

  test('клик не прогоняет подсветку по промежуточным пунктам', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').first()
    await nav.scrollIntoViewIfNeeded()

    // Считаем смены активного пункта за время перехода. Проверки нет нигде,
    // кроме живого браузера: подсветка мигала бы только на плавной прокрутке.
    await page.evaluate(() => {
      const target = document.querySelectorAll('[data-gr-scroll-spy]')[0]
      const seen: string[] = []
      const observer = new MutationObserver(() => {
        const active = target.querySelector('[aria-current="location"]')?.textContent?.trim() ?? ''

        if (seen.at(-1) !== active)
          seen.push(active)
      })

      observer.observe(target, { attributes: true, subtree: true, attributeFilter: ['aria-current'] })
      Object.assign(window, { __spySeen: seen, __spyObserver: observer })
    })

    await nav.getByText('Исключения').click()
    await page.waitForTimeout(1200)

    const seen = await page.evaluate(() => {
      ;(window as unknown as { __spyObserver: MutationObserver }).__spyObserver.disconnect()

      return (window as unknown as { __spySeen: string[] }).__spySeen
    })

    expect(seen.at(-1)).toBe('Исключения')
    expect(seen, `подсветка прошлась по промежуточным пунктам: ${seen.join(' → ')}`).toHaveLength(1)
  })

  test('переход обновляет адрес, не заводя запись в истории', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').first()
    await nav.scrollIntoViewIfNeeded()

    const before = await page.evaluate(() => history.length)
    await nav.getByText('Сроки').click()

    await expect.poll(async () => new URL(page.url()).hash).toBe('#spy-basic-terms')
    // `pushState` превратил бы «Назад» в отмену прокрутки вместо возврата.
    expect(await page.evaluate(() => history.length)).toBe(before)
  })

  test('заголовок приземляется под липкой шапкой', async ({ page }) => {
    const nav = page.locator('[data-gr-scroll-spy]').nth(2)
    await nav.scrollIntoViewIfNeeded()

    // Раздел из середины, а не с конца: у последних прокрутка упирается в свой
    // предел, цель зажимается, и приземление честно оказывается ниже линии.
    await nav.getByText('Предмет договора').click()
    await page.waitForTimeout(800)

    const gap = await page.evaluate(() => {
      const section = document.getElementById('spy-affix-subject')!
      let scroller = section.parentElement

      while (scroller && !['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY))
        scroller = scroller.parentElement

      const offset = Number.parseFloat(getComputedStyle(scroller!).getPropertyValue('--gr-scroll-spy-offset'))

      return section.getBoundingClientRect().top - (scroller!.getBoundingClientRect().top + offset)
    })

    expect(Math.abs(gap), 'раздел приземлился не на линию активации').toBeLessThanOrEqual(2)
  })
})
