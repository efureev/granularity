/**
 * Что показывает приложение: компоненты с макетами и версии их дизайна.
 *
 * Файлы макетов лежат в `src/designs/<компонент>/<версия>/<Макет>.vue`, общий
 * CSS версии — `concept.css` рядом с ними, CSS отдельного макета — одноимённый
 * `.css`. Соответствие списков ниже файлам на диске держит тест
 * `src/__tests__/catalog.test.ts`.
 */

export type VersionStatus = 'implemented' | 'concept'

export interface BoardOptionChoice {
  value: string
  label: string
}

/** Проп макета, который можно переключить над ним. */
export interface BoardOption {
  prop: string
  label: string
  choices: BoardOptionChoice[]
}

export interface Board {
  /** Сегмент адреса: `?board=variants`. */
  id: string
  /** Имя файла без расширения. */
  file: string
  title: string
  /** Ширина, под которую нарисован макет; уже неё он масштабируется. */
  width: number
  interactive?: boolean
  options?: BoardOption[]
}

export interface DesignVersion {
  id: string
  title: string
  status: VersionStatus
  /** Одна фраза: на чём держится версия. */
  tagline: string
  /** Заголовок раздела версии в `docs/design/<Компонент>.md`. */
  docHeading: string
  /** Цвета для карточки выбора — заливка, подпись, фон. */
  palette: [string, string, string]
  boards: Board[]
}

export interface CatalogComponent {
  id: string
  name: string
  /** Компоненты пакета, которые описывает страница. */
  exports: string[]
  importPath: string
  summary: string
  versions: DesignVersion[]
}

const shape: BoardOption = {
  prop: 'shape',
  label: 'Форма',
  choices: [
    { value: 'rounded', label: 'скруглённая' },
    { value: 'capsule', label: 'капсула' },
  ],
}

function board(id: string, file: string, title: string, extra: Partial<Board> = {}): Board {
  return { id, file, title, width: 1280, ...extra }
}

export const catalog: CatalogComponent[] = [
  {
    id: 'button',
    name: 'Button',
    exports: ['GrButton', 'GrButtonGroup'],
    importPath: '@feugene/granularity/components/GrButton',
    summary: 'Запускает действие, которое меняет состояние: сохранить, удалить, отправить. Переход по адресу — ссылка или кнопка с href.',
    versions: [
      {
        id: 'evolution',
        title: 'Эволюция',
        status: 'implemented',
        tagline: 'Тот же API и токены, дотянуты детали: фокус контуром, загрузка без сдвига, рамки весов, зона касания.',
        docHeading: 'Эволюция — реализована',
        palette: ['#4f46e5', '#ffffff', '#f8fafc'],
        boards: [
          board('overview', 'Overview', 'Обзор и анатомия'),
          board('variants', 'Variants', 'Варианты × тоны'),
          board('states', 'States', 'Состояния', { interactive: true }),
          board('sizes', 'Sizes', 'Размеры и содержимое'),
          board('groups', 'Groups', 'Группы'),
          board('dark', 'Dark', 'Тёмная тема'),
          board('patterns', 'Patterns', 'Паттерны'),
          board('playground', 'Playground', 'Песочница', { interactive: true }),
        ],
      },
      {
        id: 'tactile',
        title: 'Тактильная',
        status: 'concept',
        tagline: 'Кнопка как предмет: свет сверху, тень снизу, отклик телом.',
        docHeading: 'Тактильная — концепт',
        palette: ['#4f46e5', '#ffffff', '#eef2ff'],
        boards: [
          board('overview', 'Overview', 'Концепция', { options: [shape] }),
          board('variants', 'Variants', 'Варианты × тоны', { options: [shape] }),
          board('motion', 'Motion', 'Состояния и движение', { interactive: true }),
          board('content', 'Content', 'Размеры, содержимое, группы'),
          board('dark', 'Dark', 'Тёмная тема'),
          board('scene', 'Scene', 'В продукте'),
          board('playground', 'Playground', 'Песочница', { interactive: true }),
        ],
      },
      {
        id: 'blueprint',
        title: 'Чертёж',
        status: 'concept',
        tagline: 'Плоская кнопка: заливка, линия и шрифт. Под указателем — линия хода по нижней кромке.',
        docHeading: 'Чертёж — концепт',
        palette: ['#3730a3', '#ffffff', '#f1f5f9'],
        boards: [
          board('overview', 'Overview', 'Концепция'),
          board('variants', 'Variants', 'Варианты × тоны'),
          board('states', 'States', 'Состояния и линия хода', { interactive: true }),
          board('content', 'Content', 'Размеры, содержимое, группы'),
          board('dark', 'Dark', 'Тёмная тема'),
          board('scene', 'Scene', 'В продукте'),
          board('playground', 'Playground', 'Песочница', { interactive: true }),
        ],
      },
      {
        id: 'clay',
        title: 'Глина',
        status: 'concept',
        tagline: 'Тёплая бумага, графитовые чернила и одна глиняная точка на экран.',
        docHeading: 'Глина — концепт',
        palette: ['#d97757', '#141413', '#faf9f5'],
        boards: [
          board('overview', 'Overview', 'Концепция'),
          board('variants', 'Variants', 'Варианты × тоны'),
          board('states', 'States', 'Состояния', { interactive: true }),
          board('content', 'Content', 'Размеры, содержимое, группы'),
          board('dark', 'Dark', 'Тёмная тема'),
          board('scene', 'Scene', 'В продукте'),
          board('playground', 'Playground', 'Песочница', { interactive: true }),
        ],
      },
    ],
  },
]

export function findComponent(id: string): CatalogComponent | undefined {
  return catalog.find(item => item.id === id)
}

export function implementedVersion(component: CatalogComponent): DesignVersion {
  const version = component.versions.find(item => item.status === 'implemented')
  if (!version)
    throw new Error(`У компонента ${component.name} нет реализованной версии`)
  return version
}

export function conceptVersions(component: CatalogComponent): DesignVersion[] {
  return component.versions.filter(item => item.status === 'concept')
}
