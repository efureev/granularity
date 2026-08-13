import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import ChartsPage from '../src/ChartsPage.vue'
import ChronoPage from '../src/ChronoPage.vue'
import DashboardPage from '../src/DashboardPage.vue'
import OverlayStackPage from '../src/OverlayStackPage.vue'
import RiskyPage from '../src/RiskyPage.vue'
import TeleportPage from '../src/TeleportPage.vue'
import { render } from '../src/entry-server'

/**
 * `globalSetup` витеста выполняется в НАСТОЯЩЕМ Node — без jsdom.
 *
 * Это принципиально: компоненты определяют серверное окружение через
 * `typeof window === 'undefined'`. Если рендерить внутри теста с
 * `environment: 'jsdom'`, `window` существует, гарды считают себя клиентом, и
 * получается HTML, которого настоящий сервер никогда не отдаст. Первая версия
 * этого стенда попалась ровно в эту ловушку.
 *
 * Поэтому серверный HTML снимается здесь и кладётся на диск, а тест гидрации
 * (jsdom) читает уже готовый снимок.
 */

export const SSR_SNAPSHOT_PATH = resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json')

export default async function setup(): Promise<void> {
  // `app` — демо-страница целиком, `teleport` — сжатый набор только из
  // телепортирующих компонентов (регрессионный гейт к ANALYSIS §60),
  // `risky` — компоненты с браузерным API, `navigator` и авто-id в setup,
  // `overlayStack` — два открытых оверлея и чтение темы,
  // `chrono` — companion-пакет: часы в отрисовке, ленивые панели, `useAnnouncer`,
  // `charts` — companion-пакет: `ResizeObserver`, `useId()` в разметке SVG,
  // `dashboard` — companion-пакет: `ResizeObserver` и `IntersectionObserver` в выборе раскладки.
  const [app, teleport, risky, overlayStack, chrono, charts, dashboard] = await Promise.all([
    render(),
    render(TeleportPage),
    render(RiskyPage),
    render(OverlayStackPage),
    render(ChronoPage),
    render(ChartsPage),
    render(DashboardPage),
  ])

  await mkdir(dirname(SSR_SNAPSHOT_PATH), { recursive: true })
  await writeFile(SSR_SNAPSHOT_PATH, JSON.stringify({ app, teleport, risky, overlayStack, chrono, charts, dashboard }), 'utf8')
}
