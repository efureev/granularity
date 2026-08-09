import type { ShowcaseComponentExampleDoc } from '../types'

export const grNumberInputExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'number-input-controls',
    title: 'Vertical and horizontal controls',
    description: 'Показываем базовый capability-scenario числового поля: инкремент/декремент, prefix/suffix slots и разную ориентацию controls.',
    status: 'ready',
    previewKey: 'gr-number-input-controls',  },
  {
    id: 'number-input-decimal-separator',
    title: 'Decimal separator, precision and range guards',
    description: 'Этот сценарий показывает локализованный ввод с запятой и одновременную работу `min`/`max`/`step`/`precision`.',
    status: 'ready',
    previewKey: 'gr-number-input-decimal-separator',  },
  {
    id: 'number-input-alignment-addons',
    title: 'Text alignment with long add-ons',
    description: 'Карточка подчёркивает ещё один важный сценарий: числовое поле в финансовых формах с правым выравниванием и длинными suffix-элементами.',
    status: 'ready',
    previewKey: 'gr-number-input-alignment-addons',  },
  {
    id: 'number-input-grouping',
    title: 'Locale-aware thousands grouping',
    description: 'С `useGrouping` поле показывает сгруппированное значение (тысячные разделители через `Intl.NumberFormat`) в состоянии blur и сырое — при фокусе для редактирования. Групповой разделитель берётся из `locale`, а десятичный уважает `decimalSeparator`.',
    status: 'ready',
    previewKey: 'gr-number-input-grouping',  },
]
