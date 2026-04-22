// Виртуальный слой UnoCSS, в котором собраны preflights от
// `presetGranularityNode` — токены тем и CSS примитивов `DsFormField`,
// `DsInput`, `DsButton`. Отдельный `@feugene/granularity/foundation.css` не
// нужен — preset сам поставляет foundation.
import 'virtual:uno:granular.css'

// Стили композитного компонента `XgQuickForm` (обёртка-layout из
// `@feugene/extra-granularity`). Пакет отмечен `sideEffects: ["**/*.css"]`,
// поэтому ничего другого отсюда не подтянется.
// import '@feugene/extra-granularity/components/XgQuickForm/styles.css'

export {}
