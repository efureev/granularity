import type { ShowcaseComponentExampleDoc } from '../types'

export const grBottomNavExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'bottom-nav-custom-item',
    title: 'Custom item markup and the size scale',
    description: 'Слот `item` пускает в пункт что угодно — здесь аватар вместо иконки, — а `size` тянет высоту полосы, глиф и кегль подписи, не трогая тач-таргет.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-custom-item',
  },
  {
    id: 'bottom-nav-basic-flow',
    title: 'Basic section switcher',
    description: 'Базовый сценарий: иконки, счётчик на разделе и активный пункт, который отличается не только цветом.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-basic-flow',
  },
  {
    id: 'bottom-nav-external-state',
    title: 'External state sync',
    description: '`v-model` меняется и снаружи компонента — из кнопок страницы; недоступный раздел остаётся виден, но не кликается.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-external-state',
  },
  {
    id: 'bottom-nav-mobile-shell',
    title: 'Mobile shell composition',
    description: 'Пункты-ссылки внутри мобильного макета: правый клик и «открыть в новой вкладке» работают как везде. В приложении панель обычно `fixed` и скрыта на широких экранах.',
    status: 'ready',
    previewKey: 'gr-bottom-nav-mobile-shell',
  },
]
