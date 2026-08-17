import { createTheme, extendTheme, tone } from '@feugene/granularity/theme'

/**
 * Поверхности темы `ocean` — от них считается всё остальное. `tone` берёт отсюда
 * фон, текст и карточку: больше ему ничего не нужно.
 */
const oceanSurfaces = {
  '--gr-bg': '#041e2b',
  '--gr-fg': '#e8f4fa',
  '--gr-card': '#0a2f42',
}

/**
 * Тема `ocean` — пример из `packages/granularity/docs/theming.md`.
 *
 * Объявляет ТОЛЬКО то, что отличается от тёмной темы пакета. Всё остальное —
 * включая роли, которых на момент написания этой темы ещё не существовало, —
 * приезжает из базы при сборке. Это и есть разница с прежним подходом: раньше
 * здесь лежал CSS-файл на 90 ролей, и стоило пакету завести новую роль, как
 * тема тихо отставала (ровно так она и отстала на 28 ролях `-solid*`).
 *
 * Тема тёмная, поэтому действует конвенция тёмной темы пакета: заливка тоном
 * СВЕТЛЕЕ фона, а текст на ней (`-fg`) — тёмный.
 *
 * Контраст и различимость тонов проверяет сам `extendTheme` — сборка падает,
 * если тема не читается.
 */
export const ocean = extendTheme({
  name: 'ocean',
  base: 'dark',
  tokens: {
    // Поверхности.
    ...oceanSurfaces,
    '--gr-card-fg': '#e8f4fa',
    '--gr-popover': '#0a2f42',
    '--gr-popover-fg': '#e8f4fa',
    '--gr-muted': '#123f56',
    // Вторичный текст живёт на `--gr-muted`/`--gr-secondary`, а не на фоне
    // страницы, и выверен по самому светлому из них (ловушка №1).
    '--gr-muted-fg': '#a8c4d4',
    '--gr-secondary': '#123f56',
    '--gr-secondary-fg': '#e8f4fa',
    '--gr-brd': '#1c5470',
    '--gr-input': '#1c5470',
    '--gr-ring': '#38bdf8',
    // Подложка модальных слоёв: тон фона темы, а не нейтральный чёрный.
    '--gr-overlay-bg': 'rgb(4 30 43 / 0.6)',

    // Состояния. Недоступный контрол гасится поверхностью, а не прозрачностью.
    '--gr-disabled-bg': '#0d3446',
    '--gr-disabled-fg': '#6d8fa3',
    '--gr-disabled-brd': '#17475f',
    '--gr-invalid-brd': 'var(--gr-danger)',
    '--gr-invalid-ring': 'var(--gr-danger)',
    '--gr-invalid-text': 'var(--gr-danger-text)',

    // Тона.
    '--gr-primary': '#4fd1e0',
    '--gr-primary-fg': '#041e2b',
    '--gr-primary-text': '#7fdfea',
    '--gr-accent': '#0d3a52',
    '--gr-accent-fg': '#a5e4f2',
    '--gr-success': '#45d6a3',
    '--gr-success-light': '#06463a',
    '--gr-success-fg': '#041e2b',
    '--gr-success-text': '#7ee7c0',
    '--gr-warning': '#fbbf24',
    '--gr-warning-light': '#5a3608',
    '--gr-warning-fg': '#041e2b',
    '--gr-warning-text': '#fcd34d',
    '--gr-danger': '#fb8a8a',
    '--gr-danger-light': '#5f1a1a',
    '--gr-danger-fg': '#041e2b',
    '--gr-danger-text': '#fcb0b0',
    '--gr-info': '#7dd3fc',
    '--gr-info-light': '#0b3f5c',
    '--gr-info-fg': '#041e2b',
    '--gr-info-text': '#bae6fd',
    '--gr-slate': '#9db4c4',
    '--gr-slate-light': '#17364a',
    '--gr-slate-fg': '#041e2b',
    '--gr-slate-text': '#cbdae4',
    // Azure показывает второй путь: семья ролей выводится из одного цвета и
    // проверяется на контраст, вместо того чтобы подбирать четыре значения
    // руками. Роли `-solid*` при этом появляются сами — а раньше их тут не было
    // вовсе, и они молча приезжали от светлой темы.
    ...tone('azure', '#38bdf8', { base: oceanSurfaces }),

    // Графики.
    '--gr-chart-1': '#4fd1e0',
    '--gr-chart-2': '#45d6a3',
    '--gr-chart-3': '#fbbf24',
    '--gr-chart-4': '#7dd3fc',
    '--gr-chart-5': '#c4b5fd',

    // Сайдбар.
    '--gr-sidebar': '#072634',
    '--gr-sidebar-fg': '#e8f4fa',
    '--gr-sidebar-primary': '#4fd1e0',
    '--gr-sidebar-primary-fg': '#041e2b',
    '--gr-sidebar-accent': '#123f56',
    '--gr-sidebar-accent-fg': '#e8f4fa',
    '--gr-sidebar-brd': '#1c5470',
    '--gr-sidebar-ring': '#38bdf8',
  },

  // Кнопки красятся своим слоем: между темами он не наследуется.
  componentTokens: {
    '--gr-button-primary-bg': 'var(--gr-primary)',
    '--gr-button-primary-bg-hover': 'var(--gr-primary-hover)',
    '--gr-button-primary-bg-active': 'var(--gr-primary-active)',
    '--gr-button-primary-fg': 'var(--gr-primary-fg)',
    '--gr-button-success-bg': 'var(--gr-success)',
    '--gr-button-success-bg-hover': 'var(--gr-success-hover)',
    '--gr-button-success-bg-active': 'var(--gr-success-active)',
    '--gr-button-success-fg': 'var(--gr-success-fg)',
    '--gr-button-warning-bg': 'var(--gr-warning)',
    '--gr-button-warning-bg-hover': 'var(--gr-warning-hover)',
    '--gr-button-warning-bg-active': 'var(--gr-warning-active)',
    '--gr-button-warning-fg': 'var(--gr-warning-fg)',
  },
})

/**
 * Поверхности темы `contrast`: чистые полюса без полутонов. Из них же считается
 * весь остальной набор.
 */
const contrastSurfaces = {
  '--gr-bg': '#ffffff',
  '--gr-fg': '#000000',
  '--gr-card': '#ffffff',
}

/**
 * Тема `contrast` — высококонтрастная светлая, собранная **с нуля**.
 *
 * Разница с `ocean` не в цветах, а в договоре с пакетом. `ocean` берёт тёмную
 * тему за базу: не объявленная в ней роль приезжает из `dark`, и новая роль
 * пакета приедет туда же сама. `contrast` базы не имеет и обязана объявить все
 * роли сама — `createTheme` проверяет это на сборке и падает со списком, если
 * чего-то нет.
 *
 * Почему именно эта тема написана с нуля: у высококонтрастной темы нет ничего
 * общего с палитрой пакета. Любое унаследованное значение — приглушённый серый
 * из `light` — сломало бы её смысл, а увидел бы это не разработчик, а тот, кому
 * тема и нужна. Здесь честный размен: полный контроль ценой сопровождения.
 *
 * Тона подобраны под AAA (7:1) к белому: в этой теме AA — недостаточный порог.
 */
export const contrast = createTheme({
  name: 'contrast',
  tokens: {
    ...contrastSurfaces,
    '--gr-card-fg': '#000000',
    '--gr-popover': '#ffffff',
    '--gr-popover-fg': '#000000',
    // Приглушённых поверхностей в этой теме нет: «слегка серое» — первое, что
    // теряется при слабом зрении. Роль остаётся, но берёт различимый тон.
    '--gr-muted': '#f0f0f0',
    '--gr-muted-fg': '#2b2b2b',
    '--gr-secondary': '#e8e8e8',
    '--gr-secondary-fg': '#000000',
    '--gr-accent': '#e0eaff',
    '--gr-accent-fg': '#00227a',
    // Границы и фокус-кольцо: тонкая светлая линия здесь бесполезна.
    '--gr-brd': '#000000',
    '--gr-input': '#000000',
    '--gr-ring': '#0b3fd4',
    '--gr-overlay-bg': 'rgb(0 0 0 / 0.7)',

    // Состояния. Недоступный контрол гасится поверхностью и границей, а не
    // прозрачностью: `opacity` разбавляет выверенный контраст.
    '--gr-disabled-bg': '#ebebeb',
    '--gr-disabled-fg': '#595959',
    '--gr-disabled-brd': '#8f8f8f',
    '--gr-invalid-brd': 'var(--gr-danger)',
    '--gr-invalid-ring': 'var(--gr-danger)',
    '--gr-invalid-text': 'var(--gr-danger-text)',

    // Тона: семь вызовов дают 55 ролей из 90, каждая проверена на контраст.
    ...tone('primary', '#0b3fd4', { base: contrastSurfaces }),
    ...tone('success', '#00622e', { base: contrastSurfaces }),
    ...tone('warning', '#7a4200', { base: contrastSurfaces }),
    ...tone('danger', '#b3001b', { base: contrastSurfaces }),
    ...tone('info', '#0050b3', { base: contrastSurfaces }),
    ...tone('slate', '#3d4753', { base: contrastSurfaces }),
    ...tone('azure', '#005b8f', { base: contrastSurfaces }),

    // Графики: те же тона, чтобы легенда совпадала с остальным интерфейсом.
    '--gr-chart-1': '#0b3fd4',
    '--gr-chart-2': '#00622e',
    '--gr-chart-3': '#7a4200',
    '--gr-chart-4': '#b3001b',
    '--gr-chart-5': '#005b8f',

    // Сайдбар: инверсия — так его край виден без тени и полутонов.
    '--gr-sidebar': '#000000',
    '--gr-sidebar-fg': '#ffffff',
    '--gr-sidebar-primary': '#8ab4ff',
    '--gr-sidebar-primary-fg': '#000000',
    '--gr-sidebar-accent': '#2b2b2b',
    '--gr-sidebar-accent-fg': '#ffffff',
    '--gr-sidebar-brd': '#ffffff',
    '--gr-sidebar-ring': '#8ab4ff',

    // Тени — роль темы, а не общая константа: на разном фоне работает разная
    // плотность. Здесь они плотнее пакетных, потому что тема строится на
    // чистых полюсах, и мягкая полупрозрачная тень на белом попросту не видна.
    '--gr-shadow-1': '0 1px 2px rgba(0, 0, 0, 0.35)',
    '--gr-shadow-2': '0 8px 24px rgba(0, 0, 0, 0.45)',
    '--gr-shadow-3': '0 16px 48px rgba(0, 0, 0, 0.55)',
  },
})
