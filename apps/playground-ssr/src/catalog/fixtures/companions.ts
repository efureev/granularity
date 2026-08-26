import { h } from 'vue'

import {
  GrChartArea,
  GrChartBar,
  GrChartBullet,
  GrChartFunnel,
  GrChartHeatmap,
  GrChartLine,
  GrChartPie,
  GrChartRadar,
  GrChartWaterfall,
  GrSparkline,
} from '@feugene/granularity-charts'
import {
  GrCalendar,
  GrDatePicker,
  GrDateRangePicker,
  GrDateTimePicker,
  GrDuration,
  GrRelativeTime,
  GrTimePicker,
} from '@feugene/granularity-chrono'
import {
  GrDashboard,
  GrDashboardItem,
  GrDashboardItemSettings,
  GrDashboardPalette,
  GrDashboardToolbar,
} from '@feugene/granularity-dashboard'
import { GrRichText } from '@feugene/granularity-editor'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import { jsonSchemaAdapter, type JsonSchemaDocument } from '@feugene/granularity-forms-schema/json-schema'
import { GrCameraCapture, GrCodeScanner, GrImageCrop, GrVideoPlayer } from '@feugene/granularity-media'

import type { ComponentFixture } from '../fixture'

/**
 * Момент, от которого считает всё датированное в фикстурах.
 *
 * Часы в фикстуре запрещены: без опоры сервер и клиент разошлись бы по вине
 * стенда, а не компонента. Проверка самого расхождения часов — не здесь, а на
 * `ChronoPage`, где оно вызывается намеренно и помечается точечно.
 */
const ANCHOR = new Date(2026, 7, 12, 10, 30)

/** Тот же момент как `PlainDate` пакета chrono: месяц там 0-based, как в `Date`. */
const ANCHOR_DAY = { y: 2026, m: 7, d: 12 }

export const chartsFixtures: ComponentFixture[] = [
  { name: 'GrChartArea', about: 'ResizeObserver: раскладка от объявленной ширины', render: () => h(GrChartArea, { series: [1, 4, 2, 6], width: 640, height: 220, ariaLabel: 'Площадь' }) },
  { name: 'GrChartBar', about: 'ResizeObserver: раскладка от объявленной ширины', render: () => h(GrChartBar, { series: [1, 4, 2, 6], width: 640, height: 220, ariaLabel: 'Столбцы' }) },
  { name: 'GrChartBullet', about: 'роль meter и геометрия без замера', render: () => h(GrChartBullet, { value: 72, target: 80, max: 100, label: 'Выполнение', height: 44 }) },
  { name: 'GrChartFunnel', about: 'доли считаются от данных, не от ширины', render: () => h(GrChartFunnel, { stages: [{ label: 'Визиты', value: 100 }, { label: 'Заявки', value: 40 }], height: 240, ariaLabel: 'Воронка' }) },
  { name: 'GrChartHeatmap', about: 'цвет через color-mix, id текстур из useId()', render: () => h(GrChartHeatmap, { values: [[10, 40], [70, 100]], xLabels: ['Пн', 'Вт'], yLabels: ['A', 'B'], domain: [0, 100], height: 240, ariaLabel: 'Тепловая карта' }) },
  { name: 'GrChartLine', about: 'ResizeObserver: раскладка от объявленной ширины', render: () => h(GrChartLine, { series: [1, 4, 2, 6], width: 640, height: 220, ariaLabel: 'Линия' }) },
  { name: 'GrChartPie', about: 'дуги считаются от данных', render: () => h(GrChartPie, { data: [{ label: 'A', value: 3 }, { label: 'B', value: 7 }], height: 240, ariaLabel: 'Доли' }) },
  { name: 'GrChartRadar', about: 'сетка и оси без замера контейнера', render: () => h(GrChartRadar, { series: [1, 4, 2, 6], height: 240, ariaLabel: 'Радар' }) },
  { name: 'GrChartWaterfall', about: 'накопления считаются от данных', render: () => h(GrChartWaterfall, { steps: [{ label: 'Старт', value: 100 }, { label: 'Отток', value: -30 }], height: 240, ariaLabel: 'Мост' }) },
  { name: 'GrSparkline', about: 'самый мелкий график: путь целиком с сервера', render: () => h(GrSparkline, { data: [1, 4, 2, 6], width: 120, height: 32, ariaLabel: 'Спарклайн' }) },
]

export const chronoFixtures: ComponentFixture[] = [
  { name: 'GrCalendar', about: 'сетка на 42 ячейки с сервера, показ — от `today`', render: () => h(GrCalendar, { today: ANCHOR_DAY, viewDate: ANCHOR_DAY, locale: 'en-US', ariaLabel: 'Календарь' }) },
  { name: 'GrDatePicker', about: 'поле с сервера, панель — лениво, после открытия', render: () => h(GrDatePicker, { modelValue: null, today: ANCHOR, locale: 'en-US' }) },
  { name: 'GrDateRangePicker', about: 'два поля с сервера, панель — лениво', render: () => h(GrDateRangePicker, { modelValue: null, today: ANCHOR, locale: 'en-US' }) },
  { name: 'GrDateTimePicker', about: 'поле с сервера, панель — лениво', render: () => h(GrDateTimePicker, { modelValue: null, today: ANCHOR, locale: 'en-US' }) },
  { name: 'GrDuration', about: 'формат длительности из локали, без часов', render: () => h(GrDuration, { value: 5_400_000, locale: 'en-US' }) },
  { name: 'GrRelativeTime', about: 'с `base` часы не читаются: разметка детерминирована', render: () => h(GrRelativeTime, { value: new Date(2026, 7, 12, 8, 0), base: ANCHOR, locale: 'en-US' }) },
  { name: 'GrTimePicker', about: 'поле с сервера, панель — лениво', render: () => h(GrTimePicker, { modelValue: null, today: ANCHOR, locale: 'en-US' }) },
]

export const dashboardFixtures: ComponentFixture[] = [
  {
    name: 'GrDashboard',
    about: 'ResizeObserver: раскладка от initialBreakpoint, а не от нулевой ширины',
    render: () => h(GrDashboard, { layout: { lg: [{ id: 'a', x: 0, y: 0, w: 6, h: 2 }] } }, {
      default: () => h(GrDashboardItem, { itemId: 'a', title: 'Виджет' }, { default: () => 'Тело виджета' }),
    }),
  },
  {
    name: 'GrDashboardItem',
    about: 'aria-labelledby на заголовок из useId()',
    render: () => h(GrDashboard, { layout: { lg: [{ id: 'a', x: 0, y: 0, w: 6, h: 2 }] } }, {
      default: () => h(GrDashboardItem, { itemId: 'a', title: 'Одинокий виджет' }, { default: () => 'Тело виджета' }),
    }),
  },
  { name: 'GrDashboardItemSettings', about: 'модальные настройки: закрыты на сервере', emptyOnServer: true, render: () => h(GrDashboardItemSettings, { modelValue: false, itemId: 'a', title: 'Настройки виджета' }) },
  { name: 'GrDashboardPalette', about: 'каталог с draggable: модель переноса пуста на сервере', render: () => h(GrDashboardPalette, { items: [{ id: 'sessions', title: 'Сессии' }], draggable: true }) },
  { name: 'GrDashboardToolbar', about: 'чистая разметка', render: () => h(GrDashboardToolbar, { mode: 'view' }) },
]

export const editorFixtures: ComponentFixture[] = [
  { name: 'GrRichText', about: 'ProseMirror требует DOM: с сервера приходит только оболочка и тулбар', render: () => h(GrRichText, { modelValue: '<p>Текст</p>' }) },
]

export const formsSchemaFixtures: ComponentFixture[] = [
  {
    name: 'GrSchemaForm',
    about: 'форма собирается из схемы на сервере, а не после гидрации',
    render: () => h(GrSchemaForm, {
      modelValue: { name: 'Ада' },
      schema: {
        type: 'object',
        properties: { name: { type: 'string', title: 'Имя' } },
      } satisfies JsonSchemaDocument,
      adapters: [jsonSchemaAdapter],
    }),
  },
]

export const mediaFixtures: ComponentFixture[] = [
  { name: 'GrCameraCapture', about: 'getUserMedia недоступен на сервере: с сервера приходит оболочка', render: () => h(GrCameraCapture, { autoStart: false }) },
  { name: 'GrCodeScanner', about: 'BarcodeDetector недоступен на сервере', render: () => h(GrCodeScanner, { autoStart: false }) },
  { name: 'GrImageCrop', about: 'canvas и Image недоступны на сервере', render: () => h(GrImageCrop, { src: null }) },
  { name: 'GrVideoPlayer', about: 'элемент video без обращения к его API в setup', render: () => h(GrVideoPlayer, { src: null }) },
]
