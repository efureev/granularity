import type { ShowcaseComponentExampleDoc } from '../types'

export const grInputExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'input-inline-addon',
    title: 'Icon inside the field',
    description: '`addon="inline"` рисует `#prefix`/`#suffix` внутри рамки: без разделителя и без собственной ширины. Режим по умолчанию — `segment`: отдельный отсек, выровненный по ступени размера, каким его знают денежные поля.',
    status: 'ready',
    previewKey: 'gr-input-inline-addon',
  },
  {
    id: 'input-events-and-loading',
    title: 'События поля и фоновая проверка',
    description: '`@change` по blur/Enter, отдельный `@clear` для очистки кнопкой, `loading` под асинхронную проверку и `focus()`/`select()` через ref.',
    status: 'ready',
    previewKey: 'gr-input-events-and-loading',
  },
  {
    id: 'input-validation-states',
    title: 'Validation states and native input types',
    description: 'Одна карточка показывает сразу базовый текстовый сценарий, email-валидацию и search-mode, чтобы было видно native-поведение без потери design-system оболочки.',
    status: 'ready',
    previewKey: 'gr-input-validation-states',
  },
  {
    id: 'input-addons-basic',
    title: 'Prefix and suffix add-ons',
    description: 'Статичные add-on-слоты (валюта, единицы измерения) внутри поля — общий layout поля при этом не меняется.',
    status: 'ready',
    previewKey: 'gr-input-addons-basic',
  },
  {
    id: 'input-addon-slots-fit',
    title: 'Add-on slots: fixed (clip) vs stretch',
    description: 'Длинный контент в prefix/suffix больше не вылезает за рамки: в fixed-режиме аддон держит ширину и обрезает контент (prefix — справа, suffix — слева), в stretch — растягивается под контент. Два поля слева реактивно управляют содержимым аддонов.',
    status: 'ready',
    previewKey: 'gr-input-addon-slots',
  },
  {
    id: 'input-enhancements',
    title: 'Clearable, password toggle, counter and readonly',
    description: 'Встроенные удобства поля: кнопка очистки (`clearable`), переключатель видимости пароля (`passwordToggle`), счётчик символов с `maxlength` (`showCount`) и `readonly`-состояние. Метки кнопок локализованы.',
    status: 'ready',
    previewKey: 'gr-input-enhancements',
  },
  {
    id: 'input-size-and-alignment',
    title: 'Size scale and text alignment',
    description: 'Показываем, что `GrInput` умеет жить и в компактных toolbars, и в крупных form-layout, а выравнивание текста настраивается отдельно от размера.',
    status: 'ready',
    previewKey: 'gr-input-size-and-alignment',
  },
]
