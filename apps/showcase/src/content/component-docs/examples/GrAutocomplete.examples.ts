import type { ShowcaseComponentExampleDoc } from '../types'

export const grAutocompleteExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'autocomplete-addons',
    title: 'Addons in the field',
    description: 'Слоты `prefix` и `suffix` кладут иконку и код стандарта прямо в поле — подпись рядом с контролом больше не нужна.',
    status: 'ready',
    previewKey: 'gr-autocomplete-addons',
  },
  {
    id: 'autocomplete-basic',
    title: 'Filterable single select',
    description: 'Базовый сценарий: текстовый `<input role="combobox">` фильтрует опции по мере ввода (локальная фильтрация), `clearable` очищает выбор. Стрелки/Enter/Home/End работают с клавиатуры, активная опция подсвечивается через `aria-activedescendant`.',
    status: 'ready',
    previewKey: 'gr-autocomplete-basic',    note: 'В отличие от GrSelect, combobox-ом здесь является сам инпут: набранный текст — это поисковый запрос, а выбор опции заполняет поле.',
  },
  {
    id: 'autocomplete-multiple',
    title: 'Multiple with removable chips',
    description: 'Режим `multiple` рендерит выбранные значения как удаляемые chips перед инпутом. Backspace при пустом запросе удаляет последний тег, а `allow-custom-value` позволяет добавить значение, которого нет в списке (Enter).',
    status: 'ready',
    previewKey: 'gr-autocomplete-multiple',    note: 'Это ключевое отличие от GrSelect multiple, который показывает выбор строкой «a, b, c»: здесь каждый выбор — самостоятельный интерактивный chip.',
  },
  {
    id: 'autocomplete-async',
    title: 'Async remote loading',
    description: 'Удалённый поиск ведёт сам компонент: `fetch-options` дебаунсится, предыдущий запрос отменяется через `AbortSignal`, а ответ на устаревший запрос игнорируется — при быстром вводе в списке всегда результат последнего запроса. Локальную фильтрацию и `loading` в этом режиме компонент берёт на себя, `min-query-length` откладывает запрос до нужной длины.',
    status: 'ready',
    previewKey: 'gr-autocomplete-async',    note: 'Если запрос ведёт само приложение (свой стор, кэш, своя отмена), остаётся прежний путь — дебаунснутое событие `search` плюс внешние `:options` и `:loading`.',
  },
  {
    id: 'autocomplete-virtual',
    title: 'Справочник на 10 000 позиций',
    description: 'С `virtual` в DOM живёт только окно вокруг вьюпорта: панель одинаково отзывчива и на десяти опциях, и на десяти тысячах. Высоту окна задаёт `dropdownMaxHeight`.',
    status: 'ready',
    previewKey: 'gr-autocomplete-virtual',    note: 'Размер набора уходит в `aria-setsize`/`aria-posinset`: при неполном наборе диктор иначе объявлял бы «1 из 12» на списке в десять тысяч. Строка «Add …» при `allowCustomValue` — такой же элемент набора и прокручивается вместе с ним.',
  },
]
