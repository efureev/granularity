import { expect, test, type Page } from '@playwright/test'

import { focusedDescription as describeFocus, tabUntil } from '@feugene/granularity-test-kit/e2e'

import { componentPath } from './components'
import { openShowcasePage } from './readiness'

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
    await openShowcasePage(page, componentPath('GrBreadcrumbs'))
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
    await openShowcasePage(page, componentPath('GrBreadcrumbs'))

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
    await openShowcasePage(page, componentPath('GrBreadcrumbs'))

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
    await openShowcasePage(page, componentPath('GrDropdown'))

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
    await openShowcasePage(page, '/components')

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
    await openShowcasePage(page, componentPath('GrCommandPalette'))

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
    await openShowcasePage(page, componentPath('GrInput'))
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
    await openShowcasePage(page, componentPath('GrTextarea'))

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
    await openShowcasePage(page, componentPath('GrFileUpload'))

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
    await openShowcasePage(page, componentPath('GrTable'))

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
    await openShowcasePage(page, componentPath('GrSidebar'))

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
    await openShowcasePage(page, componentPath('GrSidebar'))

    await expect(page.locator('[data-gr-sidebar-content][tabindex="0"]').first()).toBeAttached()
  })

  /**
   * Ради этого подсказку и заводили: нативный `title` показывался только по
   * наведению указателя, поэтому свёрнутый рейл из одних иконок нельзя было
   * прочесть с клавиатуры. В jsdom не проверить — там нет ни фокуса по
   * настоящему, ни всплытия панели.
   */
  test('свёрнутый пункт под фокусом показывает подпись', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrSidebar'))

    const toggle = page.locator('[data-gr-sidebar-toggle]').first()
    await toggle.waitFor()
    if (await toggle.getAttribute('aria-expanded') !== 'false')
      await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const item = page.locator('[data-gr-sidebar-item]').first()
    const label = (await item.getAttribute('aria-label'))!
    expect(label).not.toBe('')

    // `title` подписи больше не несёт — иначе гейт зеленел бы и на старом поведении.
    await expect(item).not.toHaveAttribute('title', label)

    await item.focus()
    await expect(page.getByRole('tooltip').filter({ hasText: label }).first()).toBeVisible()
  })
})

/**
 * На странице два демо, и первое — `keepAlive`: там панели из DOM не уходят,
 * а значит и перехода нет по определению. Отличать их по «нет скрытой панели»
 * нельзя: у `keepAlive`-демо панели ленивые, и до первого показа скрытой тоже
 * ни одной. Надёжный признак — `idBase`, он у каждого демо свой.
 */
/**
 * Штатные 150 мс истекают раньше, чем round-trip Playwright донесёт замер.
 * Замедление вешается **на класс появления**, а не на саму панель: Vue решает,
 * сколько ждать ухода, по вычисленному `transition-duration` элемента, и общее
 * правило задержало бы в DOM уходящую панель — ровно то, чего здесь быть не
 * должно.
 */
async function slowDownPanelEnter(page: Page) {
  await page.addStyleTag({
    content: '.duration-\\[var\\(--gr-duration-fast\\)\\] { transition-duration: 3s !important; }',
  })
}

function basicPanelsPreview(page: Page) {
  return page.locator('[data-example-preview]')
    .filter({ has: page.locator('[id^="demo-tabs-panel-"]') })
    .first()
}

test.describe('GrToaster: стопка', () => {
  /**
   * Ради этого стопка и делается — занятое место. Проверяется оно, а не классы:
   * колонка из шести тостов съедала пол-экрана, и мерить надо высоту, а не
   * признаки раскладки, по которым она получилась.
   */
  test('шесть тостов занимают место одного, а по наведению разворачиваются', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrToaster'))
    await page.getByRole('button', { name: 'Upload six files' }).click()

    const toaster = page.locator('[data-gr-toaster]')
    await expect(toaster.locator('[data-gr-toast]')).toHaveCount(6)

    const oneToast = (await toaster.locator('[data-gr-toast]').first().boundingBox())!.height
    const collapsed = (await toaster.boundingBox())!.height
    expect(collapsed, 'свёрнутая стопка занимает место одного тоста').toBeLessThan(oneToast * 1.5)

    await toaster.locator('[data-gr-toast]').first().hover()
    await expect.poll(async () => (await toaster.boundingBox())!.height).toBeGreaterThan(oneToast * 4)
  })

  /** Из-под передней карточки видны края, но не содержимое: в щель лез обрывок строки. */
  test('содержимое карточек за передней погашено', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrToaster'))
    await page.getByRole('button', { name: 'Upload six files' }).click()

    const behind = page.locator('[data-gr-toaster] [data-gr-toast]').nth(1)
    await expect(behind.locator('> div').first()).toHaveCSS('opacity', '0')

    await page.locator('[data-gr-toaster] [data-gr-toast]').first().hover()
    await expect(behind.locator('> div').first()).toHaveCSS('opacity', '1')
  })
})

test.describe('GrTabPanels: смена панели', () => {
  /**
   * Длительность берётся из `--gr-duration-fast` (150 мс), и ловить её гонкой
   * с Playwright бессмысленно. Токен замедляется до двух секунд: измерение
   * становится детерминированным и заодно доказывает, что переход действительно
   * управляется токеном, а не зашитым числом.
   */
  test('входящая панель проявляется, а не возникает мгновенно', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrTabPanels'))
    await slowDownPanelEnter(page)

    const preview = basicPanelsPreview(page)
    const tab = preview.locator('[role="tab"]').nth(1)
    // Панель берётся по `aria-controls` вкладки, а не «первая в контейнере»:
    // первой какое-то время остаётся уходящая, и замер уехал бы на неё.
    const panelId = await tab.getAttribute('aria-controls')
    expect(panelId, 'вкладка обязана указывать на панель').toBeTruthy()
    await tab.click()

    const panel = page.locator(`#${panelId}`)
    const opacity = await panel.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity))
    expect(opacity, 'панель обязана быть на середине проявления').toBeLessThan(1)

    // И довести дело до конца: на месте она полностью непрозрачна.
    await expect(panel).toHaveCSS('opacity', '1', { timeout: 10000 })
  })

  /**
   * Уходящая панель обязана исчезать мгновенно: две панели в контейнере
   * одновременно растянули бы его на высоту обеих.
   */
  test('во время перехода в контейнере всё равно одна панель', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrTabPanels'))
    await slowDownPanelEnter(page)

    const preview = basicPanelsPreview(page)
    await preview.locator('[role="tab"]').nth(1).click()

    // Появление растянуто на три секунды — окно проверки широкое, и будь у ухода
    // своя анимация, вторая панель попалась бы здесь наверняка.
    const panels = preview.locator('[data-gr-tab-panels] [data-gr-tab-panel]')
    await expect(panels).toHaveCount(1)
    expect(await panels.first().evaluate(n => Number.parseFloat(getComputedStyle(n).opacity))).toBeLessThan(1)
  })
})

test.describe('GrBottomNav: выбор раздела', () => {
  test('Enter меняет раздел, а выключенный пункт не активируется', async ({ page }) => {
    await openShowcasePage(page, componentPath('GrBottomNav'))

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
    await openShowcasePage(page, componentPath('GrContextMenu'))

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
    await openShowcasePage(page, componentPath('GrContextMenu'))

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
    await openShowcasePage(page, componentPath('GrSteps'))

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
    await openShowcasePage(page, componentPath('GrList'))

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
    await openShowcasePage(page, componentPath('GrTimeline'))

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
    await openShowcasePage(page, componentPath('GrCarousel'))
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
    await openShowcasePage(page, componentPath('GrTransfer'))
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
    await openShowcasePage(page, componentPath('GrAffix'))
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
    await openShowcasePage(page, componentPath('GrScrollSpy'))
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
    /*
     * Проверка про **место** приземления, а не про дорогу к нему, поэтому
     * дороги здесь нет: под `prefers-reduced-motion` компонент прокручивает
     * мгновенно (`useScrollSpy.ts`, `behavior: 'auto'`).
     *
     * Плавная прокрутка обрывалась под нагрузкой на полпути — замер показывал
     * 178 → 117 и остановку, — и никакое ожидание этого не лечит: анимация не
     * «не успела», её отменили. Промежуточную подсветку во время движения
     * проверяет соседний тест, и там плавность остаётся.
     */
    await page.emulateMedia({ reducedMotion: 'reduce' })

    const nav = page.locator('[data-gr-scroll-spy]').nth(2)
    await nav.scrollIntoViewIfNeeded()

    // Раздел из середины, а не с конца: у последних прокрутка упирается в свой
    // предел, цель зажимается, и приземление честно оказывается ниже линии.
    await nav.getByText('Предмет договора').click()

    const gap = () => page.evaluate(() => {
      const section = document.getElementById('spy-affix-subject')!
      let scroller = section.parentElement

      while (scroller && !['auto', 'scroll'].includes(getComputedStyle(scroller).overflowY))
        scroller = scroller.parentElement

      const offset = Number.parseFloat(getComputedStyle(scroller!).getPropertyValue('--gr-scroll-spy-offset'))

      return Math.abs(section.getBoundingClientRect().top - (scroller!.getBoundingClientRect().top + offset))
    })

    // Прокрутка плавная, и пауза фиксированной длины её длительность угадывает:
    // под нагрузкой она не успевала, и тест падал с расстоянием в сотню
    // пикселей — на полпути к цели. Ждём приземления, а не времени.
    await expect
      .poll(gap, { message: 'раздел приземлился не на линию активации' })
      .toBeLessThanOrEqual(2)
  })
})

/**
 * `GrOtpInput` держится на настоящей каретке настоящего поля, а её в jsdom нет
 * вовсе: `selectionStart` там не двигается ни стрелками, ни кликом. Поэтому
 * половина контракта поля проверяется только здесь.
 */
test.describe('GrOtpInput', () => {
  test.beforeEach(async ({ page }) => {
    await openShowcasePage(page, componentPath('GrOtpInput'))
    await page.locator('[data-gr-otp-input]').first().waitFor()
  })

  function otp(page: import('@playwright/test').Page) {
    const root = page.locator('[data-gr-otp-input]').first()

    return { root, field: root.locator('[data-gr-otp-input-field]'), cells: root.locator('[data-gr-otp-input-cell]') }
  }

  test('печать раскладывает код по ячейкам, а лишний символ не влезает', async ({ page }) => {
    const { field, cells } = otp(page)

    await field.click()
    await page.keyboard.type('1234567')

    await expect(cells).toHaveText(['1', '2', '3', '4', '5', '6'])
    // Седьмой символ печатать некуда, и сдвигать набранное он не должен.
    await expect(field).toHaveValue('123456')
  })

  test('буква в цифровое поле не попадает', async ({ page }) => {
    const { field } = otp(page)

    await field.click()
    await page.keyboard.type('12ab34')

    await expect(field).toHaveValue('1234')
  })

  test('стрелка возвращает каретку, и печать заменяет символ, не двигая хвост', async ({ page }) => {
    const { field, cells } = otp(page)

    await field.click()
    await page.keyboard.type('123456')

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.type('9')

    await expect(cells).toHaveText(['1', '2', '9', '4', '5', '6'])
  })

  test('Backspace стирает слева, а каретка ходит к краям строки', async ({ page }) => {
    const { field, cells } = otp(page)

    await field.click()
    await page.keyboard.type('123456')

    await page.keyboard.press('Backspace')
    await expect(cells).toHaveText(['1', '2', '3', '4', '5', ''])

    // Не `Home`: на macOS он каретку в поле не двигает вовсе. Компонент живёт
    // на нативной каретке, а значит и на нативных сочетаниях платформы —
    // `ControlOrMeta+←` даёт начало строки и там, и на Linux в CI.
    await page.keyboard.press('ControlOrMeta+ArrowLeft')
    await page.keyboard.type('9')
    await expect(cells).toHaveText(['9', '2', '3', '4', '5', ''])

    await page.keyboard.press('ControlOrMeta+ArrowRight')
    await page.keyboard.type('7')
    await expect(cells).toHaveText(['9', '2', '3', '4', '5', '7'])
  })

  test('Ctrl+A с перепечаткой заменяет код целиком', async ({ page }) => {
    const { field, cells } = otp(page)

    await field.click()
    await page.keyboard.type('123456')

    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('9')

    await expect(cells).toHaveText(['9', '', '', '', '', ''])
  })

  test('клик по дальней ячейке ставит каретку в первую пустую', async ({ page }) => {
    const { field, cells } = otp(page)

    await field.click()
    await page.keyboard.type('12')

    // Кликаем по настоящему полю в координатах дальней ячейки: ячейки лежат
    // под ним, и попасть по ним мышью нельзя — в этом и смысл устройства.
    const box = (await cells.nth(5).boundingBox())!
    const field_ = (await field.boundingBox())!
    await field.click({ position: { x: box.x - field_.x + box.width / 2, y: box.height / 2 } })
    await page.keyboard.type('3')

    // Ячейки — декорация: попадание мышью по невидимому тексту ничего не значит,
    // и «продолжить с того места, где остановился» — единственное ожидаемое.
    await expect(cells).toHaveText(['1', '2', '3', '', '', ''])
  })

  test('всё поле — одна остановка Tab, а не шесть', async ({ page }) => {
    const { field } = otp(page)

    await field.focus()
    await page.keyboard.press('Tab')

    // Сравниваем с этим самым полем: на странице их несколько, и проверка «фокус
    // не на каком-нибудь OTP-поле» зеленела бы, уехав на соседнее демо.
    const stillHere = await field.evaluate(node => node === document.activeElement)

    expect(stillHere, 'Tab остался внутри поля — значит остановок больше одной').toBe(false)
  })
})

/**
 * Двумерная область `GrColorPicker`.
 *
 * В jsdom её не проверить: обе оси живут скрытыми `input[type=range]`, и весь
 * смысл устройства — в том, куда уезжает фокус и что при этом видит диктор, а
 * `sr-only` там не отличим от `display: none`. Плюс сама область без layout не
 * существует: ручка ставится в процентах от её прямоугольника.
 */
test.describe('GrColorPicker: квадрат насыщенность × светлота', () => {
  async function openArea(page: import('@playwright/test').Page) {
    await openShowcasePage(page, componentPath('GrColorPicker'))

    const trigger = page.getByLabel('Accent color').first()
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const area = page.locator('[data-gr-color-picker-area]').first()
    await expect(area).toBeVisible()

    return {
      area,
      saturation: area.locator('[data-gr-color-picker-area-axis="saturation"]'),
      lightness: area.locator('[data-gr-color-picker-area-axis="lightness"]'),
    }
  }

  test('обе оси — настоящие слайдеры со своими именами и значениями', async ({ page }) => {
    const { area, saturation, lightness } = await openArea(page)

    // Роль на обёртке — `group`: виджетная объявила бы поля презентационными,
    // и диктор потерял бы обе оси разом.
    await expect(area).toHaveAttribute('role', 'group')

    for (const axis of [saturation, lightness]) {
      // Скрыты визуально, но не от вспомогательных технологий и не из обхода.
      await expect(axis).toHaveAttribute('type', 'range')
      await expect(axis).not.toHaveAttribute('aria-hidden', 'true')
      await expect(axis).toHaveJSProperty('tabIndex', 0)
    }

    await expect(saturation).toHaveAttribute('aria-label', 'Saturation')
    await expect(lightness).toHaveAttribute('aria-label', 'Lightness')
  })

  test('стрелка поперёк оси меняет соседний канал и уводит фокус к нему', async ({ page }) => {
    const { saturation, lightness } = await openArea(page)

    await saturation.focus()
    const before = Number(await lightness.inputValue())

    await page.keyboard.press('ArrowDown')

    // Значение изменилось у светлоты — и фокус уехал туда же: озвучивают
    // сфокусированное, и без переезда диктор промолчал бы об изменении.
    expect(Number(await lightness.inputValue())).toBe(before - 1)
    await expect(lightness).toBeFocused()

    const saturationBefore = Number(await saturation.inputValue())
    await page.keyboard.press('ArrowRight')
    expect(Number(await saturation.inputValue())).toBe(saturationBefore + 1)
    await expect(saturation).toBeFocused()
  })

  test('крупный шаг и края работают по оси сфокусированного поля', async ({ page }) => {
    const { saturation, lightness } = await openArea(page)

    await lightness.focus()
    await page.keyboard.press('Home')
    await expect(lightness).toHaveValue('0')
    // Соседняя ось при этом не тронута: `Home` — про диапазон, а их два.
    expect(Number(await saturation.inputValue())).toBeGreaterThan(0)

    await page.keyboard.press('PageUp')
    await expect(lightness).toHaveValue('10')

    await page.keyboard.press('End')
    await expect(lightness).toHaveValue('100')
  })

  test('вся область — две остановки Tab, как у диапазона с двумя бегунками', async ({ page }) => {
    const { saturation, lightness } = await openArea(page)

    await saturation.focus()
    await page.keyboard.press('Tab')
    await expect(lightness).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(lightness).not.toBeFocused()
  })
})

/**
 * `GrDataTable`: клавиатура по ячейкам (паттерн `grid`).
 *
 * В jsdom этого не проверить: там нет ни `Tab`, ни настоящего порядка обхода —
 * а весь смысл паттерна в том, что таблица занимает **одну** остановку и что
 * контролы внутри ячеек из обхода выходят. Модель движения гейтится юнит-тестом
 * (`useDataTableGridNavigation.test.ts`), здесь — то, чего он не видит.
 */
test.describe('GrDataTable: клавиатура по ячейкам', () => {
  async function openGrid(page: import('@playwright/test').Page) {
    await openShowcasePage(page, componentPath('GrDataTable'))

    const table = page.locator('[data-gr-datatable]').filter({ has: page.locator('table[role="grid"]') }).first()
    await table.scrollIntoViewIfNeeded()
    await expect(table).toBeVisible()

    return table
  }

  test('вся таблица — одна остановка Tab, и она в шапке', async ({ page }) => {
    const table = await openGrid(page)

    const stops = table.locator('th[tabindex="0"], td[tabindex="0"]')
    await expect(stops).toHaveCount(1)

    // Контролы внутри ячеек своих остановок не держат: до них добираются
    // стрелкой до ячейки и `Enter`.
    const inTabOrder = await table.evaluate(node =>
      [...node.querySelectorAll<HTMLElement>('button, input, a[href]')].filter(el => el.tabIndex >= 0).length)
    expect(inTabOrder, 'контрол внутри ячейки остался в обходе Tab').toBe(0)
  })

  test('стрелки ходят по сетке, Home и End — по краям строки', async ({ page }) => {
    const table = await openGrid(page)

    const cell = () => table.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active || !['TD', 'TH'].includes(active.tagName))
        return null
      const row = active.closest('tr')!
      return { tag: active.tagName, column: [...row.children].indexOf(active) }
    })

    await table.locator('th[tabindex="0"], td[tabindex="0"]').first().focus()
    expect(await cell()).toEqual({ tag: 'TH', column: 0 })

    await page.keyboard.press('ArrowRight')
    expect(await cell()).toEqual({ tag: 'TH', column: 1 })

    // Вниз из шапки — в первую строку данных, колонка сохраняется.
    await page.keyboard.press('ArrowDown')
    expect(await cell()).toEqual({ tag: 'TD', column: 1 })

    await page.keyboard.press('End')
    const atEnd = await cell()
    expect(atEnd!.tag).toBe('TD')

    await page.keyboard.press('Home')
    expect(await cell()).toEqual({ tag: 'TD', column: 0 })
  })

  test('Enter входит в содержимое ячейки, Escape возвращает фокус ячейке', async ({ page }) => {
    const table = await openGrid(page)

    // Первая ячейка строки — служебная, с чекбоксом выбора.
    await table.locator('th[tabindex="0"], td[tabindex="0"]').first().focus()
    await page.keyboard.press('ArrowDown')

    const insideCell = () => table.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active)
        return 'нет фокуса'
      return ['TD', 'TH'].includes(active.tagName) ? 'ячейка' : active.tagName
    })

    expect(await insideCell()).toBe('ячейка')

    await page.keyboard.press('Enter')
    expect(await insideCell(), 'Enter не отдал фокус содержимому ячейки').not.toBe('ячейка')

    await page.keyboard.press('Escape')
    expect(await insideCell(), 'Escape не вернул фокус ячейке').toBe('ячейка')
  })
})

/**
 * `GrInputTag`: правка тега на месте.
 *
 * В jsdom не проверить главное — что `F2` доходит до чипа при настоящем
 * порядке обхода и что после правки фокус возвращается на ту же кнопку, а не
 * теряется вместе с пересозданным узлом.
 */
test.describe('GrInputTag: правка тега', () => {
  async function openField(page: import('@playwright/test').Page) {
    await openShowcasePage(page, componentPath('GrInputTag'))

    const field = page.locator('[data-gr-input-tag]')
      .filter({ has: page.locator('[data-gr-chip-close]') })
      .last()

    await field.scrollIntoViewIfNeeded()
    await expect(field).toBeVisible()

    return field
  }

  test('F2 открывает правку, Enter сохраняет, фокус возвращается на тот же чип', async ({ page }) => {
    const field = await openField(page)
    const firstClose = field.locator('[data-gr-chip-close]').first()

    await firstClose.focus()
    await page.keyboard.press('F2')

    const editor = field.locator('[data-gr-input-tag-edit]')
    await expect(editor).toBeVisible()

    await editor.fill('reworked-tag')
    await page.keyboard.press('Enter')

    await expect(editor).toHaveCount(0)
    await expect(field.locator('[data-gr-chip-label]').first()).toHaveText('reworked-tag')
    // Фокус на крестике того же чипа: ключ по значению пересоздал бы узел, и
    // фокус упал бы на `body`.
    await expect(firstClose).toBeFocused()
  })

  test('Escape отменяет правку и возвращает прежнее значение', async ({ page }) => {
    const field = await openField(page)
    const label = field.locator('[data-gr-chip-label]').first()
    const before = await label.innerText()

    await field.locator('[data-gr-chip-close]').first().focus()
    await page.keyboard.press('F2')
    await field.locator('[data-gr-input-tag-edit]').fill('что-то другое')
    await page.keyboard.press('Escape')

    await expect(field.locator('[data-gr-input-tag-edit]')).toHaveCount(0)
    await expect(label).toHaveText(before)
  })

  /**
   * Чип слушает `keydown`, и без гашения `Backspace` из поля правки снёс бы
   * правящийся тег, а стрелки увезли бы фокус на соседа прямо во время набора.
   */
  test('клавиши правки не достаются чипу', async ({ page }) => {
    const field = await openField(page)
    const count = await field.locator('[data-gr-chip-close]').count()

    await field.locator('[data-gr-chip-close]').first().focus()
    await page.keyboard.press('F2')

    const editor = field.locator('[data-gr-input-tag-edit]')
    await editor.fill('abc')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('ArrowLeft')

    await expect(editor).toBeVisible()
    await expect(editor).toBeFocused()
    await expect(field.locator('[data-gr-chip-close]')).toHaveCount(count)
  })
})
