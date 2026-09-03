import type { GrComponentSize } from '../shared/sizes'

export type GrTreeSize = GrComponentSize

/**
 * Размер дерева выражен переменными, а не утилитарными классами: те же
 * `--gr-tree-*` уже объявлены точками кастомизации в `GrTree.vue`, и size
 * обязан задавать им дефолты, а не спорить с ними отдельным каналом.
 *
 * `font-size` на `md` намеренно `inherit`: дерево по умолчанию набирается
 * кеглем родителя, и подстановка конкретных пикселей сменила бы вид всем,
 * кто ничего не просил.
 */
export type GrTreeSizeVars = {
  '--gr-tree-row-min-height': string
  '--gr-tree-row-px': string
  '--gr-tree-row-py': string
  '--gr-tree-toggle-size': string
  '--gr-tree-drag-handle-size': string
  '--gr-tree-icon-size': string
  '--gr-tree-content-gap': string
  '--gr-tree-font-size': string
}

export const treeSizeVars: Record<GrTreeSize, GrTreeSizeVars> = {
  xs: {
    '--gr-tree-row-min-height': '22px',
    '--gr-tree-row-px': '4px',
    '--gr-tree-row-py': '2px',
    '--gr-tree-toggle-size': '18px',
    '--gr-tree-drag-handle-size': '18px',
    '--gr-tree-icon-size': '12px',
    '--gr-tree-content-gap': '4px',
    '--gr-tree-font-size': '12px',
  },
  sm: {
    '--gr-tree-row-min-height': '24px',
    '--gr-tree-row-px': '6px',
    '--gr-tree-row-py': '3px',
    '--gr-tree-toggle-size': '20px',
    '--gr-tree-drag-handle-size': '20px',
    '--gr-tree-icon-size': '14px',
    '--gr-tree-content-gap': '6px',
    '--gr-tree-font-size': '13px',
  },
  md: {
    '--gr-tree-row-min-height': '28px',
    '--gr-tree-row-px': '8px',
    '--gr-tree-row-py': '4px',
    '--gr-tree-toggle-size': '24px',
    '--gr-tree-drag-handle-size': '24px',
    '--gr-tree-icon-size': '16px',
    '--gr-tree-content-gap': '8px',
    '--gr-tree-font-size': 'inherit',
  },
  lg: {
    '--gr-tree-row-min-height': '32px',
    '--gr-tree-row-px': '10px',
    '--gr-tree-row-py': '6px',
    '--gr-tree-toggle-size': '28px',
    '--gr-tree-drag-handle-size': '28px',
    '--gr-tree-icon-size': '20px',
    '--gr-tree-content-gap': '10px',
    '--gr-tree-font-size': '15px',
  },
}

/**
 * Готовые виды дерева — наборы значений тех же `--gr-tree-*`, что задаёт
 * `size`. Не проп: второй канал спорил бы с размером за одни переменные, а
 * набор с ним композируется — потребитель раскладывает его в `style` и при
 * необходимости переопределяет по одной строке.
 *
 * Шрифт и значки в набор не входят: семейства у дерева своего токена нет, а
 * значки — это `expandIcon`/`collapseIcon` и слот строки, то есть решение
 * потребителя, а не вида.
 */
export type GrTreeView = 'explorer' | 'rail' | 'outline' | 'picker'

export const grTreeViewVars: Record<GrTreeView, Record<string, string>> = {
  /**
   * Плотный проводник: максимум узлов на экран, колена связей вместо простых
   * вертикалей. Под мышь — 24px меньше минимальной цели касания.
   */
  explorer: {
    '--gr-tree-row-min-height': '24px',
    '--gr-tree-row-py': '2px',
    '--gr-tree-row-radius': '4px',
    '--gr-tree-children-pl': '6px',
    '--gr-tree-branch-line-offset': '8px',
    '--gr-tree-branch-elbow-width': '10px',
    '--gr-tree-content-gap': '6px',
    /* Волосяная нейтральная линия вместо акцентной по умолчанию: на шести
       уровнях акцент превращается в частокол и спорит со значками папок,
       которые в этом виде и несут акцент. */
    '--gr-tree-branch-line-width': '1px',
    '--gr-tree-branch-line-default-color': 'var(--gr-brd)',
    /* Кегль входит в набор, хотя семейство — нет: 24px строки при базовом
       кегле недостижимы, высоту держит текст, а не `min-height`. */
    '--gr-tree-font-size': '12.5px',
    '--gr-tree-toggle-size': '16px',
    '--gr-tree-icon-size': '14px',
    /* Ветвистость здесь читается значком папки и шевроном, поэтому вес подписи
       свободен: жирные ветки в плотном моноширинном списке дают полосатость. */
    '--gr-tree-branch-font-weight': '400',
    '--gr-tree-row-current-color': 'var(--gr-primary-text)',
  },
  /**
   * Навигация: выбранная строка — сплошная плашка, скруглённая только справа.
   * Плоский левый край — не украшение: плашка начинается от отступа уровня, и
   * скругление с той стороны читалось бы как отдельная кнопка, оторванная от
   * рельса. Текст перекрашивается своим токеном, иначе на насыщенной подложке
   * он остался бы нечитаемым.
   */
  rail: {
    '--gr-tree-row-min-height': '30px',
    /* Высоту держит `min-height`, а поля лишь не дают строке распереть её:
       при базовом кегле строчный бокс уже 24px, и пять пикселей сверху и снизу
       увели бы строку на 34 — рельс перестал бы быть рельсом. */
    '--gr-tree-row-py': '3px',
    '--gr-tree-row-radius': '0 999px 999px 0',
    '--gr-tree-row-current-bg': 'var(--gr-primary)',
    '--gr-tree-row-current-hover-bg': 'var(--gr-primary-hover, var(--gr-primary))',
    '--gr-tree-row-current-color': 'var(--gr-primary-fg)',
    /* Рельс — нейтральная шина уровня, а не подсветка: цвет по умолчанию
       выведен из подложки выбора и на ней же дублировался бы акцентом. */
    '--gr-tree-branch-line-default-color': 'var(--gr-brd)',
  },

  /**
   * Отбор: дерево, по которому не ходят, а которое размечают. Строка просторнее
   * остальных видов, потому что цель нажатия здесь — квадрат отметки, а не
   * подпись: 38px и увеличенный квадрат делают её достижимой и пальцем.
   *
   * Сам по себе вид отметок не включает — это ортогональная ось (`showCheckbox`),
   * и она же работает в любом другом виде. Набор задаёт только плотность под неё.
   */
  picker: {
    '--gr-tree-row-min-height': '38px',
    '--gr-tree-row-py': '7px',
    '--gr-tree-row-px': '6px',
    '--gr-tree-row-pr': '10px',
    '--gr-tree-row-radius': '9px',
    '--gr-tree-content-gap': '9px',
    '--gr-tree-indent-step': '22px',
    '--gr-tree-checkbox-size': '17px',
    '--gr-tree-checkbox-radius': '5px',
    '--gr-tree-checkbox-mr': '9px',
    /* Квадрат крупнее обычного, и волосяная граница на нём теряется: при 17px
       она перестаёт читаться как рамка и выглядит серым контуром заливки. */
    '--gr-tree-checkbox-brd-width': '1.5px',
  },

  /**
   * Оглавление: иерархию несёт набор, а не хром. Направляющие и подложки
   * гасятся, выбор отмечается полосой у края списка, цветом и весом — вид
   * рассчитан на то, чтобы стоять рядом с читаемым текстом и не спорить с ним.
   *
   * Ступени кегля по уровням задаются `rowClass`: это единственное, чего набор
   * значений сделать не может — уровень строки знает только разметка.
   */
  outline: {
    '--gr-tree-row-min-height': '26px',
    '--gr-tree-row-py': '3px',
    '--gr-tree-row-px': '6px',
    '--gr-tree-row-radius': '6px',
    '--gr-tree-row-hover-bg': 'transparent',
    '--gr-tree-row-current-bg': 'transparent',
    '--gr-tree-row-current-hover-bg': 'transparent',
    '--gr-tree-row-current-color': 'var(--gr-primary-text)',
    '--gr-tree-row-current-bar-width': '2px',
    '--gr-tree-children-pl': '4px',
    '--gr-tree-branch-line-offset': '6px',
    /* Вес здесь означает уровень, а не ветвистость: без этого лист первого
       уровня выглядел бы младше ветки третьего. */
    '--gr-tree-branch-font-weight': 'inherit',
  },
}
