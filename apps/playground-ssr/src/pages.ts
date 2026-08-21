import type { Component } from 'vue'

import App from './App.vue'
import ChartsPage from './ChartsPage.vue'
import ChronoPage from './ChronoPage.vue'
import DashboardPage from './DashboardPage.vue'
import EditorPage from './EditorPage.vue'
import OverlayStackPage from './OverlayStackPage.vue'
import RiskyPage from './RiskyPage.vue'
import TeleportPage from './TeleportPage.vue'

/**
 * Страницы стенда и их адреса.
 *
 * Список один на сервер и на клиент, и это не удобство, а условие работы:
 * гидрация сверяет разметку с тем, что клиент отрисовал **сам**. Резолвь
 * стороны по-разному — и стенд, который существует ради поиска расхождений,
 * начал бы их производить.
 *
 * Страницы — фикстуры: каждая собрана под свой класс дефектов, а не под
 * демонстрацию. Тесты рендерят их напрямую (`render(Page)`), навигация нужна
 * человеку — посмотреть глазами исходный HTML.
 */
export interface PlaygroundPage {
  path: string
  title: string
  /** Что именно проверяет страница. */
  about: string
  component: Component
}

export const PLAYGROUND_PAGES: readonly PlaygroundPage[] = [
  { path: '/', title: 'App', about: 'изоморфные и телепортирующие компоненты ядра', component: App },
  { path: '/teleport', title: 'Teleport', about: 'только телепортирующие: панели на месте, а не в body', component: TeleportPage },
  { path: '/risky', title: 'Risky', about: 'браузерный API в setup, navigator, авто-id', component: RiskyPage },
  { path: '/overlay-stack', title: 'Overlay stack', about: 'два открытых оверлея и чтение темы', component: OverlayStackPage },
  { path: '/chrono', title: 'Chrono', about: 'часы в отрисовке, ленивые панели, useAnnouncer', component: ChronoPage },
  { path: '/charts', title: 'Charts', about: 'ResizeObserver и useId() в разметке SVG', component: ChartsPage },
  { path: '/dashboard', title: 'Dashboard', about: 'ResizeObserver и IntersectionObserver в выборе раскладки', component: DashboardPage },
  { path: '/editor', title: 'Editor', about: 'ProseMirror требует DOM: редактор поднимается только на клиенте', component: EditorPage },
]

/** Неизвестный путь отдаёт корневую страницу: 404 у стенда без роутера смысла не имеет. */
export function resolvePage(pathname: string): Component {
  return PLAYGROUND_PAGES.find(page => page.path === pathname)?.component ?? App
}
