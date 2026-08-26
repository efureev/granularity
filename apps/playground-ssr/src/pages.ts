import { defineComponent, h, type Component } from 'vue'

import App from './App.vue'
import Catalog from './catalog/Catalog.vue'
import ChartsPage from './ChartsPage.vue'
import ChronoPage from './ChronoPage.vue'
import ComponentPage from './catalog/ComponentPage.vue'
import DashboardPage from './DashboardPage.vue'
import EditorPage from './EditorPage.vue'
import OverlayStackPage from './OverlayStackPage.vue'
import RiskyPage from './RiskyPage.vue'
import TeleportPage from './TeleportPage.vue'
import { ALL_FIXTURES, componentPath } from './catalog/fixtures'
import type { ComponentFixture } from './catalog/fixture'

/**
 * Страницы стенда и их адреса.
 *
 * Список один на сервер и на клиент, и это не удобство, а условие работы:
 * гидрация сверяет разметку с тем, что клиент отрисовал **сам**. Резолвь
 * стороны по-разному — и стенд, который существует ради поиска расхождений,
 * начал бы их производить.
 *
 * Страниц два рода, и они не взаимозаменяемы:
 *
 * - **тематические** (`PLAYGROUND_PAGES`) — фикстуры под класс дефектов: часы
 *   в отрисовке, телепорт, браузерный API в setup, стек слоёв. Проверяют то,
 *   что видно только в связке нескольких компонентов, и потому собраны вместе
 *   намеренно;
 * - **страницы компонентов** (`COMPONENT_PAGES`) — по одному компоненту на
 *   адрес, из реестра фикстур. Отвечают за полноту: каждый компонент
 *   экосистемы поднимается на сервере и гидрируется начисто.
 *
 * Тесты рендерят страницы напрямую (`render(Page)`), навигация нужна человеку —
 * посмотреть глазами исходный HTML.
 */
export interface PlaygroundPage {
  path: string
  title: string
  /** Что именно проверяет страница. */
  about: string
  component: Component
}

/** Тематические страницы: они и только они попадают в шапку стенда. */
export const PLAYGROUND_PAGES: readonly PlaygroundPage[] = [
  { path: '/', title: 'Каталог', about: 'карта страниц: по одному компоненту на адрес', component: Catalog },
  { path: '/app', title: 'App', about: 'изоморфные и телепортирующие компоненты ядра', component: App },
  { path: '/teleport', title: 'Teleport', about: 'только телепортирующие: панели на месте, а не в body', component: TeleportPage },
  { path: '/risky', title: 'Risky', about: 'браузерный API в setup, navigator, авто-id', component: RiskyPage },
  { path: '/overlay-stack', title: 'Overlay stack', about: 'два открытых оверлея и чтение темы', component: OverlayStackPage },
  { path: '/chrono', title: 'Chrono', about: 'часы в отрисовке, ленивые панели, useAnnouncer', component: ChronoPage },
  { path: '/charts', title: 'Charts', about: 'ResizeObserver и useId() в разметке SVG', component: ChartsPage },
  { path: '/dashboard', title: 'Dashboard', about: 'ResizeObserver и IntersectionObserver в выборе раскладки', component: DashboardPage },
  { path: '/editor', title: 'Editor', about: 'ProseMirror требует DOM: редактор поднимается только на клиенте', component: EditorPage },
]

/**
 * Страница фикстуры — оболочка с заголовком и ровно одним компонентом.
 *
 * Компонент создаётся один раз на модуль: `resolvePage` обязан возвращать один
 * и тот же объект серверу и клиенту, иначе гидрация сравнивала бы разное.
 */
function pageFor(fixture: ComponentFixture): Component {
  return defineComponent({
    name: `${fixture.name}FixturePage`,
    render: () => h(
      ComponentPage,
      { name: fixture.name, about: fixture.about },
      { default: () => (fixture.page ? h(fixture.page) : fixture.render?.()) },
    ),
  })
}

/** По странице на компонент — из реестра фикстур, а не списком руками. */
export const COMPONENT_PAGES: readonly PlaygroundPage[] = ALL_FIXTURES.map(fixture => ({
  path: componentPath(fixture.name),
  title: fixture.name,
  about: fixture.about,
  component: pageFor(fixture),
}))

/** Всё, что резолвится по адресу: тематические страницы плюс страницы компонентов. */
export const ALL_PAGES: readonly PlaygroundPage[] = [...PLAYGROUND_PAGES, ...COMPONENT_PAGES]

const byPath = new Map(ALL_PAGES.map(page => [page.path, page.component]))

/** Неизвестный путь отдаёт корневую страницу: 404 у стенда без роутера смысла не имеет. */
export function resolvePage(pathname: string): Component {
  return byPath.get(pathname) ?? PLAYGROUND_PAGES[0]!.component
}
