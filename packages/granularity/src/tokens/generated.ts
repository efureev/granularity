// СГЕНЕРИРОВАНО `yarn generate:tokens` из `tokens/*.json` — правки здесь потеряются.

import type { GrComponentToken, GrDerivedToken, GrFoundationToken, GrThemeToken } from './types'

export const grThemeNames = [
  "light",
  "dark"
] as const

export const grFoundationTokens: GrFoundationToken[] = [
  {
    "name": "--gr-slate-0",
    "value": "#ffffff",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 0 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-50",
    "value": "#f8fafc",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 50 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-100",
    "value": "#f1f5f9",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 100 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-200",
    "value": "#e2e8f0",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 200 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-300",
    "value": "#cbd5e1",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 300 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-400",
    "value": "#94a3b8",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 400 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-500",
    "value": "#64748b",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 500 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-600",
    "value": "#475569",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 600 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-700",
    "value": "#334155",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 700 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-800",
    "value": "#1e293b",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 800 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-slate-900",
    "value": "#0f172a",
    "section": "Foundations: neutral palette",
    "description": "Нейтральный оттенок slate 900 для базовой palette scale, поверхностей и бордеров."
  },
  {
    "name": "--gr-font-ui",
    "value": "Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif",
    "section": "Typography: font families",
    "description": "Основной стек шрифта для интерфейсного текста и большинства компонентных подписей."
  },
  {
    "name": "--gr-font-mono",
    "value": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    "section": "Typography: font families",
    "description": "Моноширинный стек для кода, числовых значений и технических подписей."
  },
  {
    "name": "--gr-text-2xs",
    "value": "10px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `2xs` из типографической шкалы foundation tokens: подписи и служебные строки, которые не должны конкурировать с основным текстом."
  },
  {
    "name": "--gr-text-xs",
    "value": "12px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `xs` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-sm",
    "value": "14px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `sm` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-base",
    "value": "16px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `base` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-lg",
    "value": "18px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `lg` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-xl",
    "value": "20px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `xl` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-2xl",
    "value": "24px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `2xl` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-3xl",
    "value": "30px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `3xl` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-text-4xl",
    "value": "36px",
    "section": "Typography: font sizes",
    "description": "Размер шрифта `4xl` из типографической шкалы foundation tokens."
  },
  {
    "name": "--gr-control-text-3xs",
    "value": "10px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на самой мелкой ступени — подпись колонки таблицы, служебная ссылка в списке файлов."
  },
  {
    "name": "--gr-control-text-2xs",
    "value": "11px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на ступени между `3xs` и `xs`: мелкий бейдж, компактная подсказка, заголовок группы в палитре команд."
  },
  {
    "name": "--gr-control-text-xs",
    "value": "12px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на ступени `xs`."
  },
  {
    "name": "--gr-control-text-sm",
    "value": "13px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на ступени `sm`."
  },
  {
    "name": "--gr-control-text-md",
    "value": "14px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на ступени `md` — значение по умолчанию."
  },
  {
    "name": "--gr-control-text-lg",
    "value": "16px",
    "section": "Typography: control scale",
    "description": "Кегль компонента на ступени `lg`."
  },
  {
    "name": "--gr-leading-2xs",
    "value": "0.875rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `2xs` — идёт в паре с `--gr-text-2xs`."
  },
  {
    "name": "--gr-leading-xs",
    "value": "1rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `xs` — идёт в паре с `--gr-text-xs`."
  },
  {
    "name": "--gr-leading-sm",
    "value": "1.25rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `sm` — идёт в паре с `--gr-text-sm`."
  },
  {
    "name": "--gr-leading-base",
    "value": "1.5rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `base` — идёт в паре с `--gr-text-base`."
  },
  {
    "name": "--gr-leading-lg",
    "value": "1.625rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `lg` — идёт в паре с `--gr-text-lg`."
  },
  {
    "name": "--gr-leading-xl",
    "value": "1.75rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `xl` — идёт в паре с `--gr-text-xl`."
  },
  {
    "name": "--gr-leading-3xl",
    "value": "2.25rem",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `3xl` — идёт в паре с `--gr-text-3xl`."
  },
  {
    "name": "--gr-control-leading-3xs",
    "value": "14px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `3xs` — идёт в паре с `--gr-control-text-3xs`."
  },
  {
    "name": "--gr-control-leading-2xs",
    "value": "16px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `2xs` — идёт в паре с `--gr-control-text-2xs`."
  },
  {
    "name": "--gr-control-leading-xs",
    "value": "16px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `xs` — идёт в паре с `--gr-control-text-xs`."
  },
  {
    "name": "--gr-control-leading-sm",
    "value": "18px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `sm` — идёт в паре с `--gr-control-text-sm`."
  },
  {
    "name": "--gr-control-leading-md",
    "value": "20px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `md` — идёт в паре с `--gr-control-text-md`."
  },
  {
    "name": "--gr-control-leading-lg",
    "value": "24px",
    "section": "Typography: line heights",
    "description": "Межстрочный интервал ступени `lg` — идёт в паре с `--gr-control-text-lg`."
  },
  {
    "name": "--gr-leading-tight",
    "value": "1.25",
    "section": "Typography: line heights",
    "description": "Коэффициент межстрочного интервала `tight` для текстовых блоков и подписей."
  },
  {
    "name": "--gr-leading-normal",
    "value": "1.5",
    "section": "Typography: line heights",
    "description": "Коэффициент межстрочного интервала `normal` для текстовых блоков и подписей."
  },
  {
    "name": "--gr-leading-relaxed",
    "value": "1.625",
    "section": "Typography: line heights",
    "description": "Коэффициент межстрочного интервала `relaxed` для текстовых блоков и подписей."
  },
  {
    "name": "--gr-font-regular",
    "value": "400",
    "section": "Typography: font weights",
    "description": "Вес шрифта `regular` для типографической иерархии интерфейса."
  },
  {
    "name": "--gr-font-medium",
    "value": "500",
    "section": "Typography: font weights",
    "description": "Вес шрифта `medium` для типографической иерархии интерфейса."
  },
  {
    "name": "--gr-font-semibold",
    "value": "600",
    "section": "Typography: font weights",
    "description": "Вес шрифта `semibold` для типографической иерархии интерфейса."
  },
  {
    "name": "--gr-font-bold",
    "value": "700",
    "section": "Typography: font weights",
    "description": "Вес шрифта `bold` для типографической иерархии интерфейса."
  },
  {
    "name": "--gr-space-0",
    "value": "0px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `0` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-1",
    "value": "4px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `1` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-2",
    "value": "8px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `2` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-3",
    "value": "12px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `3` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-4",
    "value": "16px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `4` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-5",
    "value": "20px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `5` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-6",
    "value": "24px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `6` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-8",
    "value": "32px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `8` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-10",
    "value": "40px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `10` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-12",
    "value": "48px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `12` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-16",
    "value": "64px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `16` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-20",
    "value": "80px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `20` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-24",
    "value": "96px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `24` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-32",
    "value": "128px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `32` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-40",
    "value": "160px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `40` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-48",
    "value": "192px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `48` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-space-64",
    "value": "256px",
    "section": "Layout: spacing scale",
    "description": "Шаг spacing scale `64` для отступов, gap и внутренних paddings."
  },
  {
    "name": "--gr-container-max",
    "value": "1280px",
    "section": "Layout: containers",
    "description": "Максимальная ширина layout-контейнера для контентных страниц и shell-структур."
  },
  {
    "name": "--gr-container-max-2xl",
    "value": "1440px",
    "section": "Layout: containers",
    "description": "Максимальная ширина layout-контейнера для контентных страниц и shell-структур."
  },
  {
    "name": "--gr-container-padding-mobile",
    "value": "16px",
    "section": "Layout: containers",
    "description": "Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария."
  },
  {
    "name": "--gr-container-padding-tablet",
    "value": "24px",
    "section": "Layout: containers",
    "description": "Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария."
  },
  {
    "name": "--gr-container-padding-desktop",
    "value": "32px",
    "section": "Layout: containers",
    "description": "Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария."
  },
  {
    "name": "--gr-bp-sm",
    "value": "640px",
    "section": "Layout: breakpoints",
    "description": "Foundation breakpoint `sm` для адаптивных layout-решений."
  },
  {
    "name": "--gr-bp-md",
    "value": "768px",
    "section": "Layout: breakpoints",
    "description": "Foundation breakpoint `md` для адаптивных layout-решений."
  },
  {
    "name": "--gr-bp-lg",
    "value": "1024px",
    "section": "Layout: breakpoints",
    "description": "Foundation breakpoint `lg` для адаптивных layout-решений."
  },
  {
    "name": "--gr-bp-xl",
    "value": "1280px",
    "section": "Layout: breakpoints",
    "description": "Foundation breakpoint `xl` для адаптивных layout-решений."
  },
  {
    "name": "--gr-bp-2xl",
    "value": "1536px",
    "section": "Layout: breakpoints",
    "description": "Foundation breakpoint `2xl` для адаптивных layout-решений."
  },
  {
    "name": "--gr-icon-size-xs",
    "value": "14px",
    "section": "Iconography: icon sizes",
    "description": "Размер иконки `xs` — рядом с текстом `xs`/`sm`."
  },
  {
    "name": "--gr-icon-size-sm",
    "value": "16px",
    "section": "Iconography: icon sizes",
    "description": "Размер иконки `sm` — в компактных кнопках и строках списка."
  },
  {
    "name": "--gr-icon-size-md",
    "value": "18px",
    "section": "Iconography: icon sizes",
    "description": "Размер иконки `md` — значение по умолчанию."
  },
  {
    "name": "--gr-icon-size-lg",
    "value": "20px",
    "section": "Iconography: icon sizes",
    "description": "Размер иконки `lg` — в крупных кнопках и заголовках."
  },
  {
    "name": "--radius",
    "value": "0.5rem",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Совместимый alias базового радиуса для интеграций, ожидающих shadcn-style token contract."
  },
  {
    "name": "--gr-radius-none",
    "value": "0px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `none` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-radius-xs",
    "value": "3px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `xs` — микроэлементы: подсветка совпадения в поиске, кнопка очистки внутри контрола."
  },
  {
    "name": "--gr-radius-sm",
    "value": "4px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `sm` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-radius-control",
    "value": "6px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус контрола и мелкой интерактивной детали внутри него: оболочка поля, чип, кнопка-крестик, фокус-кольцо ссылки, тултип слайдера."
  },
  {
    "name": "--gr-radius-md",
    "value": "8px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `md` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-radius-lg",
    "value": "12px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `lg` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-radius-xl",
    "value": "16px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `xl` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-radius-full",
    "value": "9999px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `full` для углов компонентов и поверхностей."
  },
  {
    "name": "--gr-shadow-0",
    "value": "none",
    "section": "Elevation",
    "description": "Уровень elevation `0` для карточек, popover-слоёв и акцентных поверхностей."
  },
  {
    "name": "--gr-shadow-1",
    "value": "0 1px 2px rgba(15, 23, 42, 0.08)",
    "section": "Elevation",
    "description": "Уровень elevation `1` для карточек, popover-слоёв и акцентных поверхностей."
  },
  {
    "name": "--gr-shadow-2",
    "value": "0 8px 24px rgba(15, 23, 42, 0.14)",
    "section": "Elevation",
    "description": "Уровень elevation `2` для карточек, popover-слоёв и акцентных поверхностей."
  },
  {
    "name": "--gr-shadow-3",
    "value": "0 16px 48px rgba(15, 23, 42, 0.20)",
    "section": "Elevation",
    "description": "Уровень elevation `3` для карточек, popover-слоёв и акцентных поверхностей."
  },
  {
    "name": "--gr-duration-fast",
    "value": "150ms",
    "section": "Motion",
    "description": "Базовая длительность анимации `fast` для transitions и state changes."
  },
  {
    "name": "--gr-duration-base",
    "value": "200ms",
    "section": "Motion",
    "description": "Базовая длительность анимации `base` для transitions и state changes."
  },
  {
    "name": "--gr-duration-slow",
    "value": "300ms",
    "section": "Motion",
    "description": "Базовая длительность анимации `slow` для transitions и state changes."
  },
  {
    "name": "--gr-ease-out",
    "value": "cubic-bezier(0.16, 1, 0.3, 1)",
    "section": "Motion",
    "description": "Кривая ускорения `out` для motion-паттернов дизайн-системы."
  },
  {
    "name": "--gr-ease-in",
    "value": "cubic-bezier(0.7, 0, 0.84, 0)",
    "section": "Motion",
    "description": "Кривая ускорения `in` для motion-паттернов дизайн-системы."
  },
  {
    "name": "--gr-z-bottom-nav",
    "value": "850",
    "section": "Layering: z-index scale",
    "description": "Нижняя навигация приложения. Самый низкий слой шкалы: панель прижата к нижней кромке и обязана уходить под открытую выпадашку, тултип и модалку."
  },
  {
    "name": "--gr-z-navbar",
    "value": "900",
    "section": "Layering: z-index scale",
    "description": "Прилипшая шапка приложения. Ниже якорных панелей: шапка перекрывает контент, но не выпадашки, тултипы и модалки."
  },
  {
    "name": "--gr-z-dropdown",
    "value": "1000",
    "section": "Layering: z-index scale",
    "description": "Слой якорных floating-панелей: dropdown, select, tree-select."
  },
  {
    "name": "--gr-z-tooltip",
    "value": "1050",
    "section": "Layering: z-index scale",
    "description": "Слой тултипов — выше floating-панелей, ниже модалок."
  },
  {
    "name": "--gr-z-modal",
    "value": "1100",
    "section": "Layering: z-index scale",
    "description": "Слой модальных окон и диалогов."
  },
  {
    "name": "--gr-z-loading",
    "value": "1150",
    "section": "Layering: z-index scale",
    "description": "Слой полноэкранного оверлея загрузки: выше модалок, потому что блокирует всё приложение целиком, но ниже тостов."
  },
  {
    "name": "--gr-z-toast",
    "value": "1200",
    "section": "Layering: z-index scale",
    "description": "Слой тостов — единственный, обязанный быть виден поверх всего, включая открытые модалки."
  }
]

export const grDerivedTokens: GrDerivedToken[] = [
  {
    "name": "--gr-primary-hover",
    "section": "Derived interaction formulas: action roles",
    "description": "Hover-состояние primary action: подмес `--gr-fg` 8% в `--gr-primary`.",
    "formula": "color-mix(in srgb, var(--gr-primary) 92%, var(--gr-fg))",
    "base": "--gr-primary",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#4a42d6",
      "dark": "#a494fa"
    }
  },
  {
    "name": "--gr-primary-active",
    "section": "Derived interaction formulas: action roles",
    "description": "Active-состояние primary action: подмес `--gr-fg` 16% в `--gr-primary`.",
    "formula": "color-mix(in srgb, var(--gr-primary) 84%, var(--gr-fg))",
    "base": "--gr-primary",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#453ec7",
      "dark": "#ac9dfa"
    }
  },
  {
    "name": "--gr-secondary-hover",
    "section": "Derived interaction formulas: action roles",
    "description": "Hover-состояние secondary action: подмес `--gr-fg` 8% в `--gr-secondary`.",
    "formula": "color-mix(in srgb, var(--gr-secondary) 92%, var(--gr-fg))",
    "base": "--gr-secondary",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#d1d7e0",
      "dark": "#435062"
    }
  },
  {
    "name": "--gr-secondary-active",
    "section": "Derived interaction formulas: action roles",
    "description": "Active-состояние secondary action: подмес `--gr-fg` 16% в `--gr-secondary`.",
    "formula": "color-mix(in srgb, var(--gr-secondary) 84%, var(--gr-fg))",
    "base": "--gr-secondary",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#c0c7d0",
      "dark": "#535f70"
    }
  },
  {
    "name": "--gr-brd-hover",
    "section": "Derived interaction formulas: action roles",
    "description": "Hover-состояние бордеров и outline-элементов: подмес `--gr-fg` 30% в `--gr-brd`.",
    "formula": "color-mix(in srgb, var(--gr-brd) 70%, var(--gr-fg))",
    "base": "--gr-brd",
    "amount": 70,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#a3a9b5",
      "dark": "#6e7987"
    }
  },
  {
    "name": "--gr-brd-active",
    "section": "Derived interaction formulas: action roles",
    "description": "Active-состояние бордеров и outline-элементов: подмес `--gr-fg` 45% в `--gr-brd`.",
    "formula": "color-mix(in srgb, var(--gr-brd) 55%, var(--gr-fg))",
    "base": "--gr-brd",
    "amount": 55,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#838a97",
      "dark": "#8c94a0"
    }
  },
  {
    "name": "--gr-success-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние success-ролей: подмес `--gr-fg` 8% в `--gr-success`.",
    "formula": "color-mix(in srgb, var(--gr-success) 92%, var(--gr-fg))",
    "base": "--gr-success",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#10ac7a",
      "dark": "#44d6a1"
    }
  },
  {
    "name": "--gr-success-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние success-ролей: подмес `--gr-fg` 16% в `--gr-success`.",
    "formula": "color-mix(in srgb, var(--gr-success) 84%, var(--gr-fg))",
    "base": "--gr-success",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#109f73",
      "dark": "#53d9a9"
    }
  },
  {
    "name": "--gr-warning-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние warning-ролей: подмес `--gr-fg` 8% в `--gr-warning`.",
    "formula": "color-mix(in srgb, var(--gr-warning) 92%, var(--gr-fg))",
    "base": "--gr-warning",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#e66c18",
      "dark": "#fb9a4b"
    }
  },
  {
    "name": "--gr-warning-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние warning-ролей: подмес `--gr-fg` 16% в `--gr-warning`.",
    "formula": "color-mix(in srgb, var(--gr-warning) 84%, var(--gr-fg))",
    "base": "--gr-warning",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#d46419",
      "dark": "#fba35b"
    }
  },
  {
    "name": "--gr-danger-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние danger-ролей: подмес `--gr-fg` 8% в `--gr-danger`.",
    "formula": "color-mix(in srgb, var(--gr-danger) 92%, var(--gr-fg))",
    "base": "--gr-danger",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#cc2526",
      "dark": "#f87c7c"
    }
  },
  {
    "name": "--gr-danger-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние danger-ролей: подмес `--gr-fg` 16% в `--gr-danger`.",
    "formula": "color-mix(in srgb, var(--gr-danger) 84%, var(--gr-fg))",
    "base": "--gr-danger",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#bb2427",
      "dark": "#f88787"
    }
  },
  {
    "name": "--gr-info-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние info-ролей: подмес `--gr-fg` 8% в `--gr-info`.",
    "formula": "color-mix(in srgb, var(--gr-info) 92%, var(--gr-fg))",
    "base": "--gr-info",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#235ddc",
      "dark": "#6cacfa"
    }
  },
  {
    "name": "--gr-info-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние info-ролей: подмес `--gr-fg` 16% в `--gr-info`.",
    "formula": "color-mix(in srgb, var(--gr-info) 84%, var(--gr-fg))",
    "base": "--gr-info",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#2157cc",
      "dark": "#78b3fa"
    }
  },
  {
    "name": "--gr-slate-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние slate-ролей: подмес `--gr-fg` 8% в `--gr-slate`.",
    "formula": "color-mix(in srgb, var(--gr-slate) 92%, var(--gr-fg))",
    "base": "--gr-slate",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#435064",
      "dark": "#9caabd"
    }
  },
  {
    "name": "--gr-slate-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние slate-ролей: подмес `--gr-fg` 16% в `--gr-slate`.",
    "formula": "color-mix(in srgb, var(--gr-slate) 84%, var(--gr-fg))",
    "base": "--gr-slate",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#3e4b5f",
      "dark": "#a4b1c3"
    }
  },
  {
    "name": "--gr-azure-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние azure-ролей: подмес `--gr-fg` 8% в `--gr-azure`.",
    "formula": "color-mix(in srgb, var(--gr-azure) 92%, var(--gr-fg))",
    "base": "--gr-azure",
    "amount": 92,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#016fab",
      "dark": "#47c2f8"
    }
  },
  {
    "name": "--gr-azure-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние azure-ролей: подмес `--gr-fg` 16% в `--gr-azure`.",
    "formula": "color-mix(in srgb, var(--gr-azure) 84%, var(--gr-fg))",
    "base": "--gr-azure",
    "amount": 84,
    "mixWith": "--gr-fg",
    "values": {
      "light": "#0268a0",
      "dark": "#57c7f9"
    }
  }
]

export const grThemeTokens: GrThemeToken[] = [
  {
    "name": "--gr-bg",
    "section": "Surface roles",
    "description": "Базовый фон приложения и крупных layout-поверхностей текущей темы.",
    "values": {
      "light": "#f8fafc",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-fg",
    "section": "Surface roles",
    "description": "Основной цвет текста и иконок поверх базового фона текущей темы.",
    "values": {
      "light": "#0f172a",
      "dark": "#f8fafc"
    }
  },
  {
    "name": "--gr-card",
    "section": "Surface roles",
    "description": "Фон карточек, панелей и других поднятых поверхностей.",
    "values": {
      "light": "#ffffff",
      "dark": "#1e293b"
    }
  },
  {
    "name": "--gr-card-fg",
    "section": "Surface roles",
    "description": "Цвет контента внутри карточек и raised surface-блоков.",
    "values": {
      "light": "#0f172a",
      "dark": "#f8fafc"
    }
  },
  {
    "name": "--gr-popover",
    "section": "Surface roles",
    "description": "Фон popover-, dropdown- и overlay-поверхностей.",
    "values": {
      "light": "#ffffff",
      "dark": "#1e293b"
    }
  },
  {
    "name": "--gr-popover-fg",
    "section": "Surface roles",
    "description": "Цвет текста и иконок внутри popover-слоёв.",
    "values": {
      "light": "#0f172a",
      "dark": "#f8fafc"
    }
  },
  {
    "name": "--gr-muted",
    "section": "Surface roles",
    "description": "Приглушённая поверхность для вторичных блоков, плашек и заполнений.",
    "values": {
      "light": "#f1f5f9",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-muted-fg",
    "section": "Surface roles",
    "description": "Вторичный текстовый цвет для helper-копии и менее важных подписей.",
    "values": {
      "light": "#556275",
      "dark": "#aab6c7"
    }
  },
  {
    "name": "--gr-secondary",
    "section": "Surface roles",
    "description": "Нейтральная secondary action/surface-подложка без сильного бренд-акцента.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-secondary-fg",
    "section": "Surface roles",
    "description": "Контрастный текст для secondary-кнопок и поверхностей.",
    "values": {
      "light": "#1e293b",
      "dark": "#f1f5f9"
    }
  },
  {
    "name": "--gr-overlay-bg",
    "section": "Surface roles",
    "description": "Подложка модальных слоёв (модалка, drawer): затемняет страницу, оставляя её узнаваемой.",
    "values": {
      "light": "rgb(15 23 42 / 0.45)",
      "dark": "rgb(2 6 23 / 0.65)"
    }
  },
  {
    "name": "--gr-brd",
    "section": "Surface roles",
    "description": "Базовый цвет бордеров и разделителей текущей темы.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-input",
    "section": "Surface roles",
    "description": "Цвет рамки и фона input-like контролов в состоянии покоя.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-ring",
    "section": "Surface roles",
    "description": "Цвет focus-ring и акцентного outline для интерактивных компонентов.",
    "values": {
      "light": "#6366f1",
      "dark": "#818cf8"
    }
  },
  {
    "name": "--gr-disabled-bg",
    "section": "State roles",
    "description": "Фон недоступного контрола: гасит его поверхностью, а не прозрачностью — `opacity` разбавляет выверенные на AA токены текста.",
    "values": {
      "light": "#f1f5f9",
      "dark": "#273548"
    }
  },
  {
    "name": "--gr-disabled-fg",
    "section": "State roles",
    "description": "Цвет текста и иконок недоступного контрола.",
    "values": {
      "light": "#94a3b8",
      "dark": "#64748b"
    }
  },
  {
    "name": "--gr-disabled-brd",
    "section": "State roles",
    "description": "Цвет рамки недоступного контрола.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-invalid-brd",
    "section": "State roles",
    "description": "Цвет рамки контрола, не прошедшего валидацию.",
    "values": {
      "light": "var(--gr-danger)",
      "dark": "var(--gr-danger)"
    }
  },
  {
    "name": "--gr-invalid-ring",
    "section": "State roles",
    "description": "Цвет focus-ring контрола, не прошедшего валидацию.",
    "values": {
      "light": "var(--gr-danger)",
      "dark": "var(--gr-danger)"
    }
  },
  {
    "name": "--gr-invalid-text",
    "section": "State roles",
    "description": "Цвет текста ошибки и метки обязательного поля.",
    "values": {
      "light": "var(--gr-danger-text)",
      "dark": "var(--gr-danger-text)"
    }
  },
  {
    "name": "--gr-primary",
    "section": "Action roles",
    "description": "Главный brand/action цвет темы для primary CTA и ключевых акцентов.",
    "values": {
      "light": "#4f46e5",
      "dark": "#9d8bfa"
    }
  },
  {
    "name": "--gr-primary-fg",
    "section": "Action roles",
    "description": "Контрастный текст и иконки поверх primary-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-accent",
    "section": "Action roles",
    "description": "Мягкая акцентная поверхность для selected/hovered областей и подсветок.",
    "values": {
      "light": "#eef2ff",
      "dark": "#1e1b4b"
    }
  },
  {
    "name": "--gr-accent-fg",
    "section": "Action roles",
    "description": "Цвет текста поверх accent-подложек.",
    "values": {
      "light": "#3730a3",
      "dark": "#c7d2fe"
    }
  },
  {
    "name": "--gr-success",
    "section": "Status roles",
    "description": "Основной semantic success-цвет для статусов, бейджей и уведомлений.",
    "values": {
      "light": "#10b981",
      "dark": "#34d399"
    }
  },
  {
    "name": "--gr-success-light",
    "section": "Status roles",
    "description": "Облегчённая success-подложка для мягких статусов и подсветок.",
    "values": {
      "light": "#d1fae5",
      "dark": "#194536"
    }
  },
  {
    "name": "--gr-success-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх success-заливки.",
    "values": {
      "light": "#0f172a",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-primary-text",
    "section": "Status roles",
    "description": "Основной тон как ЦВЕТ ТЕКСТА на фоне страницы: насыщенный `--gr-primary` под текст не рассчитан и не проходит по контрасту.",
    "values": {
      "light": "#3730a3",
      "dark": "#c7d2fe"
    }
  },
  {
    "name": "--gr-success-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для success-сообщений на светлой подложке.",
    "values": {
      "light": "#065f46",
      "dark": "#6ee7b7"
    }
  },
  {
    "name": "--gr-warning",
    "section": "Status roles",
    "description": "Основной semantic warning-цвет для предупреждений и промежуточных статусов.",
    "values": {
      "light": "#f97316",
      "dark": "#fb923c"
    }
  },
  {
    "name": "--gr-warning-light",
    "section": "Status roles",
    "description": "Облегчённая warning-подложка для мягких warning-состояний.",
    "values": {
      "light": "#ffedd5",
      "dark": "#672e1c"
    }
  },
  {
    "name": "--gr-warning-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх warning-заливки.",
    "values": {
      "light": "#0f172a",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-warning-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для warning-сообщений на мягкой warning-подложке.",
    "values": {
      "light": "#7c2d12",
      "dark": "#fdba74"
    }
  },
  {
    "name": "--gr-danger",
    "section": "Status roles",
    "description": "Semantic danger-цвет для ошибок, рисков и критических сообщений.",
    "values": {
      "light": "#dc2626",
      "dark": "#f87171"
    }
  },
  {
    "name": "--gr-danger-light",
    "section": "Status roles",
    "description": "Облегчённая danger-подложка для мягких error-состояний.",
    "values": {
      "light": "#fee2e2",
      "dark": "#6a2522"
    }
  },
  {
    "name": "--gr-danger-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх danger-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-danger-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для error-сообщений на мягкой danger-подложке.",
    "values": {
      "light": "#991b1b",
      "dark": "#fca5a5"
    }
  },
  {
    "name": "--gr-info",
    "section": "Status roles",
    "description": "Semantic info-цвет для нейтральных уведомлений и информационных акцентов.",
    "values": {
      "light": "#2563eb",
      "dark": "#60a5fa"
    }
  },
  {
    "name": "--gr-info-light",
    "section": "Status roles",
    "description": "Облегчённая info-подложка для спокойных информационных блоков.",
    "values": {
      "light": "#dbeafe",
      "dark": "#213771"
    }
  },
  {
    "name": "--gr-info-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх info-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-info-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для спокойных info-сообщений и подсказок.",
    "values": {
      "light": "#1e40af",
      "dark": "#bfdbfe"
    }
  },
  {
    "name": "--gr-slate",
    "section": "Status roles",
    "description": "Нейтральный semantic slate-цвет для subdued индикаторов и secondary статусов.",
    "values": {
      "light": "#475569",
      "dark": "#94a3b8"
    }
  },
  {
    "name": "--gr-slate-light",
    "section": "Status roles",
    "description": "Облегчённая slate-подложка для мягких нейтральных состояний.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#313b4a"
    }
  },
  {
    "name": "--gr-slate-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх slate-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-slate-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для нейтральных slate-сообщений и плашек.",
    "values": {
      "light": "#334155",
      "dark": "#cbd5e1"
    }
  },
  {
    "name": "--gr-azure",
    "section": "Status roles",
    "description": "Semantic azure-цвет для информационных акцентов и вспомогательных статусов.",
    "values": {
      "light": "#0077b6",
      "dark": "#38bdf8"
    }
  },
  {
    "name": "--gr-azure-light",
    "section": "Status roles",
    "description": "Облегчённая azure-подложка для мягких informational поверхностей.",
    "values": {
      "light": "#e0f2fe",
      "dark": "#1b425c"
    }
  },
  {
    "name": "--gr-azure-fg",
    "section": "Status roles",
    "description": "Контрастный текст и иконки поверх azure-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#0f172a"
    }
  },
  {
    "name": "--gr-azure-text",
    "section": "Status roles",
    "description": "Текстовый оттенок для azure-плашек и спокойных informational блоков.",
    "values": {
      "light": "#075985",
      "dark": "#bae6fd"
    }
  },
  {
    "name": "--gr-primary-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `primary`.",
    "values": {
      "light": "var(--gr-primary)",
      "dark": "#595ce6"
    }
  },
  {
    "name": "--gr-primary-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-primary-solid` под курсором.",
    "values": {
      "light": "var(--gr-primary-hover)",
      "dark": "#5053dd"
    }
  },
  {
    "name": "--gr-primary-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-primary-solid` в момент нажатия.",
    "values": {
      "light": "var(--gr-primary-active)",
      "dark": "#474acf"
    }
  },
  {
    "name": "--gr-primary-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-primary-solid`.",
    "values": {
      "light": "var(--gr-primary-fg)",
      "dark": "var(--gr-slate-0)"
    }
  },
  {
    "name": "--gr-success-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `success`.",
    "values": {
      "light": "#047857",
      "dark": "#047857"
    }
  },
  {
    "name": "--gr-success-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-success-solid` под курсором.",
    "values": {
      "light": "#036c4d",
      "dark": "#036c4d"
    }
  },
  {
    "name": "--gr-success-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-success-solid` в момент нажатия.",
    "values": {
      "light": "#025f44",
      "dark": "#025f44"
    }
  },
  {
    "name": "--gr-success-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-success-solid`.",
    "values": {
      "light": "var(--gr-slate-0)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-warning-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `warning`.",
    "values": {
      "light": "#c2410c",
      "dark": "#c2410c"
    }
  },
  {
    "name": "--gr-warning-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-warning-solid` под курсором.",
    "values": {
      "light": "#b53b0a",
      "dark": "#b53b0a"
    }
  },
  {
    "name": "--gr-warning-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-warning-solid` в момент нажатия.",
    "values": {
      "light": "#9f3307",
      "dark": "#9f3307"
    }
  },
  {
    "name": "--gr-warning-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-warning-solid`.",
    "values": {
      "light": "var(--gr-slate-0)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-danger-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `danger`.",
    "values": {
      "light": "var(--gr-danger)",
      "dark": "#b91c1c"
    }
  },
  {
    "name": "--gr-danger-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-danger-solid` под курсором.",
    "values": {
      "light": "var(--gr-danger-hover)",
      "dark": "#a91919"
    }
  },
  {
    "name": "--gr-danger-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-danger-solid` в момент нажатия.",
    "values": {
      "light": "var(--gr-danger-active)",
      "dark": "#931515"
    }
  },
  {
    "name": "--gr-danger-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-danger-solid`.",
    "values": {
      "light": "var(--gr-danger-fg)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-info-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `info`.",
    "values": {
      "light": "var(--gr-info)",
      "dark": "#1d4ed8"
    }
  },
  {
    "name": "--gr-info-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-info-solid` под курсором.",
    "values": {
      "light": "var(--gr-info-hover)",
      "dark": "#1e40af"
    }
  },
  {
    "name": "--gr-info-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-info-solid` в момент нажатия.",
    "values": {
      "light": "var(--gr-info-active)",
      "dark": "#1e3a8a"
    }
  },
  {
    "name": "--gr-info-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-info-solid`.",
    "values": {
      "light": "var(--gr-info-fg)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-slate-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `slate`.",
    "values": {
      "light": "var(--gr-slate)",
      "dark": "var(--gr-slate-600)"
    }
  },
  {
    "name": "--gr-slate-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-slate-solid` под курсором.",
    "values": {
      "light": "var(--gr-slate-hover)",
      "dark": "var(--gr-slate-700)"
    }
  },
  {
    "name": "--gr-slate-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-slate-solid` в момент нажатия.",
    "values": {
      "light": "var(--gr-slate-active)",
      "dark": "var(--gr-slate-800)"
    }
  },
  {
    "name": "--gr-slate-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-slate-solid`.",
    "values": {
      "light": "var(--gr-slate-fg)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-azure-solid",
    "section": "Solid fill roles",
    "description": "Сплошная заливка кнопочного веса тона `azure`.",
    "values": {
      "light": "#0369a1",
      "dark": "#0369a1"
    }
  },
  {
    "name": "--gr-azure-solid-hover",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-azure-solid` под курсором.",
    "values": {
      "light": "#075985",
      "dark": "#075985"
    }
  },
  {
    "name": "--gr-azure-solid-active",
    "section": "Solid fill roles",
    "description": "Заливка `--gr-azure-solid` в момент нажатия.",
    "values": {
      "light": "#0c4a6e",
      "dark": "#0c4a6e"
    }
  },
  {
    "name": "--gr-azure-solid-fg",
    "section": "Solid fill roles",
    "description": "Текст и иконки на заливке `--gr-azure-solid`.",
    "values": {
      "light": "var(--gr-slate-0)",
      "dark": "var(--gr-slate-50)"
    }
  },
  {
    "name": "--gr-chart-1",
    "section": "Data visualization roles",
    "description": "Первый цвет серии для графиков и data-visualization элементов.",
    "values": {
      "light": "#4f46e5",
      "dark": "#6366f1"
    }
  },
  {
    "name": "--gr-chart-2",
    "section": "Data visualization roles",
    "description": "Второй цвет серии для графиков и data-visualization элементов.",
    "values": {
      "light": "#10b981",
      "dark": "#34d399"
    }
  },
  {
    "name": "--gr-chart-3",
    "section": "Data visualization roles",
    "description": "Третий цвет серии для графиков и data-visualization элементов.",
    "values": {
      "light": "#f97316",
      "dark": "#fb923c"
    }
  },
  {
    "name": "--gr-chart-4",
    "section": "Data visualization roles",
    "description": "Четвёртый цвет серии для графиков и data-visualization элементов.",
    "values": {
      "light": "#6366f1",
      "dark": "#818cf8"
    }
  },
  {
    "name": "--gr-chart-5",
    "section": "Data visualization roles",
    "description": "Пятый цвет серии для графиков и data-visualization элементов.",
    "values": {
      "light": "#8b5cf6",
      "dark": "#a78bfa"
    }
  },
  {
    "name": "--gr-sidebar",
    "section": "Navigation roles",
    "description": "Фон sidebar/navigation rail области текущей темы.",
    "values": {
      "light": "#ffffff",
      "dark": "#1e293b"
    }
  },
  {
    "name": "--gr-sidebar-fg",
    "section": "Navigation roles",
    "description": "Основной текст и иконки внутри sidebar.",
    "values": {
      "light": "#0f172a",
      "dark": "#f8fafc"
    }
  },
  {
    "name": "--gr-sidebar-primary",
    "section": "Navigation roles",
    "description": "Акцентный цвет активных/ключевых элементов внутри sidebar.",
    "values": {
      "light": "#4f46e5",
      "dark": "#6365f0"
    }
  },
  {
    "name": "--gr-sidebar-primary-fg",
    "section": "Navigation roles",
    "description": "Контрастный текст поверх sidebar primary-акцентов.",
    "values": {
      "light": "#ffffff",
      "dark": "#ffffff"
    }
  },
  {
    "name": "--gr-sidebar-accent",
    "section": "Navigation roles",
    "description": "Мягкий accent-фон для hover/selected состояний в sidebar.",
    "values": {
      "light": "#f1f5f9",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-sidebar-accent-fg",
    "section": "Navigation roles",
    "description": "Цвет текста поверх sidebar accent-подложек.",
    "values": {
      "light": "#1e293b",
      "dark": "#f1f5f9"
    }
  },
  {
    "name": "--gr-sidebar-brd",
    "section": "Navigation roles",
    "description": "Бордеры и разделители sidebar-области.",
    "values": {
      "light": "#e2e8f0",
      "dark": "#334155"
    }
  },
  {
    "name": "--gr-sidebar-ring",
    "section": "Navigation roles",
    "description": "Focus-ring для интерактивных элементов внутри sidebar.",
    "values": {
      "light": "#6366f1",
      "dark": "#818cf8"
    }
  },
  {
    "name": "--gr-shadow-1",
    "section": "Elevation",
    "description": "Уровень elevation `1`. Синеватая полупрозрачная тень читается на светлом фоне мягче чёрной.",
    "values": {
      "light": "0 1px 2px rgba(15, 23, 42, 0.08)",
      "dark": "0 1px 2px rgba(0, 0, 0, 0.45)"
    }
  },
  {
    "name": "--gr-shadow-2",
    "section": "Elevation",
    "description": "Уровень elevation `2` для всплывающих слоёв.",
    "values": {
      "light": "0 8px 24px rgba(15, 23, 42, 0.14)",
      "dark": "0 8px 24px rgba(0, 0, 0, 0.55)"
    }
  },
  {
    "name": "--gr-shadow-3",
    "section": "Elevation",
    "description": "Уровень elevation `3` для модальных слоёв.",
    "values": {
      "light": "0 16px 48px rgba(15, 23, 42, 0.20)",
      "dark": "0 16px 48px rgba(0, 0, 0, 0.65)"
    }
  }
]

export const grComponentTokens: GrComponentToken[] = [
  {
    "owner": "GrAffix",
    "name": "--gr-affix-offset",
    "kind": "inline",
    "default": "0px",
    "description": "Отступ от края в прилипшем состоянии. Пишется инлайн из пропа `offset`; заданный в CSS (например на `:root` — высота шапки приложения) работает общим дефолтом для всех аффиксов и подхватывается наблюдателем."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Фон прилипшей панели. Без него уезжающее под неё содержимое просвечивает насквозь. Аффикс внутри карточки берёт `var(--gr-card)`."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-shadow",
    "kind": "hook",
    "default": "var(--gr-shadow-2), при `placement=\"bottom\"` — зеркальная тень вверх подмесом `--gr-fg`",
    "description": "Тень прилипшей панели: она отделяет панель от уезжающего содержимого. Тенью, а не рамкой — рамка меняет высоту в момент прилипания и сдвигает раскладку."
  },
  {
    "owner": "GrAffix",
    "name": "--gr-affix-z",
    "kind": "hook",
    "default": "10",
    "description": "Порядок внутри своего stacking-контекста. Не глобальный слой: приложение, которому аффикс нужен на шкале, ставит сюда `var(--gr-z-navbar)` — шаг между слоями шкалы оставлен ровно под это (`docs/z-index.md`)."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-bg",
    "kind": "inline",
    "default": "подложка тона (`--gr-<tone>-light`)",
    "description": "Фон полосы уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-brd",
    "kind": "inline",
    "default": "подмес тона к подложке",
    "description": "Цвет рамки уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-text-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет основного текста уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-title-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет заголовка уведомления."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-icon-color",
    "kind": "inline",
    "default": "насыщенный тон (`--gr-<tone>`)",
    "description": "Цвет иконки тона слева от текста."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет кнопки закрытия в покое."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-hover-color",
    "kind": "inline",
    "default": "`--gr-<tone>-text`",
    "description": "Цвет кнопки закрытия под курсором."
  },
  {
    "owner": "GrAlert",
    "name": "--gr-alert-close-hover-bg",
    "kind": "inline",
    "default": "подмес тона к подложке",
    "description": "Фон кнопки закрытия под курсором."
  },
  {
    "owner": "GrAvatar",
    "name": "--gr-avatar-square-radius",
    "kind": "hook",
    "default": "10px",
    "description": "Скругление аватара в форме `square`. Не ступень общей шкалы: квадратный аватар мягче плитки, но жёстче чипа."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-xs",
    "kind": "hook",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `xs`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-sm",
    "kind": "hook",
    "default": "3px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `sm`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-md",
    "kind": "hook",
    "default": "5px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `md`."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-semi-radius-lg",
    "kind": "hook",
    "default": "7px",
    "description": "Скругление бейджа `radius=\"semi\"` на ступени `lg`. Лестница 3/3/5/7 своя: бейдж скругляется медленнее, чем растёт."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-fg)",
    "description": "Заливка filled-бейджа нейтрального веса — инверсия страницы. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-neutral-fg",
    "kind": "theme",
    "default": "var(--gr-bg)",
    "description": "Текст filled-бейджа нейтрального веса — инверсия страницы: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-primary-bg",
    "kind": "theme",
    "default": "var(--gr-primary-solid)",
    "description": "Заливка filled-бейджа тона `primary`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-primary-fg",
    "kind": "theme",
    "default": "var(--gr-primary-solid-fg)",
    "description": "Текст filled-бейджа тона `primary`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-success-bg",
    "kind": "theme",
    "default": "var(--gr-success-solid)",
    "description": "Заливка filled-бейджа тона `success`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-success-fg",
    "kind": "theme",
    "default": "var(--gr-success-solid-fg)",
    "description": "Текст filled-бейджа тона `success`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning-solid)",
    "description": "Заливка filled-бейджа тона `warning`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-warning-fg",
    "kind": "theme",
    "default": "var(--gr-warning-solid-fg)",
    "description": "Текст filled-бейджа тона `warning`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger-solid)",
    "description": "Заливка filled-бейджа тона `danger`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-danger-fg",
    "kind": "theme",
    "default": "var(--gr-danger-solid-fg)",
    "description": "Текст filled-бейджа тона `danger`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-info-bg",
    "kind": "theme",
    "default": "var(--gr-info-solid)",
    "description": "Заливка filled-бейджа тона `info`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-info-fg",
    "kind": "theme",
    "default": "var(--gr-info-solid-fg)",
    "description": "Текст filled-бейджа тона `info`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate-solid)",
    "description": "Заливка filled-бейджа тона `slate`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-slate-fg",
    "kind": "theme",
    "default": "var(--gr-slate-solid-fg)",
    "description": "Текст filled-бейджа тона `slate`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure-solid)",
    "description": "Заливка filled-бейджа тона `azure`. В светлой теме — вес solid-кнопки, в тёмной — роль тона."
  },
  {
    "owner": "GrBadge",
    "name": "--gr-badge-azure-fg",
    "kind": "theme",
    "default": "var(--gr-azure-solid-fg)",
    "description": "Текст filled-бейджа тона `azure`: полярность задаётся темой, а не заливкой."
  },
  {
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-x",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — -0.25rem)",
    "description": "Горизонтальный сдвиг метки относительно угла обёртки."
  },
  {
    "owner": "GrBadgeWrap",
    "name": "--gr-badge-wrap-offset-y",
    "kind": "hook",
    "default": "-0.5rem (для `dot` — -0.25rem)",
    "description": "Вертикальный сдвиг метки относительно угла обёртки."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-radius",
    "kind": "hook",
    "default": "0.375rem",
    "description": "Скругление кнопки. Его же по умолчанию наследуют внешние углы `GrButtonGroup`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-square-size",
    "kind": "hook",
    "default": "высота кнопки текущей ступени",
    "description": "Сторона квадратной кнопки (`square`): иконка без подписи обязана остаться квадратом на любой ступени."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg",
    "kind": "theme",
    "default": "var(--gr-primary-solid)",
    "description": "Заливка solid-кнопки тона `primary`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg-hover",
    "kind": "theme",
    "default": "var(--gr-primary-solid-hover)",
    "description": "Заливка solid-кнопки тона `primary` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-bg-active",
    "kind": "theme",
    "default": "var(--gr-primary-solid-active)",
    "description": "Заливка solid-кнопки тона `primary` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-fg",
    "kind": "theme",
    "default": "var(--gr-primary-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `primary`. Приходит из `--gr-primary-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `primary`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `primary` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-primary-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-primary) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `primary` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg",
    "kind": "theme",
    "default": "var(--gr-success-solid)",
    "description": "Заливка solid-кнопки тона `success`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg-hover",
    "kind": "theme",
    "default": "var(--gr-success-solid-hover)",
    "description": "Заливка solid-кнопки тона `success` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-bg-active",
    "kind": "theme",
    "default": "var(--gr-success-solid-active)",
    "description": "Заливка solid-кнопки тона `success` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-fg",
    "kind": "theme",
    "default": "var(--gr-success-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `success`. Приходит из `--gr-success-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `success`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `success` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-success-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-success) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `success` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning-solid)",
    "description": "Заливка solid-кнопки тона `warning`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg-hover",
    "kind": "theme",
    "default": "var(--gr-warning-solid-hover)",
    "description": "Заливка solid-кнопки тона `warning` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-bg-active",
    "kind": "theme",
    "default": "var(--gr-warning-solid-active)",
    "description": "Заливка solid-кнопки тона `warning` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-fg",
    "kind": "theme",
    "default": "var(--gr-warning-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `warning`. Приходит из `--gr-warning-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `warning`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `warning` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-warning-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-warning) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `warning` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger-solid)",
    "description": "Заливка solid-кнопки тона `danger`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg-hover",
    "kind": "theme",
    "default": "var(--gr-danger-solid-hover)",
    "description": "Заливка solid-кнопки тона `danger` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-bg-active",
    "kind": "theme",
    "default": "var(--gr-danger-solid-active)",
    "description": "Заливка solid-кнопки тона `danger` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-fg",
    "kind": "theme",
    "default": "var(--gr-danger-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `danger`. Приходит из `--gr-danger-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `danger`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `danger` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-danger-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-danger) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `danger` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg",
    "kind": "theme",
    "default": "var(--gr-info-solid)",
    "description": "Заливка solid-кнопки тона `info`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg-hover",
    "kind": "theme",
    "default": "var(--gr-info-solid-hover)",
    "description": "Заливка solid-кнопки тона `info` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-bg-active",
    "kind": "theme",
    "default": "var(--gr-info-solid-active)",
    "description": "Заливка solid-кнопки тона `info` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-fg",
    "kind": "theme",
    "default": "var(--gr-info-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `info`. Приходит из `--gr-info-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `info`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `info` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-info-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-info) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `info` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate-solid)",
    "description": "Заливка solid-кнопки тона `slate`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg-hover",
    "kind": "theme",
    "default": "var(--gr-slate-solid-hover)",
    "description": "Заливка solid-кнопки тона `slate` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-bg-active",
    "kind": "theme",
    "default": "var(--gr-slate-solid-active)",
    "description": "Заливка solid-кнопки тона `slate` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-fg",
    "kind": "theme",
    "default": "var(--gr-slate-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `slate`. Приходит из `--gr-slate-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `slate`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `slate` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-slate-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-slate) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `slate` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure-solid)",
    "description": "Заливка solid-кнопки тона `azure`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg-hover",
    "kind": "theme",
    "default": "var(--gr-azure-solid-hover)",
    "description": "Заливка solid-кнопки тона `azure` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-bg-active",
    "kind": "theme",
    "default": "var(--gr-azure-solid-active)",
    "description": "Заливка solid-кнопки тона `azure` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-fg",
    "kind": "theme",
    "default": "var(--gr-azure-solid-fg)",
    "description": "Цвет текста на solid-кнопке тона `azure`. Приходит из `--gr-azure-solid-fg`: заливка кнопки рассчитана нести светлый текст, и глобальный `-fg` тона на ней не подходит."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 14%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `azure`."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg-hover",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 18%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `azure` под курсором."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-azure-soft-bg-active",
    "kind": "theme",
    "default": "color-mix(in srgb, var(--gr-azure) 24%, var(--gr-bg))",
    "description": "Заливка soft-кнопки тона `azure` в момент нажатия."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-bg",
    "kind": "theme",
    "default": "var(--gr-disabled-bg)",
    "description": "Заливка недоступной кнопки: она гасится поверхностью, а не прозрачностью. Ссылка на общую роль — недоступное во всём пакете перекрашивается одним местом."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-fg",
    "kind": "theme",
    "default": "var(--gr-disabled-fg)",
    "description": "Цвет текста недоступной кнопки. Ссылка на общую роль недоступного состояния."
  },
  {
    "owner": "GrButton",
    "name": "--gr-button-disabled-brd",
    "kind": "theme",
    "default": "var(--gr-disabled-brd)",
    "description": "Цвет рамки недоступной кнопки. Ссылка на общую роль недоступного состояния."
  },
  {
    "owner": "GrButtonGroup",
    "name": "--gr-button-group-radius",
    "kind": "css",
    "default": "var(--gr-button-radius, 0.375rem)",
    "description": "Скругление внешних углов группы. По умолчанию наследует радиус кнопки — внутренние углы группа гасит сама."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-index",
    "kind": "inline",
    "default": "0",
    "description": "Номер текущего слайда. Компонент присваивает его сам, а сдвиг ленты считает CSS: так позиция переживает серверный рендер и гасится глобальным клампом `prefers-reduced-motion` вместе с переходом."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-drag",
    "kind": "inline",
    "default": "0px",
    "description": "Смещение ленты за указателем на время жеста. Вне жеста — ноль."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Подложка стрелок и тумблера автопрокрутки. Они лежат поверх произвольного содержимого слайда, поэтому подложка обязательна: на светлом кадре иконка без неё пропадает."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-bg-hover",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка стрелки и тумблера под курсором."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-control-fg",
    "kind": "hook",
    "default": "var(--gr-fg)",
    "description": "Цвет иконок стрелок и тумблера."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-gap",
    "kind": "hook",
    "default": "0.5rem",
    "description": "Просвет между переключателями в полосе."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет неактивной точки-индикатора."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-active",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет текущей точки; он же — рамка текущей миниатюры."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-ring-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина обвода вокруг текущей точки. Обвод — второй признак текущего кадра помимо заливки: при диаметре в 8 пикселей одного оттенка мало, и на приглушённом тоне разница почти пропадает."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-ring-offset",
    "kind": "hook",
    "default": "2px",
    "description": "Зазор между точкой и её обводом."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-dot-size",
    "kind": "hook",
    "default": "0.5rem",
    "description": "Диаметр точки-индикатора."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-width",
    "kind": "hook",
    "default": "4rem",
    "description": "Ширина миниатюры в полосе."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumb-height",
    "kind": "hook",
    "default": "2.5rem",
    "description": "Высота миниатюры. Пропорцию задаёт потребитель парой с шириной: у галереи товара и у ленты обложек она разная."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumbs-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края полосы миниатюр. Она же — отступ прокрутки, иначе фокус-кольцо крайней миниатюры оказывается под затуханием."
  },
  {
    "owner": "GrCarousel",
    "name": "--gr-carousel-thumbs-mask",
    "kind": "css",
    "default": "не задана, пока полоса влезает целиком",
    "description": "Маска затухания полосы миниатюр. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Заливка выключенного чипа. Гасить прозрачностью нельзя: она разбавляет выверенные на AA токены текста и роняет контраст."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-fg",
    "kind": "hook",
    "default": "var(--gr-disabled-fg)",
    "description": "Текст выключенного чипа."
  },
  {
    "owner": "GrChip",
    "name": "--gr-chip-disabled-brd",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Рамка выключенного чипа."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-size",
    "kind": "hook",
    "default": "6px",
    "description": "Сторона клетки шахматной подложки под прозрачным цветом."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-light",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Светлая клетка шахматной подложки."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-checker-dark",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Тёмная клетка шахматной подложки."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-hue",
    "kind": "inline",
    "default": "радуга по кругу оттенков",
    "description": "Градиент дорожки оттенка. Задаётся компонентом: через `--gr-slider-rail` градиент не подать — хук уходит в `background-color`."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-saturation",
    "kind": "inline",
    "default": "от серого к насыщенному при текущих оттенке и светлоте",
    "description": "Градиент дорожки насыщенности."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-lightness",
    "kind": "inline",
    "default": "от чёрного через текущий цвет к белому",
    "description": "Градиент дорожки светлоты."
  },
  {
    "owner": "GrColorPicker",
    "name": "--gr-color-picker-track-alpha",
    "kind": "inline",
    "default": "от прозрачного к текущему цвету",
    "description": "Градиент дорожки прозрачности."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-active-bg",
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
    "description": "Фон активного пункта палитры (наведение и клавиатурный курсор)."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-match-bg",
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-primary) 22%, transparent)",
    "description": "Подсветка совпавшей подстроки в подписи пункта."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-item-radius",
    "kind": "hook",
    "default": "10px",
    "description": "Скругление пункта палитры."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-input-font-size",
    "kind": "hook",
    "default": "15px",
    "description": "Кегль строки поиска: крупнее пунктов списка, потому что это единственное поле ввода в оверлее."
  },
  {
    "owner": "GrCommandPalette",
    "name": "--gr-command-list-max-height",
    "kind": "hook",
    "default": "значение пропа `maxHeight` в пикселях",
    "description": "Максимальная высота списка; дальше список скроллится."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-handle",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет ручки перестановки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет полосы, показывающей место вставки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-drag-indicator-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина полосы места вставки колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-resizer",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет полосы изменения ширины колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-resizer-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина полосы изменения ширины колонки."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow",
    "kind": "hook",
    "default": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень на границе группы колонок, закреплённых слева."
  },
  {
    "owner": "GrDataTable",
    "name": "--gr-datatable-pinned-shadow-end",
    "kind": "hook",
    "default": "-4px 0 6px -4px rgba(0, 0, 0, 0.25)",
    "description": "Тень на границе группы колонок, закреплённых справа."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-column-min",
    "kind": "hook",
    "default": "12rem",
    "description": "Минимальная ширина колонки. Ниже неё сетка отдаёт колонку целиком, а не делит её: в тесной колонке значение переносится посимвольно, и число «30» читается как «3» и «0». Порог считается от ширины контейнера, а не вьюпорта."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-value-min",
    "kind": "hook",
    "default": "5rem",
    "description": "Сколько места остаётся значению рядом с подписью при `inline`. Складывается с `labelWidth` в минимальную ширину колонки: колонка шириной с одну подпись выжимает значение в букву на строку."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-label-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет подписи (`<dt>`). Тон задаётся только значению, поэтому подпись перекрашивается отдельно."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-row-gap",
    "kind": "hook",
    "default": "0.375rem (`density=\"compact\"` — 0.125rem)",
    "description": "Зазор между парами. Не ступень общей шкалы: плотность списка характеристик настраивается отдельно от отступов раскладки."
  },
  {
    "owner": "GrDescriptionList",
    "name": "--gr-description-list-divider",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет линии между парами при `divided`."
  },
  {
    "owner": "GrDivider",
    "name": "--gr-divider-thickness",
    "kind": "hook",
    "default": "1px",
    "description": "Толщина разделителя — общая для горизонтального и вертикального."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон плитки. Виден у заглушки целиком, а у картинки — по краям при несовпадении пропорций; на время загрузки место занимает скелет."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-icon",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет иконки вида файла и подписи под ней."
  },
  {
    "owner": "GrFilePreview",
    "name": "--gr-file-preview-radius",
    "kind": "hook",
    "default": "var(--gr-radius-md)",
    "description": "Скругление плитки. Отдельный хук, а не ступень общей шкалы: плитка в ленте документов и плитка в строке списка скругляются по-разному."
  },
  {
    "owner": "GrIcon",
    "name": "--gr-icon-size",
    "kind": "css",
    "default": "var(--gr-icon-size-md, 18px)",
    "description": "Итоговый размер иконки. И обёртка, и вложенный SVG считают себя от него, поэтому размер задаётся одной переменной, а не пропами разметки."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-scrim",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.6)",
    "description": "Затемнение под кадром. Плотнее общего `--gr-overlay-bg`: рядом с фотографией подложка обязана убрать фон целиком, а не приглушить его."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.35)",
    "description": "Фон панелей управления просмотрщика."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg-hover",
    "kind": "theme",
    "default": "rgb(0 0 0 / 0.55)",
    "description": "Фон кнопки хрома под курсором."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-bg-soft",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.1)",
    "description": "Мягкая подложка внутри хрома — счётчик кадров, шкала масштаба."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-fg",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.95)",
    "description": "Основной цвет текста и иконок хрома."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-fg-muted",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.8)",
    "description": "Приглушённый текст хрома — подписи и вторичные значения."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-chrome-brd",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.2)",
    "description": "Цвет рамок внутри хрома."
  },
  {
    "owner": "GrImageViewer",
    "name": "--gr-image-viewer-ring",
    "kind": "theme",
    "default": "rgb(255 255 255 / 0.8)",
    "description": "Focus-ring внутри просмотрщика: общий `--gr-ring` на тёмном хроме не читается."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон панели просмотрщика."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-key",
    "kind": "hook",
    "default": "var(--gr-primary-text)",
    "description": "Цвет имени ключа. Ключ и значение стоят в одной строке через двоеточие, и цвет — единственное, чем они различимы глазом."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-string",
    "kind": "hook",
    "default": "var(--gr-success-text)",
    "description": "Цвет строкового значения."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-number",
    "kind": "hook",
    "default": "var(--gr-azure-text)",
    "description": "Цвет числа. Взят от `azure`, а не от `info`: `info` — синий в двух шагах от индиго `primary`, и пара «ключ ↔ число» сливалась бы в одной строке."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-literal",
    "kind": "hook",
    "default": "var(--gr-warning-text)",
    "description": "Цвет литералов `true`, `false`, `null`."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-punctuation",
    "kind": "hook",
    "default": "var(--gr-fg)",
    "description": "Цвет двоеточия между ключом и значением."
  },
  {
    "owner": "GrJsonViewer",
    "name": "--gr-json-viewer-muted",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет служебного: счётчика у свёрнутой ветки, заглушки «ещё N элементов», значений, которых в JSON не бывает."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color",
    "kind": "inline",
    "default": "`-text`-роль выбранного тона",
    "description": "Цвет ссылки в покое."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color-hover",
    "kind": "inline",
    "default": "подмес `--gr-fg` 8% к базовому цвету",
    "description": "Цвет ссылки под курсором."
  },
  {
    "owner": "GrLink",
    "name": "--gr-link-color-active",
    "kind": "inline",
    "default": "подмес `--gr-fg` 16% к базовому цвету",
    "description": "Цвет ссылки в момент нажатия."
  },
  {
    "owner": "GrNavbar",
    "name": "--gr-navbar-height",
    "kind": "hook",
    "default": "56px",
    "description": "Высота шапки. Ею же считается отступ содержимого под прилипшей шапкой."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-width",
    "kind": "hook",
    "default": "22rem",
    "description": "Потолок ширины панели. Содержимое шире прозы — тулбар, палитра, сетка — снимает потолок значением `100vw`. Шире вьюпорта панель не станет и тогда: этот предел — второй операнд `min()` и снаружи не отключается."
  },
  {
    "owner": "GrPopover",
    "name": "--gr-popover-max-height",
    "kind": "hook",
    "default": "100vh",
    "description": "Потолок высоты панели. По умолчанию мнения нет — высоту диктует место, оставшееся до края вьюпорта (замер слоя `--gr-floating-available-height`). Значение задают, когда панель обязана быть ниже доступного места; выше него она не станет и тогда."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-bg",
    "kind": "theme",
    "default": "var(--gr-primary)",
    "description": "Заливка полосы прогресса по умолчанию."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-neutral-bg",
    "kind": "theme",
    "default": "var(--gr-secondary)",
    "description": "Заливка полосы тона `neutral`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-success-bg",
    "kind": "theme",
    "default": "var(--gr-success)",
    "description": "Заливка полосы тона `success`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-warning-bg",
    "kind": "theme",
    "default": "var(--gr-warning)",
    "description": "Заливка полосы тона `warning`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-danger-bg",
    "kind": "theme",
    "default": "var(--gr-danger)",
    "description": "Заливка полосы тона `danger`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-info-bg",
    "kind": "theme",
    "default": "var(--gr-info)",
    "description": "Заливка полосы тона `info`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-slate-bg",
    "kind": "theme",
    "default": "var(--gr-slate)",
    "description": "Заливка полосы тона `slate`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-azure-bg",
    "kind": "theme",
    "default": "var(--gr-azure)",
    "description": "Заливка полосы тона `azure`."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-buffer-bg",
    "kind": "theme",
    "default": "var(--gr-brd)",
    "description": "Слой буфера позади заливки. Тон не наследует: нейтральный слой между треком и заливкой читается у всех восьми тонов."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-indeterminate-bg",
    "kind": "theme",
    "default": "var(--gr-muted-fg)",
    "description": "Заливка неопределённого режима под `prefers-reduced-motion: reduce`, когда бегущая полоса остановлена."
  },
  {
    "owner": "GrProgressBar",
    "name": "--gr-progress-indeterminate-duration",
    "kind": "hook",
    "default": "1.4s",
    "description": "Период пробега полосы в неопределённом режиме."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-size",
    "kind": "hook",
    "default": "2rem / 3rem / 4rem / 6rem по ступеням `xs…lg`",
    "description": "Диаметр кольца. Геометрия дуги считается в единицах `viewBox`, поэтому масштаб можно менять свободно."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-track",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Цвет дорожки — непройденной части кольца."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-cap",
    "kind": "hook",
    "default": "round",
    "description": "Торец дуги значения: `round` или `butt` для строгой шкалы."
  },
  {
    "owner": "GrProgressCircle",
    "name": "--gr-progress-circle-value-size",
    "kind": "hook",
    "default": "кегль по ступени `size`",
    "description": "Кегль содержимого в центре кольца: свой формат значения может не влезть в дефолтный."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-color",
    "kind": "hook",
    "default": "насыщенный тон (`--gr-<tone>`)",
    "description": "Цвет заполненного символа. Перекрывает тон точечно, не трогая остальные компоненты."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-void-color",
    "kind": "hook",
    "default": "color-mix(in srgb, var(--gr-muted-fg) 35%, transparent)",
    "description": "Цвет незаполненного символа: шкала обязана читаться целиком, а не только заполненной частью."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-symbol-size",
    "kind": "hook",
    "default": "0.875rem / 1rem / 1.25rem / 1.5rem по ступеням `xs…lg`",
    "description": "Размер символа шкалы."
  },
  {
    "owner": "GrRating",
    "name": "--gr-rating-font-size-lg",
    "kind": "hook",
    "default": "15px",
    "description": "Кегль подписи на ступени `lg`: между `md` и `lg` шкалы контролов."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-offset",
    "kind": "inline",
    "default": "0px",
    "description": "Отступ линии активации от верха скроллпорта. Пишется инлайн из пропа `offset`; заданный в каскаде работает общим дефолтом и подхватывается замером. Почти всегда равен `--gr-affix-offset` липкой шапки."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-marker",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет рельса у активного пункта. Один из трёх признаков активности — рядом с ним меняются вес и цвет текста."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-rail",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет рельса у остальных пунктов."
  },
  {
    "owner": "GrScrollSpy",
    "name": "--gr-scroll-spy-indent",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Шаг отступа для вложенного уровня оглавления."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-bg",
    "kind": "inline",
    "default": "var(--gr-muted); в варианте `solid` — var(--gr-card)",
    "description": "Фон дорожки переключателя."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-brd",
    "kind": "inline",
    "default": "var(--gr-brd)",
    "description": "Цвет рамки дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-track-shadow",
    "kind": "inline",
    "default": "none; в варианте `solid` — var(--gr-shadow-1)",
    "description": "Тень дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-bg",
    "kind": "inline",
    "default": "var(--gr-card); в варианте `primary` — var(--gr-primary)",
    "description": "Заливка бегунка под выбранным пунктом."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-brd",
    "kind": "inline",
    "default": "подмес `--gr-fg` к фону дорожки",
    "description": "Цвет рамки бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-shadow",
    "kind": "inline",
    "default": "var(--gr-shadow-1); в варианте `solid` — var(--gr-shadow-2)",
    "description": "Тень бегунка — она отделяет его от дорожки."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-indicator-highlight-shadow",
    "kind": "hook",
    "default": "0 0 0 0 transparent",
    "description": "Дополнительная подсветка бегунка: по умолчанию выключена, включается темой поверх основной тени."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-color",
    "kind": "inline",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет невыбранного пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-hover-color",
    "kind": "inline",
    "default": "var(--gr-fg)",
    "description": "Цвет пункта под курсором."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-selected-color",
    "kind": "inline",
    "default": "var(--gr-fg); в варианте `primary` — var(--gr-primary-fg)",
    "description": "Цвет выбранного пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-px",
    "kind": "inline",
    "default": "10px / 12px / 14px / 16px по ступеням `xs…lg`",
    "description": "Горизонтальные поля пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-item-py",
    "kind": "inline",
    "default": "4px / 6px / 8px / 10px по ступеням `xs…lg`",
    "description": "Вертикальные поля пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-min-height",
    "kind": "inline",
    "default": "24px / 28px / 40px / 46px по ступеням `xs…lg`",
    "description": "Минимальная высота дорожки: переключатель обязан вставать в строку с контролами той же ступени."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-padding",
    "kind": "inline",
    "default": "4px",
    "description": "Внутренний отступ дорожки вокруг бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-radius",
    "kind": "inline",
    "default": "9999px",
    "description": "Скругление дорожки и бегунка."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-font-size",
    "kind": "inline",
    "default": "0.75rem / 0.875rem / 0.9375rem по ступеням",
    "description": "Кегль подписи пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-font-weight",
    "kind": "inline",
    "default": "600",
    "description": "Начертание подписи пункта."
  },
  {
    "owner": "GrSegmented",
    "name": "--gr-segmented-line-height",
    "kind": "inline",
    "default": "1rem / 1.25rem по ступеням",
    "description": "Межстрочный интервал подписи пункта."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-fill",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет пройденной части трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-rail",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет непройденной части трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-track-height",
    "kind": "hook",
    "default": "0.1875rem / 0.25rem / 0.375rem / 0.5rem по ступеням `xs…lg`",
    "description": "Толщина трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-size",
    "kind": "hook",
    "default": "0.75rem / 0.875rem / 1rem / 1.25rem по ступеням `xs…lg`",
    "description": "Диаметр ползунка."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-bg",
    "kind": "hook",
    "default": "var(--gr-bg)",
    "description": "Заливка ползунка."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-thumb-border",
    "kind": "hook",
    "default": "var(--gr-slider-fill, var(--gr-primary))",
    "description": "Цвет рамки ползунка. По умолчанию совпадает с заливкой трека."
  },
  {
    "owner": "GrSlider",
    "name": "--gr-slider-length",
    "kind": "hook",
    "default": "10rem",
    "description": "Длина вертикального слайдера: горизонтальный тянется по ширине контейнера, вертикальному нужна явная высота."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-handle-size",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Размер ручки переноса."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-handle-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет ручки переноса."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-row-bg-active",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Фон строки, которую переносят указателем или держат с клавиатуры."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет линии, показывающей место вставки."
  },
  {
    "owner": "GrSortableList",
    "name": "--gr-sortable-indicator-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина линии места вставки."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-size",
    "kind": "hook",
    "default": "6px",
    "description": "Толщина полосы разделителя — ширина её грид-трека."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-hit",
    "kind": "hook",
    "default": "4px",
    "description": "Запас зоны захвата с каждой стороны полосы: мишень в шесть пикселей мышью не берётся."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-color",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет разделителя в покое."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-hover-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет разделителя под курсором."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-active-color",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет разделителя во время перетаскивания."
  },
  {
    "owner": "GrSplitter",
    "name": "--gr-splitter-grip",
    "kind": "hook",
    "default": "24px",
    "description": "Длина насечки посередине разделителя. `0` убирает её."
  },
  {
    "owner": "GrStatistic",
    "name": "--gr-statistic-title-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет подписи над значением."
  },
  {
    "owner": "GrStatistic",
    "name": "--gr-statistic-value-color",
    "kind": "hook",
    "default": "`-text`-роль выбранного тона",
    "description": "Цвет самого значения."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-marker-size",
    "kind": "inline",
    "default": "1.25rem / 1.5rem / 1.75rem / 2rem по ступеням `xs…lg`",
    "description": "Диаметр маркера шага. Задаётся ступенью размера и служит опорой для соединителя: линия центруется по этому значению."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-size",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина линии между шагами."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-done",
    "kind": "hook",
    "default": "var(--gr-primary-solid)",
    "description": "Цвет пройденного участка линии."
  },
  {
    "owner": "GrSteps",
    "name": "--gr-steps-connector-pending",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет непройденного участка линии."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-bg",
    "kind": "inline",
    "default": "var(--gr-primary) во включённом состоянии, var(--gr-muted) в выключенном, var(--gr-disabled-bg) в недоступном",
    "description": "Заливка дорожки переключателя."
  },
  {
    "owner": "GrSwitch",
    "name": "--gr-switch-track-brd",
    "kind": "inline",
    "default": "var(--gr-primary) / var(--gr-brd) / var(--gr-disabled-brd)",
    "description": "Цвет рамки дорожки переключателя."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-scroll-fade",
    "kind": "hook",
    "default": "1.5rem",
    "description": "Ширина затухания у края горизонтального ряда вкладок — того края, за которым ряд продолжается. Тем же значением задан `scroll-padding` ряда, поэтому вкладка, подтянутая в видимую часть, не встаёт под затухание."
  },
  {
    "owner": "GrTabs",
    "name": "--gr-tabs-mask",
    "kind": "css",
    "default": "не задана, пока ряд влезает целиком",
    "description": "Маска затухания. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет. Вертикальный ряд не прокручивается, и маски у него нет."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-axis-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина оси ленты."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-axis-color",
    "kind": "hook",
    "default": "var(--gr-brd)",
    "description": "Цвет оси и пунктира у незавершённых событий."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-size",
    "kind": "hook",
    "default": "10px",
    "description": "Диаметр точки события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-ring",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина обводки полой точки (`variant=\"outlined\"`, `pending`)."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-marker-top",
    "kind": "hook",
    "default": "0.35rem",
    "description": "Отступ точки сверху: выравнивает её по первой строке текста события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-gap",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Расстояние между колонками ленты — осью, меткой времени и содержимым."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-line-min",
    "kind": "hook",
    "default": "0.75rem",
    "description": "Минимальная длина отрезка оси: без неё однострочное событие обрывало бы линию."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-time-width",
    "kind": "hook",
    "default": "5.5rem",
    "description": "Ширина колонки времени в `layout=\"time\"`."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-dash",
    "kind": "hook",
    "default": "4px",
    "description": "Шаг пунктира на отрезке оси после незавершённого события."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-item-min-width",
    "kind": "hook",
    "default": "12rem",
    "description": "Ширина колонки события в горизонтальной ленте."
  },
  {
    "owner": "GrTimeline",
    "name": "--gr-timeline-columns",
    "kind": "css",
    "default": "`auto minmax(0, 1fr)`, а по раскладкам — с колонкой времени либо симметричная",
    "description": "Сетка колонок ленты. Задаётся собственным CSS компонента по `layout`; строка события и заголовок группы делят её, чтобы ось у них совпадала. Гибкие треки объявлены `minmax(0, 1fr)`, а не `1fr`: голый `1fr` держит минимум по содержимому, и лента не сжималась бы в узкой колонке."
  },
  {
    "owner": "GrToaster",
    "name": "--gr-toaster-width",
    "kind": "css",
    "default": "360px",
    "description": "Ширина стека тостов. Проп `width` задаёт её же, поэтому одно и то же настраивается и разметкой, и темой."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-panel-max-h",
    "kind": "hook",
    "default": "18rem",
    "description": "Высота панели. Обе панели обязаны быть одной высоты и прокручиваться внутри себя — иначе перенос двигает вёрстку страницы под курсором."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-fade",
    "kind": "hook",
    "default": "1.25rem",
    "description": "Высота затухания у края списка. Полоса прокрутки панели на части систем невидима, и без затухания обрезанная посередине строка читается как дефект отрисовки."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-list-mask",
    "kind": "css",
    "default": "не задана, пока список влезает целиком",
    "description": "Маска затухания списка. Задаётся собственным CSS компонента по `data-overflow`: у какого края есть продолжение, тот и гаснет."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-selected-bg",
    "kind": "hook",
    "default": "12 % от `--gr-primary` через `color-mix`",
    "description": "Подложка отмеченной строки. Тон, а не заливка: текст остаётся обычным `--gr-fg`, и контраст не приходится выверять заново."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-arrived-bg",
    "kind": "hook",
    "default": "32 % от `--gr-primary` через `color-mix`",
    "description": "Начальный кадр подсветки строки, только что приехавшей из соседней панели. Подсветка гаснет сама и под `prefers-reduced-motion` не показывается вовсе."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-dragging-bg",
    "kind": "hook",
    "default": "var(--gr-muted)",
    "description": "Подложка строк, которые сейчас переносят указателем: видно, что именно уедет."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-ghost-bg",
    "kind": "hook",
    "default": "var(--gr-card)",
    "description": "Подложка предпросмотра, который едет за курсором. Он и есть ответ на «где сейчас элемент»: без него строка оставалась на месте, и жест выглядел так, будто ничего не происходит."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-drop-bg",
    "kind": "hook",
    "default": "6 % от `--gr-primary` через `color-mix`",
    "description": "Подложка панели-приёмника. Одной рамки мало: на широком экране она за пределами взгляда, занятого курсором."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-drop-brd",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Рамка панели под указателем во время переноса."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-indicator",
    "kind": "hook",
    "default": "var(--gr-primary)",
    "description": "Цвет линии, показывающей место вставки."
  },
  {
    "owner": "GrTransfer",
    "name": "--gr-transfer-indicator-width",
    "kind": "hook",
    "default": "2px",
    "description": "Толщина линии места вставки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-gap",
    "kind": "css",
    "default": "2px",
    "description": "Просвет между строками дерева."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-children-pl",
    "kind": "css",
    "default": "10px",
    "description": "Отступ вложенного списка от левого края родителя."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-indent-step",
    "kind": "css",
    "default": "calc(12px + var(--gr-tree-children-pl) + var(--gr-tree-branch-line-width))",
    "description": "Шаг отступа уровня. Складывается из переключателя, отступа вложенного списка и толщины направляющей — линия обязана попадать ровно между ними."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-indent",
    "kind": "inline",
    "default": "шаг отступа × глубина узла",
    "description": "Готовый отступ конкретной строки: шаг уровня, умноженный на её глубину."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-min-height",
    "kind": "inline",
    "default": "22px / 24px / 28px / 32px по ступеням `xs…lg`",
    "description": "Минимальная высота строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-px",
    "kind": "inline",
    "default": "4px / 6px / 8px / 10px по ступеням `xs…lg`",
    "description": "Горизонтальные поля строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-py",
    "kind": "inline",
    "default": "3px / 5px / 8px / 10px по ступеням `xs…lg`",
    "description": "Вертикальные поля строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-pr",
    "kind": "css",
    "default": "var(--gr-tree-row-px)",
    "description": "Правое поле строки — отдельно от левого: справа часто стоят действия узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-radius",
    "kind": "css",
    "default": "8px",
    "description": "Скругление подсветки строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-color",
    "kind": "css",
    "default": "var(--gr-fg)",
    "description": "Цвет текста строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-primary) 10%, transparent)",
    "description": "Фон строки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-primary) 14%, transparent)",
    "description": "Фон текущей (выбранной) строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-primary) 16%, transparent)",
    "description": "Фон текущей строки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-color",
    "kind": "css",
    "default": "var(--gr-tree-row-color)",
    "description": "Цвет текста выбранной строки. Отдельно от --gr-tree-row-color, потому что насыщенная подложка выбора требует своего текста: без этого сплошную плашку выбора нельзя сделать читаемой."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bar-width",
    "kind": "css",
    "default": "0px",
    "description": "Ширина полосы у левого края выбранной строки. По умолчанию полосы нет; вид, отмечающий выбор без подложки, включает её одной строкой. Рисуется на самой строке, поэтому стоит у края списка, а не уезжает вправо с отступом уровня."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-row-current-bar-color",
    "kind": "css",
    "default": "var(--gr-primary)",
    "description": "Цвет полосы у выбранной строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-font-weight",
    "kind": "css",
    "default": "600",
    "description": "Начертание подписи ветки. Плотнее листа, чтобы ветка и лист не выглядели одинаково. Гасится там, где вес несёт уровень, а не ветвистость."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-font-size",
    "kind": "inline",
    "default": "12px / 13px / inherit / 15px по ступеням `xs…lg`",
    "description": "Кегль подписи узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-content-gap",
    "kind": "inline",
    "default": "4px / 6px / 8px / 10px по ступеням `xs…lg`",
    "description": "Просвет между иконкой и подписью узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-icon-size",
    "kind": "inline",
    "default": "12px / 14px / 16px / 20px по ступеням `xs…lg`",
    "description": "Размер иконки узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-size",
    "kind": "inline",
    "default": "18px / 20px / 24px / 28px по ступеням `xs…lg`",
    "description": "Размер кнопки разворота ветки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-mr",
    "kind": "css",
    "default": "0",
    "description": "Отступ кнопки разворота от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-radius",
    "kind": "css",
    "default": "6px",
    "description": "Скругление кнопки разворота."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-color",
    "kind": "css",
    "default": "inherit",
    "description": "Цвет стрелки разворота."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-muted) 25%, transparent)",
    "description": "Фон кнопки разворота под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-toggle-hover-color",
    "kind": "css",
    "default": "var(--gr-tree-toggle-color)",
    "description": "Цвет стрелки разворота под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-size",
    "kind": "inline",
    "default": "18px / 20px / 24px / 28px по ступеням `xs…lg`",
    "description": "Размер ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-mr",
    "kind": "css",
    "default": "0",
    "description": "Отступ ручки перетаскивания от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-radius",
    "kind": "css",
    "default": "6px",
    "description": "Скругление ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-color",
    "kind": "css",
    "default": "inherit",
    "description": "Цвет ручки перетаскивания."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-opacity",
    "kind": "css",
    "default": "0.55",
    "description": "Прозрачность ручки в покое: ручка не должна спорить с подписью узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-bg",
    "kind": "css",
    "default": "color-mix(in srgb, var(--gr-muted) 22%, transparent)",
    "description": "Фон ручки перетаскивания под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-color",
    "kind": "css",
    "default": "var(--gr-tree-drag-handle-color)",
    "description": "Цвет ручки перетаскивания под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-hover-opacity",
    "kind": "css",
    "default": "0.9",
    "description": "Прозрачность ручки под курсором."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-drag-handle-disabled-opacity",
    "kind": "css",
    "default": "0.25",
    "description": "Прозрачность ручки у узла, который перетаскивать нельзя."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-size",
    "kind": "css",
    "default": "16px",
    "description": "Сторона коробки чекбокса узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-radius",
    "kind": "css",
    "default": "4px",
    "description": "Скругление коробки чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-mr",
    "kind": "css",
    "default": "4px",
    "description": "Отступ чекбокса от содержимого узла."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-bg",
    "kind": "css",
    "default": "transparent",
    "description": "Фон невыбранного чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-brd",
    "kind": "css",
    "default": "var(--gr-brd)",
    "description": "Цвет рамки чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-checked-bg",
    "kind": "css",
    "default": "var(--gr-primary)",
    "description": "Фон отмеченного чекбокса."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-checkbox-checked-fg",
    "kind": "css",
    "default": "var(--gr-primary-fg)",
    "description": "Цвет галочки в отмеченном чекбоксе."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-width",
    "kind": "css",
    "default": "2px",
    "description": "Толщина направляющей линии уровня."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-elbow-width",
    "kind": "css",
    "default": "8px",
    "description": "Длина горизонтального колена от направляющей к строке при branchLine=\"elbow\". Колено соединяет узлы, а не только отмечает уровень."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-offset",
    "kind": "css",
    "default": "12px",
    "description": "Сдвиг направляющей от левого края строки."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-default-color",
    "kind": "css",
    "default": "var(--gr-tree-row-current-bg)",
    "description": "Цвет направляющей по умолчанию."
  },
  {
    "owner": "GrTree",
    "name": "--gr-tree-branch-line-color",
    "kind": "inline",
    "default": "var(--gr-tree-branch-line-default-color)",
    "description": "Цвет направляющей конкретной ветки — им подсвечивается путь до текущего узла."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-color",
    "kind": "hook",
    "default": "цвет величины (наследуется)",
    "description": "Цвет приписки перед значением. По умолчанию наследует цвет величины: знак валюты — часть суммы, и краснеть при отрицательном значении обязан вместе с ней."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-size",
    "kind": "hook",
    "default": "кегль величины (наследуется)",
    "description": "Кегль приписки перед значением. По умолчанию равен кеглю самой величины: приглушённый и уменьшенный знак валюты читается подписью рядом с числом, а не его частью."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-prefix-gap",
    "kind": "hook",
    "default": "0",
    "description": "Отбивка между припиской и значением. По умолчанию нулевая: «$ 14,99» с зазором читается как опечатка."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-color",
    "kind": "hook",
    "default": "var(--gr-muted-fg)",
    "description": "Цвет приписки после значения. По умолчанию приглушён: там обычно единица измерения, а она величине не принадлежит. Валюта справа (`100 ₽`) — случай обратный, и цвет для неё снимают этим токеном."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-size",
    "kind": "hook",
    "default": "0.85em",
    "description": "Кегль приписки после значения. Доля от кегля величины, а не ступень шкалы: примитив своей шкалы размеров не имеет и набирается кеглем места, где стоит."
  },
  {
    "owner": "GrValue",
    "name": "--gr-value-suffix-gap",
    "kind": "hook",
    "default": "0.25rem",
    "description": "Отбивка между значением и припиской после него. Задаётся логическим отступом, поэтому в RTL встаёт с нужной стороны."
  },
  {
    "owner": "composables",
    "name": "--gr-virtual-before",
    "kind": "inline",
    "default": "0px",
    "description": "Высота спейсера перед первым отрисованным элементом виртуального списка. Ставится `useVirtualList` и читается через `[data-gr-virtual]::before` — потребители (`GrList`, `GrSelect`, `GrTree`, `GrAutocomplete`, `GrCommandPalette`) свою копию не заводят."
  },
  {
    "owner": "composables",
    "name": "--gr-virtual-after",
    "kind": "inline",
    "default": "0px",
    "description": "Высота спейсера после последнего отрисованного элемента виртуального списка."
  },
  {
    "owner": "composables",
    "name": "--gr-floating-available-height",
    "kind": "inline",
    "default": "100vh",
    "description": "Место, оставшееся до края вьюпорта на той стороне, куда `useFloating` поставил панель. Ставится инлайново при каждом пересчёте позиции — в том числе на скролле и ресайзе — и читается панелью как второй операнд потолка высоты (`GrPopover`). Слой сообщает замер, но не применяет его: скролл принадлежит содержимому панели. Значение по умолчанию — фолбэк на первый кадр, пока позиция ещё не посчитана."
  }
]
