<!-- СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются. -->

# Токены дизайн-системы

Реестр — `tokens/*.json` пакета: какие токены есть и что значат. Значения — в
данных темы, `themes/<slug>/`. Из них генерируются TS-справочник
`@feugene/granularity-tokens`, данные тем в `dist/themes/` и этот документ.

Темы: `blueprint` (Чертёж), `clay` (Глина), `slate` (Сланец), `tactile` (Тактильная).

## Примитивы

Не зависят от режима: тема задаёт их в `root.json`.

### Foundations: neutral palette

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-slate-0` | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` | Нейтральный оттенок slate 0 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-50` | `#f8fafc` | `#f8fafc` | `#f8fafc` | `#f8fafc` | Нейтральный оттенок slate 50 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-100` | `#f1f5f9` | `#f1f5f9` | `#f1f5f9` | `#f1f5f9` | Нейтральный оттенок slate 100 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-200` | `#e2e8f0` | `#e2e8f0` | `#e2e8f0` | `#e2e8f0` | Нейтральный оттенок slate 200 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-300` | `#cbd5e1` | `#cbd5e1` | `#cbd5e1` | `#cbd5e1` | Нейтральный оттенок slate 300 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-400` | `#94a3b8` | `#94a3b8` | `#94a3b8` | `#94a3b8` | Нейтральный оттенок slate 400 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-500` | `#64748b` | `#64748b` | `#64748b` | `#64748b` | Нейтральный оттенок slate 500 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-600` | `#475569` | `#475569` | `#475569` | `#475569` | Нейтральный оттенок slate 600 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-700` | `#334155` | `#334155` | `#334155` | `#334155` | Нейтральный оттенок slate 700 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-800` | `#1e293b` | `#1e293b` | `#1e293b` | `#1e293b` | Нейтральный оттенок slate 800 для базовой palette scale, поверхностей и бордеров. |
| `--gr-slate-900` | `#0f172a` | `#0f172a` | `#0f172a` | `#0f172a` | Нейтральный оттенок slate 900 для базовой palette scale, поверхностей и бордеров. |

### Typography: font families

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-font-ui` | `Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif` | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | `Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif` | `Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif` | Основной стек шрифта для интерфейсного текста и большинства компонентных подписей. |
| `--gr-font-display` | `var(--gr-font-ui)` | `Georgia, 'Times New Roman', Times, serif` | `var(--gr-font-ui)` | `var(--gr-font-ui)` | Стек шрифта заголовков компонентов: заголовок карточки, окна, шторки и пустого состояния. Тема без своей гарнитуры заголовков ставит сюда `var(--gr-font-ui)`. |
| `--gr-font-mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace` | Моноширинный стек для кода, числовых значений и технических подписей. |

### Typography: font sizes

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-text-2xs` | `10px` | `10px` | `10px` | `10px` | Размер шрифта `2xs` из типографической шкалы foundation tokens: подписи и служебные строки, которые не должны конкурировать с основным текстом. |
| `--gr-text-xs` | `12px` | `12px` | `12px` | `12px` | Размер шрифта `xs` из типографической шкалы foundation tokens. |
| `--gr-text-sm` | `14px` | `14px` | `14px` | `14px` | Размер шрифта `sm` из типографической шкалы foundation tokens. |
| `--gr-text-base` | `16px` | `16px` | `16px` | `16px` | Размер шрифта `base` из типографической шкалы foundation tokens. |
| `--gr-text-lg` | `18px` | `18px` | `18px` | `18px` | Размер шрифта `lg` из типографической шкалы foundation tokens. |
| `--gr-text-xl` | `20px` | `20px` | `20px` | `20px` | Размер шрифта `xl` из типографической шкалы foundation tokens. |
| `--gr-text-2xl` | `24px` | `24px` | `24px` | `24px` | Размер шрифта `2xl` из типографической шкалы foundation tokens. |
| `--gr-text-3xl` | `30px` | `30px` | `30px` | `30px` | Размер шрифта `3xl` из типографической шкалы foundation tokens. |
| `--gr-text-4xl` | `36px` | `36px` | `36px` | `36px` | Размер шрифта `4xl` из типографической шкалы foundation tokens. |

### Typography: control scale

Шкала кеглей компонентов, живущих на `GrComponentSize` — контролов и всего,
что стоит с ними в один ряд. Отдельная от контентной типографики по двум
причинам. Первая: ступеней 13px и 11px там нет и быть не должно — это
компромиссы плотности контрола, а не ступени текста. Вторая: шкала намеренно
плотнее четырёх ступеней размера — каждый компонент выбирает из неё свои
четыре. Основная лестница `xs…lg` (12/13/14/16) — у `GrInput`, `GrSelect`,
`GrTextarea`, `GrTreeSelect`, `GrAutocomplete`, `GrNumberInput`, `GrInputTag`,
`GrTable`, `GrLink`, `GrPopover`; на ступень мельче (`3xs…md`, 10/11/12/14)
работают `GrTooltip`, `GrDataTable`, `GrBadge`, `GrRating`, `GrFormFile`.
Совпадение значений с `--gr-text-*` не делает шкалы одной: плотность контролов
меняется отдельно от кегля контентного текста.

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-control-text-3xs` | `10px` | `10px` | `10px` | `10px` | Кегль компонента на самой мелкой ступени — подпись колонки таблицы, служебная ссылка в списке файлов. |
| `--gr-control-text-2xs` | `11px` | `11px` | `11px` | `11px` | Кегль компонента на ступени между `3xs` и `xs`: мелкий бейдж, компактная подсказка, заголовок группы в палитре команд. |
| `--gr-control-text-xs` | `12px` | `12px` | `12px` | `12px` | Кегль компонента на ступени `xs`. |
| `--gr-control-text-sm` | `13px` | `13px` | `13px` | `13px` | Кегль компонента на ступени `sm`. |
| `--gr-control-text-md` | `14px` | `14px` | `14px` | `14px` | Кегль компонента на ступени `md` — значение по умолчанию. |
| `--gr-control-text-lg` | `16px` | `16px` | `16px` | `16px` | Кегль компонента на ступени `lg`. |

### Typography: line heights

Две разные вещи под одним префиксом, и различает их суффикс.
Ступени (`xs`/`sm`/`base`) — абсолютные значения, парные одноимённым ступеням
`--gr-text-*`: утилита `text-sm` в uno задавала кегль и межстрочный разом, и
кегль, переведённый на токен в одиночку, отдал бы интервал на откуп `body`
приложения. Коэффициенты (`tight`/`normal`/`relaxed`) — безразмерные, для
текстовых блоков, где интервал задаётся отношением к кеглю, а не числом.
Контрольные ступени (`--gr-control-leading-*`) — такая же пара, но к шкале
контролов: без них интервал наследовался от `body` приложения абсолютным
значением, и подпись кеглем 10px получала межстрочный 24px, то есть 2.4.
Ступени заводятся по мере употребления: шкала без употребления — мёртвый груз.

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-leading-2xs` | `0.875rem` | `0.875rem` | `0.875rem` | `0.875rem` | Межстрочный интервал ступени `2xs` — идёт в паре с `--gr-text-2xs`. |
| `--gr-leading-xs` | `1rem` | `1rem` | `1rem` | `1rem` | Межстрочный интервал ступени `xs` — идёт в паре с `--gr-text-xs`. |
| `--gr-leading-sm` | `1.25rem` | `1.25rem` | `1.25rem` | `1.25rem` | Межстрочный интервал ступени `sm` — идёт в паре с `--gr-text-sm`. |
| `--gr-leading-base` | `1.5rem` | `1.5rem` | `1.5rem` | `1.5rem` | Межстрочный интервал ступени `base` — идёт в паре с `--gr-text-base`. |
| `--gr-leading-lg` | `1.625rem` | `1.625rem` | `1.625rem` | `1.625rem` | Межстрочный интервал ступени `lg` — идёт в паре с `--gr-text-lg`. |
| `--gr-leading-xl` | `1.75rem` | `1.75rem` | `1.75rem` | `1.75rem` | Межстрочный интервал ступени `xl` — идёт в паре с `--gr-text-xl`. |
| `--gr-leading-3xl` | `2.25rem` | `2.25rem` | `2.25rem` | `2.25rem` | Межстрочный интервал ступени `3xl` — идёт в паре с `--gr-text-3xl`. |
| `--gr-control-leading-3xs` | `14px` | `14px` | `14px` | `14px` | Межстрочный интервал ступени `3xs` — идёт в паре с `--gr-control-text-3xs`. |
| `--gr-control-leading-2xs` | `16px` | `16px` | `16px` | `16px` | Межстрочный интервал ступени `2xs` — идёт в паре с `--gr-control-text-2xs`. |
| `--gr-control-leading-xs` | `16px` | `16px` | `16px` | `16px` | Межстрочный интервал ступени `xs` — идёт в паре с `--gr-control-text-xs`. |
| `--gr-control-leading-sm` | `18px` | `18px` | `18px` | `18px` | Межстрочный интервал ступени `sm` — идёт в паре с `--gr-control-text-sm`. |
| `--gr-control-leading-md` | `20px` | `20px` | `20px` | `20px` | Межстрочный интервал ступени `md` — идёт в паре с `--gr-control-text-md`. |
| `--gr-control-leading-lg` | `24px` | `24px` | `24px` | `24px` | Межстрочный интервал ступени `lg` — идёт в паре с `--gr-control-text-lg`. |
| `--gr-leading-tight` | `1.25` | `1.25` | `1.25` | `1.25` | Коэффициент межстрочного интервала `tight` для текстовых блоков и подписей. |
| `--gr-leading-normal` | `1.5` | `1.5` | `1.5` | `1.5` | Коэффициент межстрочного интервала `normal` для текстовых блоков и подписей. |
| `--gr-leading-relaxed` | `1.625` | `1.625` | `1.625` | `1.625` | Коэффициент межстрочного интервала `relaxed` для текстовых блоков и подписей. |

### Typography: font weights

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-font-regular` | `400` | `400` | `400` | `400` | Вес шрифта `regular` для типографической иерархии интерфейса. |
| `--gr-font-medium` | `500` | `500` | `500` | `500` | Вес шрифта `medium` для типографической иерархии интерфейса. |
| `--gr-font-semibold` | `600` | `600` | `600` | `600` | Вес шрифта `semibold` для типографической иерархии интерфейса. |
| `--gr-font-bold` | `700` | `700` | `700` | `700` | Вес шрифта `bold` для типографической иерархии интерфейса. |

### Layout: spacing scale

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-space-0` | `0px` | `0px` | `0px` | `0px` | Шаг spacing scale `0` для отступов, gap и внутренних paddings. |
| `--gr-space-1` | `4px` | `4px` | `4px` | `4px` | Шаг spacing scale `1` для отступов, gap и внутренних paddings. |
| `--gr-space-2` | `8px` | `8px` | `8px` | `8px` | Шаг spacing scale `2` для отступов, gap и внутренних paddings. |
| `--gr-space-3` | `12px` | `12px` | `12px` | `12px` | Шаг spacing scale `3` для отступов, gap и внутренних paddings. |
| `--gr-space-4` | `16px` | `16px` | `16px` | `16px` | Шаг spacing scale `4` для отступов, gap и внутренних paddings. |
| `--gr-space-5` | `20px` | `20px` | `20px` | `20px` | Шаг spacing scale `5` для отступов, gap и внутренних paddings. |
| `--gr-space-6` | `24px` | `24px` | `24px` | `24px` | Шаг spacing scale `6` для отступов, gap и внутренних paddings. |
| `--gr-space-8` | `32px` | `32px` | `32px` | `32px` | Шаг spacing scale `8` для отступов, gap и внутренних paddings. |
| `--gr-space-10` | `40px` | `40px` | `40px` | `40px` | Шаг spacing scale `10` для отступов, gap и внутренних paddings. |
| `--gr-space-12` | `48px` | `48px` | `48px` | `48px` | Шаг spacing scale `12` для отступов, gap и внутренних paddings. |
| `--gr-space-16` | `64px` | `64px` | `64px` | `64px` | Шаг spacing scale `16` для отступов, gap и внутренних paddings. |
| `--gr-space-20` | `80px` | `80px` | `80px` | `80px` | Шаг spacing scale `20` для отступов, gap и внутренних paddings. |
| `--gr-space-24` | `96px` | `96px` | `96px` | `96px` | Шаг spacing scale `24` для отступов, gap и внутренних paddings. |
| `--gr-space-32` | `128px` | `128px` | `128px` | `128px` | Шаг spacing scale `32` для отступов, gap и внутренних paddings. |
| `--gr-space-40` | `160px` | `160px` | `160px` | `160px` | Шаг spacing scale `40` для отступов, gap и внутренних paddings. |
| `--gr-space-48` | `192px` | `192px` | `192px` | `192px` | Шаг spacing scale `48` для отступов, gap и внутренних paddings. |
| `--gr-space-64` | `256px` | `256px` | `256px` | `256px` | Шаг spacing scale `64` для отступов, gap и внутренних paddings. |

### Layout: containers

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-container-max` | `1280px` | `1280px` | `1280px` | `1280px` | Максимальная ширина layout-контейнера для контентных страниц и shell-структур. |
| `--gr-container-max-2xl` | `1440px` | `1440px` | `1440px` | `1440px` | Максимальная ширина layout-контейнера для контентных страниц и shell-структур. |
| `--gr-container-padding-mobile` | `16px` | `16px` | `16px` | `16px` | Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария. |
| `--gr-container-padding-tablet` | `24px` | `24px` | `24px` | `24px` | Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария. |
| `--gr-container-padding-desktop` | `32px` | `32px` | `32px` | `32px` | Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария. |

### Layout: breakpoints

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-bp-sm` | `640px` | `640px` | `640px` | `640px` | Foundation breakpoint `sm` для адаптивных layout-решений. |
| `--gr-bp-md` | `768px` | `768px` | `768px` | `768px` | Foundation breakpoint `md` для адаптивных layout-решений. |
| `--gr-bp-lg` | `1024px` | `1024px` | `1024px` | `1024px` | Foundation breakpoint `lg` для адаптивных layout-решений. |
| `--gr-bp-xl` | `1280px` | `1280px` | `1280px` | `1280px` | Foundation breakpoint `xl` для адаптивных layout-решений. |
| `--gr-bp-2xl` | `1536px` | `1536px` | `1536px` | `1536px` | Foundation breakpoint `2xl` для адаптивных layout-решений. |

### Iconography: icon sizes

Шкала размеров иконки (`GrIcon`). Значения совпадают со шкалой контролов
(`xs…lg`) и живут токенами, а не литералами в компоненте: иконка обязана
масштабироваться вместе с темой, а не вместе с пересборкой пакета.
Произвольный размер задаётся числом прямо на компоненте — это escape-hatch,
а не часть шкалы.

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-icon-size-xs` | `14px` | `14px` | `14px` | `14px` | Размер иконки `xs` — рядом с текстом `xs`/`sm`. |
| `--gr-icon-size-sm` | `16px` | `16px` | `16px` | `16px` | Размер иконки `sm` — в компактных кнопках и строках списка. |
| `--gr-icon-size-md` | `18px` | `18px` | `18px` | `18px` | Размер иконки `md` — значение по умолчанию. |
| `--gr-icon-size-lg` | `20px` | `20px` | `20px` | `20px` | Размер иконки `lg` — в крупных кнопках и заголовках. |

### Shapes: radii and compatibility aliases

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--radius` | `0.5rem` | `0.5rem` | `0.5rem` | `0.5rem` | Совместимый alias базового радиуса для интеграций, ожидающих shadcn-style token contract. |
| `--gr-radius-none` | `0px` | `0px` | `0px` | `0px` | Радиус скругления `none` для углов компонентов и поверхностей. |
| `--gr-radius-xs` | `3px` | `3px` | `3px` | `3px` | Радиус скругления `xs` — микроэлементы: подсветка совпадения в поиске, кнопка очистки внутри контрола. |
| `--gr-radius-sm` | `4px` | `4px` | `4px` | `4px` | Радиус скругления `sm` для углов компонентов и поверхностей. |
| `--gr-radius-control` | `6px` | `8px` | `6px` | `6px` | Радиус контрола и мелкой интерактивной детали внутри него: оболочка поля, чип, кнопка-крестик, фокус-кольцо ссылки, тултип слайдера. |
| `--gr-radius-control-xs` | `var(--gr-radius-control)` | `6px` | `var(--gr-radius-control)` | `var(--gr-radius-control)` | Скругление поля-коробки на ступени `xs`: `GrInput`, `GrSelect`, `GrTextarea` и остальные поля. Тема без лестницы ставит `var(--gr-radius-control)`. |
| `--gr-radius-control-sm` | `var(--gr-radius-control)` | `8px` | `var(--gr-radius-control)` | `var(--gr-radius-control)` | Скругление поля-коробки на ступени `sm`: `GrInput`, `GrSelect`, `GrTextarea` и остальные поля. Тема без лестницы ставит `var(--gr-radius-control)`. |
| `--gr-radius-control-md` | `var(--gr-radius-control)` | `8px` | `var(--gr-radius-control)` | `var(--gr-radius-control)` | Скругление поля-коробки на ступени `md`: `GrInput`, `GrSelect`, `GrTextarea` и остальные поля. Тема без лестницы ставит `var(--gr-radius-control)`. |
| `--gr-radius-control-lg` | `var(--gr-radius-control)` | `10px` | `var(--gr-radius-control)` | `var(--gr-radius-control)` | Скругление поля-коробки на ступени `lg`: `GrInput`, `GrSelect`, `GrTextarea` и остальные поля. Тема без лестницы ставит `var(--gr-radius-control)`. |
| `--gr-input-focus-ring-width` | `2px` | `1px` | `2px` | `2px` | Толщина кольца фокуса вокруг поля ввода и выбора. Цвет — `--gr-ring`, у ошибки — `--gr-invalid-ring`. |
| `--gr-radius-md` | `8px` | `8px` | `8px` | `8px` | Радиус скругления `md` для углов компонентов и поверхностей. |
| `--gr-radius-lg` | `12px` | `12px` | `12px` | `12px` | Радиус скругления `lg` для углов компонентов и поверхностей. |
| `--gr-radius-xl` | `16px` | `16px` | `16px` | `16px` | Радиус скругления `xl` для углов компонентов и поверхностей. |
| `--gr-radius-overlay` | `var(--gr-radius-xl)` | `12px` | `var(--gr-radius-xl)` | `var(--gr-radius-xl)` | Скругление всплывающей панели у поля: список `GrSelect`, `GrTreeSelect`, `GrAutocomplete`, панель `GrPopover`. Окно и палитра команд скругляются своими токенами. |
| `--gr-radius-full` | `9999px` | `9999px` | `9999px` | `9999px` | Радиус скругления `full` для углов компонентов и поверхностей. |

### Elevation

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-shadow-0` | `none` | `none` | `none` | `none` | Уровень elevation `0` для карточек, popover-слоёв и акцентных поверхностей. |

### Motion

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-duration-fast` | `150ms` | `150ms` | `150ms` | `150ms` | Базовая длительность анимации `fast` для transitions и state changes. |
| `--gr-duration-base` | `200ms` | `200ms` | `200ms` | `200ms` | Базовая длительность анимации `base` для transitions и state changes. |
| `--gr-duration-slow` | `300ms` | `300ms` | `300ms` | `300ms` | Базовая длительность анимации `slow` для transitions и state changes. |
| `--gr-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `cubic-bezier(0.16, 1, 0.3, 1)` | `cubic-bezier(0.16, 1, 0.3, 1)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Кривая ускорения `out` для motion-паттернов дизайн-системы. |
| `--gr-ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | `cubic-bezier(0.7, 0, 0.84, 0)` | `cubic-bezier(0.7, 0, 0.84, 0)` | `cubic-bezier(0.7, 0, 0.84, 0)` | Кривая ускорения `in` для motion-паттернов дизайн-системы. |

### Layering: z-index scale

Единый источник истины для слоёв всех компонентов, использующих `position: fixed`
поверх остального контента. Правило: чем выше в UI-стеке слой обязан оказаться,
тем больше значение. Floating-панели (dropdown/select/tree-select/tooltip) стоят
ниже модалок, чтобы поповер, открытый ВНУТРИ модалки, не потерялся под ней, но
сам этот поповер не обязан перекрывать модалку снаружи — за пределы своего дерева
floating-компоненты не выходят по построению (v-click-outside/portal рядом с триггером).
Тосты — единственный слой, который обязан быть виден поверх абсолютно всего,
включая открытые модалки (это уведомление уровня приложения).

| Токен | blueprint | clay | slate | tactile | Назначение |
| --- | --- | --- | --- | --- | --- |
| `--gr-z-bottom-nav` | `850` | `850` | `850` | `850` | Нижняя навигация приложения. Самый низкий слой шкалы: панель прижата к нижней кромке и обязана уходить под открытую выпадашку, тултип и модалку. |
| `--gr-z-navbar` | `900` | `900` | `900` | `900` | Прилипшая шапка приложения. Ниже якорных панелей: шапка перекрывает контент, но не выпадашки, тултипы и модалки. |
| `--gr-z-dropdown` | `1000` | `1000` | `1000` | `1000` | Слой якорных floating-панелей: dropdown, select, tree-select. |
| `--gr-z-tooltip` | `1050` | `1050` | `1050` | `1050` | Слой тултипов — выше floating-панелей, ниже модалок. |
| `--gr-z-modal` | `1100` | `1100` | `1100` | `1100` | Слой модальных окон и диалогов. |
| `--gr-z-loading` | `1150` | `1150` | `1150` | `1150` | Слой полноэкранного оверлея загрузки: выше модалок, потому что блокирует всё приложение целиком, но ниже тостов. |
| `--gr-z-toast` | `1200` | `1200` | `1200` | `1200` | Слой тостов — единственный, обязанный быть виден поверх всего, включая открытые модалки. |

## Роли по режимам

Своё значение в каждом режиме темы: колонка — пара `<тема>-<режим>`.
Значения выверены по контрасту — см. примечания.

Две вещи про этот раздел, которые не видно по самим таблицам.

**Роль с парой `-fg` автоматически считается тоном.** `validateTheme` выводит
список тонов из данных — «роль, у которой есть `-fg`», — а не из записанного списка,
чтобы новый тон попадал под проверки контраста сам. Побочный эффект: такие роли
потребляются кодом, который нигде не пишет их имя буквально, и поиском по
исходникам они не находятся.

**Каждая объявленная здесь роль обязательна для каждого режима.** `defineTheme`
и `createMode` падают с перечнем недостающих, если тема не задала хотя бы одну.
Поэтому роль из этого раздела нельзя удалить как «неиспользуемую», даже если
её не читает ни один компонент: это ломающее изменение для всех, кто собрал
свою тему.

### Surface roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-bg` | `#f8fafc` | `#0f172a` | `#faf9f5` | `#262624` | `#f8fafc` | `#0f172a` | `#f8fafc` | `#0f172a` | Базовый фон приложения и крупных layout-поверхностей текущей темы. |
| `--gr-fg` | `#0f172a` | `#f8fafc` | `#141413` | `#faf9f5` | `#0f172a` | `#f8fafc` | `#0f172a` | `#f8fafc` | Основной цвет текста и иконок поверх базового фона текущей темы. |
| `--gr-card` | `#ffffff` | `#1e293b` | `#ffffff` | `#30302e` | `#ffffff` | `#1e293b` | `#ffffff` | `#1e293b` | Фон карточек, панелей и других поднятых поверхностей. |
| `--gr-card-fg` | `#0f172a` | `#f8fafc` | `#141413` | `#faf9f5` | `#0f172a` | `#f8fafc` | `#0f172a` | `#f8fafc` | Цвет контента внутри карточек и raised surface-блоков. |
| `--gr-popover` | `#ffffff` | `#1e293b` | `#ffffff` | `#30302e` | `#ffffff` | `#1e293b` | `#ffffff` | `#1e293b` | Фон popover-, dropdown- и overlay-поверхностей. |
| `--gr-popover-fg` | `#0f172a` | `#f8fafc` | `#141413` | `#faf9f5` | `#0f172a` | `#f8fafc` | `#0f172a` | `#f8fafc` | Цвет текста и иконок внутри popover-слоёв. |
| `--gr-muted` | `#f1f5f9` | `#334155` | `#f0eee6` | `#3a3a37` | `#f1f5f9` | `#334155` | `#f1f5f9` | `#334155` | Приглушённая поверхность для вторичных блоков, плашек и заполнений. |
| `--gr-muted-fg` | `#556275` | `#aab6c7` | `#5e5d59` | `#b0aea5` | `#556275` | `#aab6c7` | `#556275` | `#aab6c7` | Вторичный текстовый цвет для helper-копии и менее важных подписей. |
| `--gr-secondary` | `#e2e8f0` | `#334155` | `#e8e6dc` | `#3a3a37` | `#e2e8f0` | `#334155` | `#e2e8f0` | `#334155` | Нейтральная secondary action/surface-подложка без сильного бренд-акцента. |
| `--gr-secondary-fg` | `#1e293b` | `#f1f5f9` | `#3d3d3a` | `#d1cfc5` | `#1e293b` | `#f1f5f9` | `#1e293b` | `#f1f5f9` | Контрастный текст для secondary-кнопок и поверхностей. |
| `--gr-overlay-bg` | `rgb(15 23 42 / 0.45)` | `rgb(2 6 23 / 0.65)` | `rgb(28 27 24 / 0.45)` | `rgb(10 10 9 / 0.6)` | `rgb(15 23 42 / 0.45)` | `rgb(2 6 23 / 0.65)` | `rgb(15 23 42 / 0.45)` | `rgb(2 6 23 / 0.65)` | Подложка модальных слоёв (модалка, drawer): затемняет страницу, оставляя её узнаваемой. |
| `--gr-brd` | `#e2e8f0` | `#334155` | `#d9d8d5` | `#42423f` | `#e2e8f0` | `#334155` | `#e2e8f0` | `#334155` | Базовый цвет бордеров и разделителей текущей темы. |
| `--gr-brd-strong` | `var(--gr-brd)` | `var(--gr-brd)` | `#b8b7b4` | `#5f5e5a` | `var(--gr-brd)` | `var(--gr-brd)` | `var(--gr-brd)` | `var(--gr-brd)` | Граница плотнее разделителя: пунктир и точки `GrDivider`, черта невыбранной вкладки под указателем. Тема ставит её и в токены компонентов — рамку `outline`-сообщения, разделитель пути. Тема без второй ступени границы ставит сюда `--gr-brd`. |
| `--gr-input` | `#e2e8f0` | `#334155` | `#82817e` | `#878681` | `#e2e8f0` | `#334155` | `#e2e8f0` | `#334155` | Рамка поля ввода в покое — у `GrInput`, `GrTextarea`, `GrNumberInput`, `GrInputTag`, `GrAutocomplete`, `GrOtpInput` и триггеров `GrSelect`, `GrTreeSelect`, `GrColorPicker`. Тема, у которой рамка поля темнее разделителя, разводит её с `--gr-brd`. |
| `--gr-input-hover` | `var(--gr-input)` | `var(--gr-input)` | `#565553` | `#afaea8` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | Рамка поля ввода под указателем. Тема без отклика рамки ставит сюда `--gr-input`. |
| `--gr-input-focus-brd` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-ring)` | `var(--gr-ring)` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | Рамка поля в фокусе, вместе с кольцом `--gr-ring`. Тема без своего решения ставит `--gr-input`: рамка в фокусе не меняется. |
| `--gr-input-readonly-bg` | `var(--gr-bg)` | `var(--gr-bg)` | `transparent` | `transparent` | `var(--gr-bg)` | `var(--gr-bg)` | `var(--gr-bg)` | `var(--gr-bg)` | Подложка поля только для чтения. Тема, у которой такое поле читается текстом на поверхности, ставит `transparent`; без своего решения — `--gr-bg`, как у рабочего поля. |
| `--gr-input-readonly-brd` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-brd)` | `var(--gr-brd)` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | `var(--gr-input)` | Рамка поля только для чтения. Без своего решения — `--gr-input`, как у рабочего поля. |
| `--gr-control-brd` | `#64748b` | `#94a3b8` | `#82817e` | `#878681` | `#64748b` | `#94a3b8` | `#64748b` | `#94a3b8` | Граница переключаемого контрола в покое — коробки чекбокса, кружка радио, дорожки выключенного переключателя. Держит 3:1 к странице, карточке и `--gr-muted` (WCAG 1.4.11): у такого контрола граница — единственное, по чему его видно. |
| `--gr-control-brd-hover` | `var(--gr-control-brd)` | `var(--gr-control-brd)` | `#565553` | `#afaea8` | `var(--gr-control-brd)` | `var(--gr-control-brd)` | `var(--gr-control-brd)` | `var(--gr-control-brd)` | Граница переключаемого контрола под указателем: коробка отметки, кружок радио. Тема без отклика ставит сюда `--gr-control-brd`. |
| `--gr-ring` | `#6366f1` | `#818cf8` | `#2a78d6` | `#6aa3e8` | `#6366f1` | `#818cf8` | `#6366f1` | `#818cf8` | Цвет focus-ring и акцентного outline для интерактивных компонентов. |

> **`--gr-muted-fg` (slate-light).** Вторичный текст обязан проходить AA на САМОМ ТЁМНОМ из фонов, на которых он появляется, а это не страница, а `--gr-secondary` (#e2e8f0). Прежний #64748b держался только на `--gr-bg` (4.55) и `--gr-card` (4.76), но проваливался на `--gr-muted` (4.34) и `--gr-secondary` (3.86) — то есть ровно там, где вторичный текст и живёт: чипы, таблицы, подписи в панелях. #556275 даёт минимум 5.02 по всем четырём фонам.

> **`--gr-muted-fg` (slate-dark).** Симметрично light: минимум по фону `--gr-muted`/`--gr-secondary` (#334155). Прежний #94a3b8 давал там 4.04, #aab6c7 даёт 5.04.

### State roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-disabled-bg` | `#f1f5f9` | `#273548` | `#f0eee6` | `#353532` | `#f1f5f9` | `#273548` | `#f1f5f9` | `#273548` | Фон недоступного контрола: гасит его поверхностью, а не прозрачностью — `opacity` разбавляет выверенные на AA токены текста. |
| `--gr-disabled-fg` | `#94a3b8` | `#64748b` | `#9c9a92` | `#73726c` | `#94a3b8` | `#64748b` | `#94a3b8` | `#64748b` | Цвет текста и иконок недоступного контрола. |
| `--gr-disabled-brd` | `#e2e8f0` | `#334155` | `var(--gr-disabled-bg)` | `var(--gr-disabled-bg)` | `#e2e8f0` | `#334155` | `#e2e8f0` | `#334155` | Цвет рамки недоступного контрола. |
| `--gr-invalid-brd` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | Цвет рамки контрола, не прошедшего валидацию. |
| `--gr-invalid-ring` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | `var(--gr-danger)` | Цвет focus-ring контрола, не прошедшего валидацию. |
| `--gr-invalid-text` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | `var(--gr-danger-text)` | Цвет текста ошибки и метки обязательного поля. |

> **`--gr-invalid-brd` (slate-light).** Ошибка валидации и декоративный тон `state="danger"` — разные вещи, хотя выглядят одинаково по умолчанию. Ссылка, а не копия hex: тема, поменявшая только `--gr-danger`, не обязана помнить про второй набор, а тема, которой нужен отдельный цвет ошибки, перекрашивает три роли и не трогает danger-тон.

> **`--gr-invalid-brd` (slate-dark).** Ошибка валидации и декоративный тон `state="danger"` — разные вещи, хотя выглядят одинаково по умолчанию. Ссылка, а не копия hex: тема, поменявшая только `--gr-danger`, не обязана помнить про второй набор, а тема, которой нужен отдельный цвет ошибки, перекрашивает три роли и не трогает danger-тон.

### Action roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-primary` | `#4f46e5` | `#9d8bfa` | `#d97757` | `#d97757` | `#4f46e5` | `#9d8bfa` | `#4f46e5` | `#9d8bfa` | Главный brand/action цвет темы для primary CTA и ключевых акцентов. |
| `--gr-primary-fg` | `#ffffff` | `#0f172a` | `#141413` | `#141413` | `#ffffff` | `#0f172a` | `#ffffff` | `#0f172a` | Контрастный текст и иконки поверх primary-заливки. |
| `--gr-accent` | `#eef2ff` | `#1e1b4b` | `#f6e8e0` | `#46352d` | `#eef2ff` | `#1e1b4b` | `#eef2ff` | `#1e1b4b` | Мягкая акцентная поверхность для selected/hovered областей и подсветок. |
| `--gr-accent-fg` | `#3730a3` | `#c7d2fe` | `#973f22` | `#e6a37f` | `#3730a3` | `#c7d2fe` | `#3730a3` | `#c7d2fe` | Цвет текста поверх accent-подложек. |
| `--gr-selected` | `var(--gr-primary)` | `var(--gr-primary)` | `var(--gr-fg)` | `var(--gr-fg)` | `var(--gr-primary)` | `var(--gr-primary)` | `var(--gr-primary)` | `var(--gr-primary)` | Цвет выбранного: заливка и рамка отметки и радио, дорожка включённого переключателя, черта вкладки, заливка слайдера, текущая страница пагинации, кольцо выбранного цвета; подмесом — подсветка выбранной строки и узла дерева. Тема, где выбор — бренд, ставит сюда `--gr-primary`. |
| `--gr-selected-fg` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | `var(--gr-bg)` | `var(--gr-bg)` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | Знак на заливке `--gr-selected`: галочка отметки, точка радио, номер текущей страницы. |
| `--gr-selected-hover` | `var(--gr-selected)` | `var(--gr-selected)` | `#3d3d3a` | `#d1cfc5` | `var(--gr-selected)` | `var(--gr-selected)` | `var(--gr-selected)` | `var(--gr-selected)` | Выбранное под указателем: заливка отмеченной коробки и выбранного радио. Тема без отклика ставит сюда `--gr-selected`. |

> **`--gr-primary` (slate-dark).** Primary был единственным тоном, выпадавшим из конвенции тёмной темы (светлая заливка + тёмный текст, как у success/warning/danger/info/azure): оставался светло-тёмным индиго #6366f1 с белым текстом и проваливал сразу все три роли — текст на фоне 4.00, текст на карточке 3.27, белый на заливке 4.47. Светлый индиго с тёмным `-fg` даёт 6.38 / 5.23 / 6.38. Не indigo-400 (#818cf8): в ту сторону лежит `--gr-info`, и увести primary туда значило бы вернуть слияние двух тонов, ради разведения которого info и перекрашен в синий. Кнопок не касается: GrButton задаёт свой `--gr-button-primary-bg`.

### Status roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-success` | `#10b981` | `#34d399` | `#788c5d` | `#8a9e6d` | `#10b981` | `#34d399` | `#10b981` | `#34d399` | Основной semantic success-цвет для статусов, бейджей и уведомлений. |
| `--gr-success-light` | `#d1fae5` | `#194536` | `#e9ebe1` | `#35382e` | `#d1fae5` | `#194536` | `#d1fae5` | `#194536` | Облегчённая success-подложка для мягких статусов и подсветок. |
| `--gr-success-fg` | `#0f172a` | `#0f172a` | `#141413` | `#141413` | `#0f172a` | `#0f172a` | `#0f172a` | `#0f172a` | Контрастный текст и иконки поверх success-заливки. |
| `--gr-primary-text` | `#3730a3` | `#c7d2fe` | `#973f22` | `#e6a37f` | `#3730a3` | `#c7d2fe` | `#3730a3` | `#c7d2fe` | Основной тон как ЦВЕТ ТЕКСТА на фоне страницы: насыщенный `--gr-primary` под текст не рассчитан и не проходит по контрасту. |
| `--gr-success-text` | `#065f46` | `#6ee7b7` | `#4f5e3b` | `#b2c09a` | `#065f46` | `#6ee7b7` | `#065f46` | `#6ee7b7` | Текстовый оттенок для success-сообщений на светлой подложке. |
| `--gr-warning` | `#f97316` | `#fb923c` | `#c9a82d` | `#c9a82d` | `#f97316` | `#fb923c` | `#f97316` | `#fb923c` | Основной semantic warning-цвет для предупреждений и промежуточных статусов. |
| `--gr-warning-light` | `#ffedd5` | `#672e1c` | `#f4eedb` | `#433d26` | `#ffedd5` | `#672e1c` | `#ffedd5` | `#672e1c` | Облегчённая warning-подложка для мягких warning-состояний. |
| `--gr-warning-fg` | `#0f172a` | `#0f172a` | `#141413` | `#141413` | `#0f172a` | `#0f172a` | `#0f172a` | `#0f172a` | Контрастный текст и иконки поверх warning-заливки. |
| `--gr-warning-text` | `#7c2d12` | `#fdba74` | `#6f5a14` | `#dcc067` | `#7c2d12` | `#fdba74` | `#7c2d12` | `#fdba74` | Текстовый оттенок для warning-сообщений на мягкой warning-подложке. |
| `--gr-danger` | `#dc2626` | `#f87171` | `#b8433a` | `#e3585a` | `#dc2626` | `#f87171` | `#dc2626` | `#f87171` | Semantic danger-цвет для ошибок, рисков и критических сообщений. |
| `--gr-danger-light` | `#fee2e2` | `#6a2522` | `#f1e1dd` | `#482f2e` | `#fee2e2` | `#6a2522` | `#fee2e2` | `#6a2522` | Облегчённая danger-подложка для мягких error-состояний. |
| `--gr-danger-fg` | `#ffffff` | `#0f172a` | `#faf9f5` | `#141413` | `#ffffff` | `#0f172a` | `#ffffff` | `#0f172a` | Контрастный текст и иконки поверх danger-заливки. |
| `--gr-danger-text` | `#991b1b` | `#fca5a5` | `#963630` | `#f5a097` | `#991b1b` | `#fca5a5` | `#991b1b` | `#fca5a5` | Текстовый оттенок для error-сообщений на мягкой danger-подложке. |
| `--gr-info` | `#2563eb` | `#60a5fa` | `#2268bf` | `#6aa3e8` | `#2563eb` | `#60a5fa` | `#2563eb` | `#60a5fa` | Semantic info-цвет для нейтральных уведомлений и информационных акцентов. |
| `--gr-info-light` | `#dbeafe` | `#213771` | `#dfe8f1` | `#323c47` | `#dbeafe` | `#213771` | `#dbeafe` | `#213771` | Облегчённая info-подложка для спокойных информационных блоков. |
| `--gr-info-fg` | `#ffffff` | `#0f172a` | `#faf9f5` | `#141413` | `#ffffff` | `#0f172a` | `#ffffff` | `#0f172a` | Контрастный текст и иконки поверх info-заливки. |
| `--gr-info-text` | `#1e40af` | `#bfdbfe` | `#1c57a0` | `#a1c1ec` | `#1e40af` | `#bfdbfe` | `#1e40af` | `#bfdbfe` | Текстовый оттенок для спокойных info-сообщений и подсказок. |
| `--gr-slate` | `#475569` | `#94a3b8` | `#4d4c48` | `#9c9a92` | `#475569` | `#94a3b8` | `#475569` | `#94a3b8` | Нейтральный semantic slate-цвет для subdued индикаторов и secondary статусов. |
| `--gr-slate-light` | `#e2e8f0` | `#313b4a` | `#e4e3df` | `#3b3b38` | `#e2e8f0` | `#313b4a` | `#e2e8f0` | `#313b4a` | Облегчённая slate-подложка для мягких нейтральных состояний. |
| `--gr-slate-fg` | `#ffffff` | `#0f172a` | `#faf9f5` | `#141413` | `#ffffff` | `#0f172a` | `#ffffff` | `#0f172a` | Контрастный текст и иконки поверх slate-заливки. |
| `--gr-slate-text` | `#334155` | `#cbd5e1` | `#4d4c48` | `#c2c0b6` | `#334155` | `#cbd5e1` | `#334155` | `#cbd5e1` | Текстовый оттенок для нейтральных slate-сообщений и плашек. |
| `--gr-azure` | `#0077b6` | `#38bdf8` | `#5b9fb6` | `#5b9fb6` | `#0077b6` | `#38bdf8` | `#0077b6` | `#38bdf8` | Semantic azure-цвет для информационных акцентов и вспомогательных статусов. |
| `--gr-azure-light` | `#e0f2fe` | `#1b425c` | `#e5eded` | `#303c3e` | `#e0f2fe` | `#1b425c` | `#e0f2fe` | `#1b425c` | Облегчённая azure-подложка для мягких informational поверхностей. |
| `--gr-azure-fg` | `#ffffff` | `#0f172a` | `#141413` | `#141413` | `#ffffff` | `#0f172a` | `#ffffff` | `#0f172a` | Контрастный текст и иконки поверх azure-заливки. |
| `--gr-azure-text` | `#075985` | `#bae6fd` | `#2e6270` | `#a3cbd8` | `#075985` | `#bae6fd` | `#075985` | `#bae6fd` | Текстовый оттенок для azure-плашек и спокойных informational блоков. |

> **`--gr-success` (slate-light).** `-fg` — цвет текста НА сплошной заливке тоном. У светлых заливок он обязан быть тёмным: белый на `--gr-success` даёт 2.54:1, на `--gr-warning` 2.80:1 при пороге AA 4.5 — а это solid-кнопки и бейджи (`grButtonStyles.ts`, `grBadgeStyles.ts`). С `--gr-fg` получаем 7.04 и 6.37, и hover/active, которые уводят заливку в тёмную сторону, остаются выше порога (5.30 / 4.79). В тёмной теме эти токены уже тёмные — там заливки светлее фона.

> **`--gr-info` (slate-light).** Синий, а не индиго. Прежний `#5850ec` отличался от `--gr-primary` на ΔE 4.3 при пороге заметности около 2.3, а текстовые роли обоих тонов совпадали значением полностью — ссылка `tone="info"` и ссылка `tone="primary"` красились одинаково. Тон занял собственный участок палитры: он отличим и от `primary` (ΔE 21 в светлой теме, 29 в тёмной), и от `azure` (48 и 22). Замысел был такой и раньше — тёмная тема уже отказывалась брать indigo-400 именно потому, что solid-бейджи primary и info стали бы неотличимы.

> **`--gr-azure` (slate-light).** Azure — единственный тон, который не чинится сменой `-fg`. Тёмный текст проходит на базе (6.44), но hover/active уводят заливку вниз и ломают его (4.36 / 3.01); белый же не проходит на базе (2.77). Выход один — сама заливка: sky-500 `#0ea5e9` слишком светлая для белого текста. `#0077b6` — самое светлое значение, дающее запас по всем трём состояниям (4.87 / 5.44 / 6.02) и заодно поднимающее azure-иконку на `-light` подложке с 2.42 до 4.24. Оттенок остаётся отличимым от `--gr-info`.

### Solid fill roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-primary-solid` | `var(--gr-primary)` | `#595ce6` | `var(--gr-primary)` | `var(--gr-primary)` | `var(--gr-primary)` | `#595ce6` | `var(--gr-primary)` | `#595ce6` | Сплошная заливка кнопочного веса тона `primary`. |
| `--gr-primary-solid-hover` | `var(--gr-primary-hover)` | `#5053dd` | `var(--gr-primary-hover)` | `var(--gr-primary-hover)` | `var(--gr-primary-hover)` | `#5053dd` | `var(--gr-primary-hover)` | `#5053dd` | Заливка `--gr-primary-solid` под курсором. |
| `--gr-primary-solid-active` | `var(--gr-primary-active)` | `#474acf` | `var(--gr-primary-active)` | `var(--gr-primary-active)` | `var(--gr-primary-active)` | `#474acf` | `var(--gr-primary-active)` | `#474acf` | Заливка `--gr-primary-solid` в момент нажатия. |
| `--gr-primary-solid-fg` | `var(--gr-primary-fg)` | `var(--gr-slate-0)` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | `var(--gr-primary-fg)` | `var(--gr-slate-0)` | `var(--gr-primary-fg)` | `var(--gr-slate-0)` | Текст и иконки на заливке `--gr-primary-solid`. |
| `--gr-success-solid` | `#047857` | `#047857` | `var(--gr-success)` | `#8a9e6d` | `#047857` | `#047857` | `#047857` | `#047857` | Сплошная заливка кнопочного веса тона `success`. |
| `--gr-success-solid-hover` | `#036c4d` | `#036c4d` | `var(--gr-success-hover)` | `#97aa7a` | `#036c4d` | `#036c4d` | `#036c4d` | `#036c4d` | Заливка `--gr-success-solid` под курсором. |
| `--gr-success-solid-active` | `#025f44` | `#025f44` | `var(--gr-success-active)` | `#a3b587` | `#025f44` | `#025f44` | `#025f44` | `#025f44` | Заливка `--gr-success-solid` в момент нажатия. |
| `--gr-success-solid-fg` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-success-fg)` | `var(--gr-success-fg)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-success-solid`. |
| `--gr-warning-solid` | `#c2410c` | `#c2410c` | `var(--gr-warning)` | `var(--gr-warning)` | `#c2410c` | `#c2410c` | `#c2410c` | `#c2410c` | Сплошная заливка кнопочного веса тона `warning`. |
| `--gr-warning-solid-hover` | `#b53b0a` | `#b53b0a` | `var(--gr-warning-hover)` | `var(--gr-warning-hover)` | `#b53b0a` | `#b53b0a` | `#b53b0a` | `#b53b0a` | Заливка `--gr-warning-solid` под курсором. |
| `--gr-warning-solid-active` | `#9f3307` | `#9f3307` | `var(--gr-warning-active)` | `var(--gr-warning-active)` | `#9f3307` | `#9f3307` | `#9f3307` | `#9f3307` | Заливка `--gr-warning-solid` в момент нажатия. |
| `--gr-warning-solid-fg` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-warning-fg)` | `var(--gr-warning-fg)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-warning-solid`. |
| `--gr-danger-solid` | `var(--gr-danger)` | `#b91c1c` | `var(--gr-danger)` | `#b8433a` | `var(--gr-danger)` | `#b91c1c` | `var(--gr-danger)` | `#b91c1c` | Сплошная заливка кнопочного веса тона `danger`. |
| `--gr-danger-solid-hover` | `var(--gr-danger-hover)` | `#a91919` | `var(--gr-danger-hover)` | `#a93c34` | `var(--gr-danger-hover)` | `#a91919` | `var(--gr-danger-hover)` | `#a91919` | Заливка `--gr-danger-solid` под курсором. |
| `--gr-danger-solid-active` | `var(--gr-danger-active)` | `#931515` | `var(--gr-danger-active)` | `#99352e` | `var(--gr-danger-active)` | `#931515` | `var(--gr-danger-active)` | `#931515` | Заливка `--gr-danger-solid` в момент нажатия. |
| `--gr-danger-solid-fg` | `var(--gr-danger-fg)` | `var(--gr-slate-50)` | `var(--gr-danger-fg)` | `#faf9f5` | `var(--gr-danger-fg)` | `var(--gr-slate-50)` | `var(--gr-danger-fg)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-danger-solid`. |
| `--gr-info-solid` | `var(--gr-info)` | `#1d4ed8` | `var(--gr-info)` | `#2268bf` | `var(--gr-info)` | `#1d4ed8` | `var(--gr-info)` | `#1d4ed8` | Сплошная заливка кнопочного веса тона `info`. |
| `--gr-info-solid-hover` | `var(--gr-info-hover)` | `#1e40af` | `var(--gr-info-hover)` | `#1f5fae` | `var(--gr-info-hover)` | `#1e40af` | `var(--gr-info-hover)` | `#1e40af` | Заливка `--gr-info-solid` под курсором. |
| `--gr-info-solid-active` | `var(--gr-info-active)` | `#1e3a8a` | `var(--gr-info-active)` | `#1b559c` | `var(--gr-info-active)` | `#1e3a8a` | `var(--gr-info-active)` | `#1e3a8a` | Заливка `--gr-info-solid` в момент нажатия. |
| `--gr-info-solid-fg` | `var(--gr-info-fg)` | `var(--gr-slate-50)` | `var(--gr-info-fg)` | `#faf9f5` | `var(--gr-info-fg)` | `var(--gr-slate-50)` | `var(--gr-info-fg)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-info-solid`. |
| `--gr-slate-solid` | `var(--gr-slate)` | `var(--gr-slate-600)` | `var(--gr-slate)` | `#5e5d59` | `var(--gr-slate)` | `var(--gr-slate-600)` | `var(--gr-slate)` | `var(--gr-slate-600)` | Сплошная заливка кнопочного веса тона `slate`. |
| `--gr-slate-solid-hover` | `var(--gr-slate-hover)` | `var(--gr-slate-700)` | `var(--gr-slate-hover)` | `color-mix(in srgb, var(--gr-slate-solid) 88%, var(--gr-bg))` | `var(--gr-slate-hover)` | `var(--gr-slate-700)` | `var(--gr-slate-hover)` | `var(--gr-slate-700)` | Заливка `--gr-slate-solid` под курсором. |
| `--gr-slate-solid-active` | `var(--gr-slate-active)` | `var(--gr-slate-800)` | `var(--gr-slate-active)` | `color-mix(in srgb, var(--gr-slate-solid) 80%, var(--gr-bg))` | `var(--gr-slate-active)` | `var(--gr-slate-800)` | `var(--gr-slate-active)` | `var(--gr-slate-800)` | Заливка `--gr-slate-solid` в момент нажатия. |
| `--gr-slate-solid-fg` | `var(--gr-slate-fg)` | `var(--gr-slate-50)` | `var(--gr-slate-fg)` | `#faf9f5` | `var(--gr-slate-fg)` | `var(--gr-slate-50)` | `var(--gr-slate-fg)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-slate-solid`. |
| `--gr-azure-solid` | `#0369a1` | `#0369a1` | `var(--gr-azure)` | `var(--gr-azure)` | `#0369a1` | `#0369a1` | `#0369a1` | `#0369a1` | Сплошная заливка кнопочного веса тона `azure`. |
| `--gr-azure-solid-hover` | `#075985` | `#075985` | `var(--gr-azure-hover)` | `var(--gr-azure-hover)` | `#075985` | `#075985` | `#075985` | `#075985` | Заливка `--gr-azure-solid` под курсором. |
| `--gr-azure-solid-active` | `#0c4a6e` | `#0c4a6e` | `var(--gr-azure-active)` | `var(--gr-azure-active)` | `#0c4a6e` | `#0c4a6e` | `#0c4a6e` | `#0c4a6e` | Заливка `--gr-azure-solid` в момент нажатия. |
| `--gr-azure-solid-fg` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-azure-fg)` | `var(--gr-azure-fg)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | `var(--gr-slate-0)` | `var(--gr-slate-50)` | Текст и иконки на заливке `--gr-azure-solid`. |

### Data visualization roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-chart-1` | `#4f46e5` | `#6366f1` | `#c05b36` | `#e0895f` | `#4f46e5` | `#6366f1` | `#4f46e5` | `#6366f1` | Первый цвет серии для графиков и data-visualization элементов. |
| `--gr-chart-2` | `#059669` | `#34d399` | `#5f7a1c` | `#9dbb6a` | `#059669` | `#34d399` | `#059669` | `#34d399` | Второй цвет серии для графиков и data-visualization элементов. |
| `--gr-chart-3` | `#ea580c` | `#fb923c` | `#2f68b8` | `#6fa2e2` | `#ea580c` | `#fb923c` | `#ea580c` | `#fb923c` | Третий цвет серии для графиков и data-visualization элементов. |
| `--gr-chart-4` | `#0284c7` | `#38bdf8` | `#a8407a` | `#d684b4` | `#0284c7` | `#38bdf8` | `#0284c7` | `#38bdf8` | Четвёртый цвет серии для графиков и data-visualization элементов. |
| `--gr-chart-5` | `#db2777` | `#f472b6` | `#0d7d8c` | `#4fb8ac` | `#db2777` | `#f472b6` | `#db2777` | `#f472b6` | Пятый цвет серии для графиков и data-visualization элементов. |

### Navigation roles

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-sidebar` | `#ffffff` | `#1e293b` | `#f0eee6` | `#1f1e1d` | `#ffffff` | `#1e293b` | `#ffffff` | `#1e293b` | Фон sidebar/navigation rail области текущей темы. |
| `--gr-sidebar-fg` | `#0f172a` | `#f8fafc` | `#141413` | `#faf9f5` | `#0f172a` | `#f8fafc` | `#0f172a` | `#f8fafc` | Основной текст и иконки внутри sidebar. |
| `--gr-sidebar-primary` | `#4f46e5` | `#6365f0` | `#141413` | `#faf9f5` | `#4f46e5` | `#6365f0` | `#4f46e5` | `#6365f0` | Акцентный цвет активных/ключевых элементов внутри sidebar. |
| `--gr-sidebar-primary-fg` | `#ffffff` | `#ffffff` | `#faf9f5` | `#141413` | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` | Контрастный текст поверх sidebar primary-акцентов. |
| `--gr-sidebar-accent` | `#f1f5f9` | `#334155` | `#dad8d0` | `#3c3b39` | `#f1f5f9` | `#334155` | `#f1f5f9` | `#334155` | Мягкий accent-фон для hover/selected состояний в sidebar. |
| `--gr-sidebar-accent-fg` | `#1e293b` | `#f1f5f9` | `#141413` | `#faf9f5` | `#1e293b` | `#f1f5f9` | `#1e293b` | `#f1f5f9` | Цвет текста поверх sidebar accent-подложек. |
| `--gr-sidebar-brd` | `#e2e8f0` | `#334155` | `#d1cfc8` | `#3c3b39` | `#e2e8f0` | `#334155` | `#e2e8f0` | `#334155` | Бордеры и разделители sidebar-области. |
| `--gr-sidebar-ring` | `#6366f1` | `#818cf8` | `#2a78d6` | `#6aa3e8` | `#6366f1` | `#818cf8` | `#6366f1` | `#818cf8` | Focus-ring для интерактивных элементов внутри sidebar. |

> **`--gr-sidebar-primary` (slate-dark).** Белый текст на #6366f1 даёт 4.47:1 — тот же недолёт AA, из-за которого перекрашен `--gr-primary` (заметка выше). Здесь взят минимальный шаг, снимающий недолёт без смены вида: 4.52:1 при ΔE 0.42 к прежнему цвету.

### Elevation

| Токен | blueprint-light | blueprint-dark | clay-light | clay-dark | slate-light | slate-dark | tactile-light | tactile-dark | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-shadow-1` | `0 1px 2px rgba(15, 23, 42, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.45)` | `0 1px 2px rgba(28, 27, 24, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.45)` | `0 1px 2px rgba(15, 23, 42, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.45)` | `0 1px 2px rgba(15, 23, 42, 0.08)` | `0 1px 2px rgba(0, 0, 0, 0.45)` | Уровень elevation `1`. Синеватая полупрозрачная тень читается на светлом фоне мягче чёрной. |
| `--gr-shadow-2` | `0 8px 24px rgba(15, 23, 42, 0.14)` | `0 8px 24px rgba(0, 0, 0, 0.55)` | `0 8px 24px rgba(28, 27, 24, 0.13)` | `0 8px 24px rgba(0, 0, 0, 0.55)` | `0 8px 24px rgba(15, 23, 42, 0.14)` | `0 8px 24px rgba(0, 0, 0, 0.55)` | `0 8px 24px rgba(15, 23, 42, 0.14)` | `0 8px 24px rgba(0, 0, 0, 0.55)` | Уровень elevation `2` для всплывающих слоёв. |
| `--gr-shadow-3` | `0 16px 48px rgba(15, 23, 42, 0.20)` | `0 16px 48px rgba(0, 0, 0, 0.65)` | `0 16px 48px rgba(28, 27, 24, 0.18)` | `0 16px 48px rgba(0, 0, 0, 0.65)` | `0 16px 48px rgba(15, 23, 42, 0.20)` | `0 16px 48px rgba(0, 0, 0, 0.65)` | `0 16px 48px rgba(15, 23, 42, 0.20)` | `0 16px 48px rgba(0, 0, 0, 0.65)` | Уровень elevation `3` для модальных слоёв. |

## Производные состояния

Объявлены формулой `color-mix`; для браузеров без её поддержки тема несёт
тот же результат, посчитанный заранее (`fallbacks` режима).

| Токен | Формула | blueprint-light (fallback) | blueprint-dark (fallback) | clay-light (fallback) | clay-dark (fallback) | slate-light (fallback) | slate-dark (fallback) | tactile-light (fallback) | tactile-dark (fallback) | Назначение |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `--gr-primary-hover` | `92% --gr-primary` + `--gr-fg` | `#4a42d6` | `#a494fa` | `#de876b` | `#dc8164` | `#4a42d6` | `#a494fa` | `#4a42d6` | `#a494fa` | Hover-состояние primary action: подмес `--gr-fg` 8% в `--gr-primary`. |
| `--gr-primary-active` | `84% --gr-primary` + `--gr-fg` | `#453ec7` | `#ac9dfa` | `#e19279` | `#de8c70` | `#453ec7` | `#ac9dfa` | `#453ec7` | `#ac9dfa` | Active-состояние primary action: подмес `--gr-fg` 16% в `--gr-primary`. |
| `--gr-secondary-hover` | `92% --gr-secondary` + `--gr-fg` | `#d1d7e0` | `#435062` | `#d7d5cc` | `#494946` | `#d1d7e0` | `#435062` | `#d1d7e0` | `#435062` | Hover-состояние secondary action: подмес `--gr-fg` 8% в `--gr-secondary`. |
| `--gr-secondary-active` | `84% --gr-secondary` + `--gr-fg` | `#c0c7d0` | `#535f70` | `#c6c4bc` | `#595955` | `#c0c7d0` | `#535f70` | `#c0c7d0` | `#535f70` | Active-состояние secondary action: подмес `--gr-fg` 16% в `--gr-secondary`. |
| `--gr-brd-hover` | `70% --gr-brd` + `--gr-fg` | `#a3a9b5` | `#6e7987` | `#9e9d9b` | `#797976` | `#a3a9b5` | `#6e7987` | `#a3a9b5` | `#6e7987` | Hover-состояние бордеров и outline-элементов: подмес `--gr-fg` 30% в `--gr-brd`. |
| `--gr-brd-active` | `55% --gr-brd` + `--gr-fg` | `#838a97` | `#8c94a0` | `#80807e` | `#959491` | `#838a97` | `#8c94a0` | `#838a97` | `#8c94a0` | Active-состояние бордеров и outline-элементов: подмес `--gr-fg` 45% в `--gr-brd`. |
| `--gr-success-hover` | `92% --gr-success` + `--gr-fg` | `#10ac7a` | `#44d6a1` | `#889a70` | `#93a578` | `#10ac7a` | `#44d6a1` | `#10ac7a` | `#44d6a1` | Hover-состояние success-ролей: подмес `--gr-fg` 8% в `--gr-success`. |
| `--gr-success-active` | `84% --gr-success` + `--gr-fg` | `#109f73` | `#53d9a9` | `#93a37d` | `#9cad83` | `#109f73` | `#53d9a9` | `#109f73` | `#53d9a9` | Active-состояние success-ролей: подмес `--gr-fg` 16% в `--gr-success`. |
| `--gr-warning-hover` | `92% --gr-warning` + `--gr-fg` | `#e66c18` | `#fb9a4b` | `#cfb246` | `#cdae3d` | `#e66c18` | `#fb9a4b` | `#e66c18` | `#fb9a4b` | Hover-состояние warning-ролей: подмес `--gr-fg` 8% в `--gr-warning`. |
| `--gr-warning-active` | `84% --gr-warning` + `--gr-fg` | `#d46419` | `#fba35b` | `#d4b957` | `#d1b54d` | `#d46419` | `#fba35b` | `#d46419` | `#fba35b` | Active-состояние warning-ролей: подмес `--gr-fg` 16% в `--gr-warning`. |
| `--gr-danger-hover` | `92% --gr-danger` + `--gr-fg` | `#cc2526` | `#f87c7c` | `#ab3f37` | `#e56566` | `#cc2526` | `#f87c7c` | `#cc2526` | `#f87c7c` | Hover-состояние danger-ролей: подмес `--gr-fg` 8% в `--gr-danger`. |
| `--gr-danger-active` | `84% --gr-danger` + `--gr-fg` | `#bb2427` | `#f88787` | `#9e3b34` | `#e77273` | `#bb2427` | `#f88787` | `#bb2427` | `#f88787` | Active-состояние danger-ролей: подмес `--gr-fg` 16% в `--gr-danger`. |
| `--gr-info-hover` | `92% --gr-info` + `--gr-fg` | `#235ddc` | `#6cacfa` | `#2161b1` | `#76aae9` | `#235ddc` | `#6cacfa` | `#235ddc` | `#6cacfa` | Hover-состояние info-ролей: подмес `--gr-fg` 8% в `--gr-info`. |
| `--gr-info-active` | `84% --gr-info` + `--gr-fg` | `#2157cc` | `#78b3fa` | `#205ba3` | `#81b1ea` | `#2157cc` | `#78b3fa` | `#2157cc` | `#78b3fa` | Active-состояние info-ролей: подмес `--gr-fg` 16% в `--gr-info`. |
| `--gr-slate-hover` | `92% --gr-slate` + `--gr-fg` | `#435064` | `#9caabd` | `#484844` | `#a4a29a` | `#435064` | `#9caabd` | `#435064` | `#9caabd` | Hover-состояние slate-ролей: подмес `--gr-fg` 8% в `--gr-slate`. |
| `--gr-slate-active` | `84% --gr-slate` + `--gr-fg` | `#3e4b5f` | `#a4b1c3` | `#444340` | `#aba9a2` | `#3e4b5f` | `#a4b1c3` | `#3e4b5f` | `#a4b1c3` | Active-состояние slate-ролей: подмес `--gr-fg` 16% в `--gr-slate`. |
| `--gr-azure-hover` | `92% --gr-azure` + `--gr-fg` | `#016fab` | `#47c2f8` | `#6fabbf` | `#68a6bb` | `#016fab` | `#47c2f8` | `#016fab` | `#47c2f8` | Hover-состояние azure-ролей: подмес `--gr-fg` 8% в `--gr-azure`. |
| `--gr-azure-active` | `84% --gr-azure` + `--gr-fg` | `#0268a0` | `#57c7f9` | `#7cb2c5` | `#74adc0` | `#0268a0` | `#57c7f9` | `#0268a0` | `#57c7f9` | Active-состояние azure-ролей: подмес `--gr-fg` 16% в `--gr-azure`. |
