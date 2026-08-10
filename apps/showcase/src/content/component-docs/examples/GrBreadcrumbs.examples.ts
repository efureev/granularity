import type { ShowcaseComponentExampleDoc } from '../types'

export const grBreadcrumbsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'breadcrumbs-auto-collapse',
    title: 'Collapsing by available width',
    description: '`autoCollapse` считает по месту, а не по числу пунктов: путь становится однострочным и прячет середину ровно настолько, насколько не влезает.',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-auto-collapse',
  },
  {
    id: 'breadcrumbs-basic',
    title: 'Path to the current page',
    description: 'Базовый сценарий: путь от корня до текущей страницы. Последний пункт — не ссылка: он помечен `aria-current="page"`, и именно так скринридер отвечает на вопрос «где я сейчас».',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-basic',
  },
  {
    id: 'breadcrumbs-collapsed',
    title: 'Long path with a collapsed middle',
    description: '`max-items` сворачивает середину пути в «…», `items-before-collapse` и `items-after-collapse` решают, сколько уровней остаётся по краям. Клик по многоточию раскрывает путь на месте и переводит фокус на первый раскрытый пункт — кнопка исчезает вместе со схлопыванием.',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-collapsed',
  },
  {
    id: 'breadcrumbs-icons',
    title: 'Icons, custom separator and size',
    description: 'Иконка пункта задаётся классом в поле `icon` и остаётся декоративной, разделитель меняется пропом `separator`, размер — общей шкалой пакета или глобально через `GrConfigProvider`.',
    status: 'ready',
    previewKey: 'gr-breadcrumbs-icons',
  },
]
