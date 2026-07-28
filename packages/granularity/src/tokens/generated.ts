// СГЕНЕРИРОВАНО `yarn generate:tokens` из `tokens/*.json` — правки здесь потеряются.

import type { GrDerivedToken, GrFoundationToken, GrThemeToken } from './types'

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
    "name": "--gr-radius-sm",
    "value": "4px",
    "section": "Shapes: radii and compatibility aliases",
    "description": "Радиус скругления `sm` для углов компонентов и поверхностей."
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
    "values": {
      "light": "#838a97",
      "dark": "#8c94a0"
    }
  },
  {
    "name": "--gr-destructive-hover",
    "section": "Derived interaction formulas: action roles",
    "description": "Hover-состояние destructive action: подмес `--gr-fg` 8% в `--gr-destructive`.",
    "formula": "color-mix(in srgb, var(--gr-destructive) 92%, var(--gr-fg))",
    "values": {
      "light": "#cc2526",
      "dark": "#f05353"
    }
  },
  {
    "name": "--gr-destructive-active",
    "section": "Derived interaction formulas: action roles",
    "description": "Active-состояние destructive action: подмес `--gr-fg` 16% в `--gr-destructive`.",
    "formula": "color-mix(in srgb, var(--gr-destructive) 84%, var(--gr-fg))",
    "values": {
      "light": "#bb2427",
      "dark": "#f06161"
    }
  },
  {
    "name": "--gr-success-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние success-ролей: подмес `--gr-fg` 8% в `--gr-success`.",
    "formula": "color-mix(in srgb, var(--gr-success) 92%, var(--gr-fg))",
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
    "values": {
      "light": "#524bdc",
      "dark": "#8b95f8"
    }
  },
  {
    "name": "--gr-info-active",
    "section": "Derived interaction formulas: status roles",
    "description": "Active-состояние info-ролей: подмес `--gr-fg` 16% в `--gr-info`.",
    "formula": "color-mix(in srgb, var(--gr-info) 84%, var(--gr-fg))",
    "values": {
      "light": "#4c47cd",
      "dark": "#949ef9"
    }
  },
  {
    "name": "--gr-slate-hover",
    "section": "Derived interaction formulas: status roles",
    "description": "Hover-состояние slate-ролей: подмес `--gr-fg` 8% в `--gr-slate`.",
    "formula": "color-mix(in srgb, var(--gr-slate) 92%, var(--gr-fg))",
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
    "name": "--gr-destructive",
    "section": "Action roles",
    "description": "Цвет destructive action-сценариев и критических состояний.",
    "values": {
      "light": "#dc2626",
      "dark": "#ef4444"
    }
  },
  {
    "name": "--gr-destructive-fg",
    "section": "Action roles",
    "description": "Контрастный текст и иконки поверх destructive-заливки.",
    "values": {
      "light": "#ffffff",
      "dark": "#ffffff"
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
      "dark": "#064e3b"
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
      "dark": "#7c2d12"
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
      "dark": "#7f1d1d"
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
      "light": "#5850ec",
      "dark": "#818cf8"
    }
  },
  {
    "name": "--gr-info-light",
    "section": "Status roles",
    "description": "Облегчённая info-подложка для спокойных информационных блоков.",
    "values": {
      "light": "#e0e7ff",
      "dark": "#312e81"
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
      "light": "#3730a3",
      "dark": "#c7d2fe"
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
      "dark": "#334155"
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
      "dark": "#0c4a6e"
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
      "dark": "#6366f1"
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
  }
]
