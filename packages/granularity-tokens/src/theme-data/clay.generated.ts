// СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются.

import type { GrThemeData } from '../types'

/** Полные данные темы `clay`: наследование `extends` раскрыто. */
const data: GrThemeData = {
  "id": "clay",
  "title": "Глина",
  "description": "Тёплая бумага, графитовые чернила и одна глиняная точка на экран.",
  "docs": "https://granularity.tech/themes/clay",
  "version": "1.0.0",
  "targets": {
    "@feugene/granularity": "^3.0.0"
  },
  "root": {
    "gr-slate-0": "#ffffff",
    "gr-slate-50": "#f8fafc",
    "gr-slate-100": "#f1f5f9",
    "gr-slate-200": "#e2e8f0",
    "gr-slate-300": "#cbd5e1",
    "gr-slate-400": "#94a3b8",
    "gr-slate-500": "#64748b",
    "gr-slate-600": "#475569",
    "gr-slate-700": "#334155",
    "gr-slate-800": "#1e293b",
    "gr-slate-900": "#0f172a",
    "gr-font-ui": "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    "gr-font-mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    "gr-text-2xs": "10px",
    "gr-text-xs": "12px",
    "gr-text-sm": "14px",
    "gr-text-base": "16px",
    "gr-text-lg": "18px",
    "gr-text-xl": "20px",
    "gr-text-2xl": "24px",
    "gr-text-3xl": "30px",
    "gr-text-4xl": "36px",
    "gr-control-text-3xs": "10px",
    "gr-control-text-2xs": "11px",
    "gr-control-text-xs": "12px",
    "gr-control-text-sm": "13px",
    "gr-control-text-md": "14px",
    "gr-control-text-lg": "16px",
    "gr-leading-2xs": "0.875rem",
    "gr-leading-xs": "1rem",
    "gr-leading-sm": "1.25rem",
    "gr-leading-base": "1.5rem",
    "gr-leading-lg": "1.625rem",
    "gr-leading-xl": "1.75rem",
    "gr-leading-3xl": "2.25rem",
    "gr-control-leading-3xs": "14px",
    "gr-control-leading-2xs": "16px",
    "gr-control-leading-xs": "16px",
    "gr-control-leading-sm": "18px",
    "gr-control-leading-md": "20px",
    "gr-control-leading-lg": "24px",
    "gr-leading-tight": "1.25",
    "gr-leading-normal": "1.5",
    "gr-leading-relaxed": "1.625",
    "gr-font-regular": "400",
    "gr-font-medium": "500",
    "gr-font-semibold": "600",
    "gr-font-bold": "700",
    "gr-space-0": "0px",
    "gr-space-1": "4px",
    "gr-space-2": "8px",
    "gr-space-3": "12px",
    "gr-space-4": "16px",
    "gr-space-5": "20px",
    "gr-space-6": "24px",
    "gr-space-8": "32px",
    "gr-space-10": "40px",
    "gr-space-12": "48px",
    "gr-space-16": "64px",
    "gr-space-20": "80px",
    "gr-space-24": "96px",
    "gr-space-32": "128px",
    "gr-space-40": "160px",
    "gr-space-48": "192px",
    "gr-space-64": "256px",
    "gr-container-max": "1280px",
    "gr-container-max-2xl": "1440px",
    "gr-container-padding-mobile": "16px",
    "gr-container-padding-tablet": "24px",
    "gr-container-padding-desktop": "32px",
    "gr-bp-sm": "640px",
    "gr-bp-md": "768px",
    "gr-bp-lg": "1024px",
    "gr-bp-xl": "1280px",
    "gr-bp-2xl": "1536px",
    "gr-icon-size-xs": "14px",
    "gr-icon-size-sm": "16px",
    "gr-icon-size-md": "18px",
    "gr-icon-size-lg": "20px",
    "radius": "0.5rem",
    "gr-radius-none": "0px",
    "gr-radius-xs": "3px",
    "gr-radius-sm": "4px",
    "gr-radius-control": "6px",
    "gr-radius-md": "8px",
    "gr-radius-lg": "12px",
    "gr-radius-xl": "16px",
    "gr-radius-full": "9999px",
    "gr-shadow-0": "none",
    "gr-duration-fast": "150ms",
    "gr-duration-base": "200ms",
    "gr-duration-slow": "300ms",
    "gr-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
    "gr-ease-in": "cubic-bezier(0.7, 0, 0.84, 0)",
    "gr-z-bottom-nav": "850",
    "gr-z-navbar": "900",
    "gr-z-dropdown": "1000",
    "gr-z-tooltip": "1050",
    "gr-z-modal": "1100",
    "gr-z-loading": "1150",
    "gr-z-toast": "1200"
  },
  "modes": {
    "light": {
      "title": "Светлый",
      "colorScheme": "light",
      "tokens": {
        "gr-bg": "#f5f2ea",
        "gr-fg": "#1c1b18",
        "gr-card": "#fdfbf6",
        "gr-card-fg": "#1c1b18",
        "gr-popover": "#fdfbf6",
        "gr-popover-fg": "#1c1b18",
        "gr-muted": "#ece8de",
        "gr-muted-fg": "#5b5850",
        "gr-secondary": "#e4dfd3",
        "gr-secondary-fg": "#26241f",
        "gr-overlay-bg": "rgb(28 27 24 / 0.45)",
        "gr-brd": "#dfd9cc",
        "gr-input": "#dfd9cc",
        "gr-control-brd": "#7a756a",
        "gr-ring": "#2d6cc8",
        "gr-disabled-bg": "#edeae2",
        "gr-disabled-fg": "#a19d93",
        "gr-disabled-brd": "#e2ddd1",
        "gr-invalid-brd": "var(--gr-danger)",
        "gr-invalid-ring": "var(--gr-danger)",
        "gr-invalid-text": "var(--gr-danger-text)",
        "gr-primary": "#d27a55",
        "gr-primary-fg": "#1c1b18",
        "gr-accent": "#f6e5db",
        "gr-accent-fg": "#8a3b1c",
        "gr-success": "#7f9a5c",
        "gr-success-light": "#e4ead8",
        "gr-success-fg": "#1c1b18",
        "gr-primary-text": "#8a3b1c",
        "gr-success-text": "#3e5426",
        "gr-warning": "#d1a43c",
        "gr-warning-light": "#f4e9cc",
        "gr-warning-fg": "#1c1b18",
        "gr-warning-text": "#6a4c0b",
        "gr-danger": "#b2443a",
        "gr-danger-light": "#f6ddd8",
        "gr-danger-fg": "#fdfbf6",
        "gr-danger-text": "#972821",
        "gr-info": "#2f69ba",
        "gr-info-light": "#dfe3f6",
        "gr-info-fg": "#fdfbf6",
        "gr-info-text": "#1e4985",
        "gr-slate": "#585650",
        "gr-slate-light": "#e7e4dd",
        "gr-slate-fg": "#fdfbf6",
        "gr-slate-text": "#3d3b36",
        "gr-azure": "#6e9fcd",
        "gr-azure-light": "#d9eef2",
        "gr-azure-fg": "#1c1b18",
        "gr-azure-text": "#2b5880",
        "gr-primary-solid": "var(--gr-primary)",
        "gr-primary-solid-hover": "var(--gr-primary-hover)",
        "gr-primary-solid-active": "var(--gr-primary-active)",
        "gr-primary-solid-fg": "var(--gr-primary-fg)",
        "gr-success-solid": "var(--gr-success)",
        "gr-success-solid-hover": "var(--gr-success-hover)",
        "gr-success-solid-active": "var(--gr-success-active)",
        "gr-success-solid-fg": "var(--gr-success-fg)",
        "gr-warning-solid": "var(--gr-warning)",
        "gr-warning-solid-hover": "var(--gr-warning-hover)",
        "gr-warning-solid-active": "var(--gr-warning-active)",
        "gr-warning-solid-fg": "var(--gr-warning-fg)",
        "gr-danger-solid": "var(--gr-danger)",
        "gr-danger-solid-hover": "var(--gr-danger-hover)",
        "gr-danger-solid-active": "var(--gr-danger-active)",
        "gr-danger-solid-fg": "var(--gr-danger-fg)",
        "gr-info-solid": "var(--gr-info)",
        "gr-info-solid-hover": "var(--gr-info-hover)",
        "gr-info-solid-active": "var(--gr-info-active)",
        "gr-info-solid-fg": "var(--gr-info-fg)",
        "gr-slate-solid": "var(--gr-slate)",
        "gr-slate-solid-hover": "var(--gr-slate-hover)",
        "gr-slate-solid-active": "var(--gr-slate-active)",
        "gr-slate-solid-fg": "var(--gr-slate-fg)",
        "gr-azure-solid": "var(--gr-azure)",
        "gr-azure-solid-hover": "var(--gr-azure-hover)",
        "gr-azure-solid-active": "var(--gr-azure-active)",
        "gr-azure-solid-fg": "var(--gr-azure-fg)",
        "gr-chart-1": "#c05b36",
        "gr-chart-2": "#5f7a1c",
        "gr-chart-3": "#2f68b8",
        "gr-chart-4": "#a8407a",
        "gr-chart-5": "#0d7d8c",
        "gr-sidebar": "#efebe2",
        "gr-sidebar-fg": "#1c1b18",
        "gr-sidebar-primary": "#26241f",
        "gr-sidebar-primary-fg": "#fdfbf6",
        "gr-sidebar-accent": "#e4dfd3",
        "gr-sidebar-accent-fg": "#26241f",
        "gr-sidebar-brd": "#dfd9cc",
        "gr-sidebar-ring": "#2d6cc8",
        "gr-shadow-1": "0 1px 2px rgba(28, 27, 24, 0.08)",
        "gr-shadow-2": "0 8px 24px rgba(28, 27, 24, 0.13)",
        "gr-shadow-3": "0 16px 48px rgba(28, 27, 24, 0.18)",
        "gr-primary-hover": "color-mix(in srgb, var(--gr-primary) 88%, var(--gr-card))",
        "gr-primary-active": "color-mix(in srgb, var(--gr-primary) 80%, var(--gr-card))",
        "gr-success-hover": "color-mix(in srgb, var(--gr-success) 88%, var(--gr-card))",
        "gr-success-active": "color-mix(in srgb, var(--gr-success) 80%, var(--gr-card))",
        "gr-warning-hover": "color-mix(in srgb, var(--gr-warning) 88%, var(--gr-card))",
        "gr-warning-active": "color-mix(in srgb, var(--gr-warning) 80%, var(--gr-card))",
        "gr-azure-hover": "color-mix(in srgb, var(--gr-azure) 88%, var(--gr-card))",
        "gr-azure-active": "color-mix(in srgb, var(--gr-azure) 80%, var(--gr-card))"
      },
      "fallbacks": [
        {
          "supports": "not (color: color-mix(in srgb, #000 50%, #fff))",
          "tokens": {
            "gr-primary-hover": "#d78968",
            "gr-primary-active": "#db9475",
            "gr-secondary-hover": "#d4cfc4",
            "gr-secondary-active": "#c4c0b5",
            "gr-brd-hover": "#a5a096",
            "gr-brd-active": "#87847b",
            "gr-success-hover": "#8ea66e",
            "gr-success-active": "#98ad7b",
            "gr-warning-hover": "#d6ae52",
            "gr-warning-active": "#dab561",
            "gr-danger-hover": "#a64137",
            "gr-danger-active": "#9a3d35",
            "gr-info-hover": "#2d63ad",
            "gr-info-active": "#2c5da0",
            "gr-slate-hover": "#53514c",
            "gr-slate-active": "#4e4d47",
            "gr-azure-hover": "#7faad2",
            "gr-azure-active": "#8bb1d5"
          }
        }
      ]
    },
    "dark": {
      "title": "Тёмный",
      "colorScheme": "dark",
      "tokens": {
        "gr-bg": "#242320",
        "gr-fg": "#f2efe7",
        "gr-card": "#2e2d29",
        "gr-card-fg": "#f2efe7",
        "gr-popover": "#2e2d29",
        "gr-popover-fg": "#f2efe7",
        "gr-muted": "#3a3934",
        "gr-muted-fg": "#b6b2a8",
        "gr-secondary": "#3a3934",
        "gr-secondary-fg": "#ece8de",
        "gr-overlay-bg": "rgb(10 10 9 / 0.65)",
        "gr-brd": "#45433d",
        "gr-input": "#45433d",
        "gr-control-brd": "#8f8b80",
        "gr-ring": "#6fa2e2",
        "gr-disabled-bg": "#33322d",
        "gr-disabled-fg": "#77746b",
        "gr-disabled-brd": "#45433d",
        "gr-invalid-brd": "var(--gr-danger)",
        "gr-invalid-ring": "var(--gr-danger)",
        "gr-invalid-text": "var(--gr-danger-text)",
        "gr-primary": "#d98a66",
        "gr-primary-fg": "#1c1b18",
        "gr-accent": "#4a2f23",
        "gr-accent-fg": "#f1c4ae",
        "gr-success": "#98ae73",
        "gr-success-light": "#333c27",
        "gr-success-fg": "#1c1b18",
        "gr-primary-text": "#f2b07c",
        "gr-success-text": "#c2d2a2",
        "gr-warning": "#dbb44f",
        "gr-warning-light": "#443817",
        "gr-warning-fg": "#1c1b18",
        "gr-warning-text": "#e9d08c",
        "gr-danger": "#b7473c",
        "gr-danger-light": "#4b2622",
        "gr-danger-fg": "#f2efe7",
        "gr-danger-text": "#f59cb0",
        "gr-info": "#3368b5",
        "gr-info-light": "#233650",
        "gr-info-fg": "#f2efe7",
        "gr-info-text": "#a8c7ef",
        "gr-slate": "#a5a299",
        "gr-slate-light": "#3b3a35",
        "gr-slate-fg": "#1c1b18",
        "gr-slate-text": "#d8d5cd",
        "gr-azure": "#82afd9",
        "gr-azure-light": "#253a4c",
        "gr-azure-fg": "#1c1b18",
        "gr-azure-text": "#bad4ec",
        "gr-primary-solid": "var(--gr-primary)",
        "gr-primary-solid-hover": "var(--gr-primary-hover)",
        "gr-primary-solid-active": "var(--gr-primary-active)",
        "gr-primary-solid-fg": "var(--gr-primary-fg)",
        "gr-success-solid": "var(--gr-success)",
        "gr-success-solid-hover": "var(--gr-success-hover)",
        "gr-success-solid-active": "var(--gr-success-active)",
        "gr-success-solid-fg": "var(--gr-success-fg)",
        "gr-warning-solid": "var(--gr-warning)",
        "gr-warning-solid-hover": "var(--gr-warning-hover)",
        "gr-warning-solid-active": "var(--gr-warning-active)",
        "gr-warning-solid-fg": "var(--gr-warning-fg)",
        "gr-danger-solid": "var(--gr-danger)",
        "gr-danger-solid-hover": "var(--gr-danger-hover)",
        "gr-danger-solid-active": "var(--gr-danger-active)",
        "gr-danger-solid-fg": "var(--gr-danger-fg)",
        "gr-info-solid": "var(--gr-info)",
        "gr-info-solid-hover": "var(--gr-info-hover)",
        "gr-info-solid-active": "var(--gr-info-active)",
        "gr-info-solid-fg": "var(--gr-info-fg)",
        "gr-slate-solid": "var(--gr-slate)",
        "gr-slate-solid-hover": "var(--gr-slate-hover)",
        "gr-slate-solid-active": "var(--gr-slate-active)",
        "gr-slate-solid-fg": "var(--gr-slate-fg)",
        "gr-azure-solid": "var(--gr-azure)",
        "gr-azure-solid-hover": "var(--gr-azure-hover)",
        "gr-azure-solid-active": "var(--gr-azure-active)",
        "gr-azure-solid-fg": "var(--gr-azure-fg)",
        "gr-chart-1": "#e0895f",
        "gr-chart-2": "#9dbb6a",
        "gr-chart-3": "#6fa2e2",
        "gr-chart-4": "#d684b4",
        "gr-chart-5": "#4fb8ac",
        "gr-sidebar": "#2a2925",
        "gr-sidebar-fg": "#f2efe7",
        "gr-sidebar-primary": "#f2efe7",
        "gr-sidebar-primary-fg": "#1c1b18",
        "gr-sidebar-accent": "#3a3934",
        "gr-sidebar-accent-fg": "#ece8de",
        "gr-sidebar-brd": "#45433d",
        "gr-sidebar-ring": "#6fa2e2",
        "gr-shadow-1": "0 1px 2px rgba(0, 0, 0, 0.45)",
        "gr-shadow-2": "0 8px 24px rgba(0, 0, 0, 0.55)",
        "gr-shadow-3": "0 16px 48px rgba(0, 0, 0, 0.65)",
        "gr-danger-hover": "color-mix(in srgb, var(--gr-danger) 88%, var(--gr-bg))",
        "gr-danger-active": "color-mix(in srgb, var(--gr-danger) 80%, var(--gr-bg))",
        "gr-info-hover": "color-mix(in srgb, var(--gr-info) 88%, var(--gr-bg))",
        "gr-info-active": "color-mix(in srgb, var(--gr-info) 80%, var(--gr-bg))"
      },
      "fallbacks": [
        {
          "supports": "not (color: color-mix(in srgb, #000 50%, #fff))",
          "tokens": {
            "gr-primary-hover": "#db9270",
            "gr-primary-active": "#dd9a7b",
            "gr-secondary-hover": "#494842",
            "gr-secondary-active": "#575651",
            "gr-brd-hover": "#797770",
            "gr-brd-active": "#93908a",
            "gr-success-hover": "#9fb37c",
            "gr-success-active": "#a6b886",
            "gr-warning-hover": "#ddb95b",
            "gr-warning-active": "#dfbd67",
            "gr-danger-hover": "#a54339",
            "gr-danger-active": "#9a4036",
            "gr-info-hover": "#3160a3",
            "gr-info-active": "#305a97",
            "gr-slate-hover": "#aba89f",
            "gr-slate-active": "#b1aea5",
            "gr-azure-hover": "#8bb4da",
            "gr-azure-active": "#94b9db"
          }
        }
      ]
    }
  },
  "defaultMode": "light",
  "components": {
    "@feugene/granularity": {
      "GrAffix": {
        "root": {
          "gr-affix-shadow-bottom": "0 -8px 24px -12px color-mix(in srgb, var(--gr-fg) 45%, transparent)"
        }
      },
      "GrAvatar": {
        "root": {
          "gr-avatar-1-bg": "var(--gr-info-light)",
          "gr-avatar-1-fg": "var(--gr-info-text)",
          "gr-avatar-2-bg": "var(--gr-warning-light)",
          "gr-avatar-2-fg": "var(--gr-warning-text)",
          "gr-avatar-3-bg": "var(--gr-success-light)",
          "gr-avatar-3-fg": "var(--gr-success-text)",
          "gr-avatar-4-bg": "var(--gr-danger-light)",
          "gr-avatar-4-fg": "var(--gr-danger-text)",
          "gr-avatar-5-bg": "var(--gr-azure-light)",
          "gr-avatar-5-fg": "var(--gr-azure-text)",
          "gr-avatar-6-bg": "var(--gr-slate-light)",
          "gr-avatar-6-fg": "var(--gr-slate-text)",
          "gr-avatar-square-radius": "10px"
        }
      },
      "GrBadge": {
        "root": {
          "gr-badge-neutral-bg": "var(--gr-fg)",
          "gr-badge-neutral-fg": "var(--gr-bg)",
          "gr-badge-semi-radius-lg": "7px",
          "gr-badge-semi-radius-md": "5px",
          "gr-badge-semi-radius-sm": "3px",
          "gr-badge-semi-radius-xs": "3px"
        },
        "modes": {
          "dark": {
            "gr-badge-azure-bg": "var(--gr-azure)",
            "gr-badge-azure-fg": "var(--gr-azure-fg)",
            "gr-badge-danger-bg": "var(--gr-danger-text)",
            "gr-badge-danger-fg": "var(--gr-bg)",
            "gr-badge-info-bg": "var(--gr-info-text)",
            "gr-badge-info-fg": "var(--gr-bg)",
            "gr-badge-primary-bg": "var(--gr-primary)",
            "gr-badge-primary-fg": "var(--gr-primary-fg)",
            "gr-badge-slate-bg": "var(--gr-slate)",
            "gr-badge-slate-fg": "var(--gr-slate-fg)",
            "gr-badge-success-bg": "var(--gr-success)",
            "gr-badge-success-fg": "var(--gr-success-fg)",
            "gr-badge-warning-bg": "var(--gr-warning)",
            "gr-badge-warning-fg": "var(--gr-warning-fg)"
          },
          "light": {
            "gr-badge-azure-bg": "var(--gr-azure-text)",
            "gr-badge-azure-fg": "var(--gr-card)",
            "gr-badge-danger-bg": "var(--gr-danger-solid)",
            "gr-badge-danger-fg": "var(--gr-danger-solid-fg)",
            "gr-badge-info-bg": "var(--gr-info-solid)",
            "gr-badge-info-fg": "var(--gr-info-solid-fg)",
            "gr-badge-primary-bg": "var(--gr-primary-text)",
            "gr-badge-primary-fg": "var(--gr-card)",
            "gr-badge-slate-bg": "var(--gr-slate-solid)",
            "gr-badge-slate-fg": "var(--gr-slate-solid-fg)",
            "gr-badge-success-bg": "var(--gr-success-text)",
            "gr-badge-success-fg": "var(--gr-card)",
            "gr-badge-warning-bg": "var(--gr-warning-text)",
            "gr-badge-warning-fg": "var(--gr-card)"
          }
        }
      },
      "GrButton": {
        "root": {
          "gr-button-azure-bg": "var(--gr-azure-solid)",
          "gr-button-azure-bg-active": "var(--gr-azure-solid-active)",
          "gr-button-azure-bg-hover": "var(--gr-azure-solid-hover)",
          "gr-button-azure-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-azure-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-azure-fg": "var(--gr-azure-solid-fg)",
          "gr-button-azure-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-azure-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-azure-soft-bg": "var(--gr-azure-light)",
          "gr-button-azure-soft-bg-active": "color-mix(in srgb, var(--gr-azure) 16%, var(--gr-button-azure-soft-bg))",
          "gr-button-azure-soft-bg-hover": "color-mix(in srgb, var(--gr-azure) 10%, var(--gr-button-azure-soft-bg))",
          "gr-button-danger-bg": "var(--gr-danger-solid)",
          "gr-button-danger-bg-active": "var(--gr-danger-solid-active)",
          "gr-button-danger-bg-hover": "var(--gr-danger-solid-hover)",
          "gr-button-danger-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-danger-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-danger-fg": "var(--gr-danger-solid-fg)",
          "gr-button-danger-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-danger-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-danger-soft-bg": "var(--gr-danger-light)",
          "gr-button-danger-soft-bg-active": "color-mix(in srgb, var(--gr-danger) 16%, var(--gr-button-danger-soft-bg))",
          "gr-button-danger-soft-bg-hover": "color-mix(in srgb, var(--gr-danger) 10%, var(--gr-button-danger-soft-bg))",
          "gr-button-disabled-bg": "var(--gr-disabled-bg)",
          "gr-button-disabled-brd": "var(--gr-disabled-brd)",
          "gr-button-disabled-fg": "var(--gr-disabled-fg)",
          "gr-button-info-bg": "var(--gr-info-solid)",
          "gr-button-info-bg-active": "var(--gr-info-solid-active)",
          "gr-button-info-bg-hover": "var(--gr-info-solid-hover)",
          "gr-button-info-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-info-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-info-fg": "var(--gr-info-solid-fg)",
          "gr-button-info-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-info-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-info-soft-bg": "var(--gr-info-light)",
          "gr-button-info-soft-bg-active": "color-mix(in srgb, var(--gr-info) 16%, var(--gr-button-info-soft-bg))",
          "gr-button-info-soft-bg-hover": "color-mix(in srgb, var(--gr-info) 10%, var(--gr-button-info-soft-bg))",
          "gr-button-neutral-border": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-neutral-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-neutral-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-neutral-soft-bg": "var(--gr-card)",
          "gr-button-neutral-soft-bg-active": "color-mix(in srgb, var(--gr-fg) 11%, var(--gr-card))",
          "gr-button-neutral-soft-bg-hover": "color-mix(in srgb, var(--gr-fg) 6%, var(--gr-card))",
          "gr-button-primary-bg": "var(--gr-primary-solid)",
          "gr-button-primary-bg-active": "var(--gr-primary-solid-active)",
          "gr-button-primary-bg-hover": "var(--gr-primary-solid-hover)",
          "gr-button-primary-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-primary-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-primary-fg": "var(--gr-primary-solid-fg)",
          "gr-button-primary-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-primary-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-primary-soft-bg": "color-mix(in srgb, var(--gr-primary) 14%, var(--gr-bg))",
          "gr-button-primary-soft-bg-active": "color-mix(in srgb, var(--gr-primary) 16%, var(--gr-button-primary-soft-bg))",
          "gr-button-primary-soft-bg-hover": "color-mix(in srgb, var(--gr-primary) 10%, var(--gr-button-primary-soft-bg))",
          "gr-button-radius": "0.375rem",
          "gr-button-shimmer-duration": "1.8s",
          "gr-button-slate-bg": "var(--gr-slate-solid)",
          "gr-button-slate-bg-active": "var(--gr-slate-solid-active)",
          "gr-button-slate-bg-hover": "var(--gr-slate-solid-hover)",
          "gr-button-slate-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-slate-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-slate-fg": "var(--gr-slate-solid-fg)",
          "gr-button-slate-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-slate-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-slate-soft-bg": "var(--gr-slate-light)",
          "gr-button-slate-soft-bg-active": "color-mix(in srgb, var(--gr-slate) 16%, var(--gr-button-slate-soft-bg))",
          "gr-button-slate-soft-bg-hover": "color-mix(in srgb, var(--gr-slate) 10%, var(--gr-button-slate-soft-bg))",
          "gr-button-success-bg": "var(--gr-success-solid)",
          "gr-button-success-bg-active": "var(--gr-success-solid-active)",
          "gr-button-success-bg-hover": "var(--gr-success-solid-hover)",
          "gr-button-success-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-success-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-success-fg": "var(--gr-success-solid-fg)",
          "gr-button-success-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-success-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-success-soft-bg": "var(--gr-success-light)",
          "gr-button-success-soft-bg-active": "color-mix(in srgb, var(--gr-success) 16%, var(--gr-button-success-soft-bg))",
          "gr-button-success-soft-bg-hover": "color-mix(in srgb, var(--gr-success) 10%, var(--gr-button-success-soft-bg))",
          "gr-button-warning-bg": "var(--gr-warning-solid)",
          "gr-button-warning-bg-active": "var(--gr-warning-solid-active)",
          "gr-button-warning-bg-hover": "var(--gr-warning-solid-hover)",
          "gr-button-warning-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-warning-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))",
          "gr-button-warning-fg": "var(--gr-warning-solid-fg)",
          "gr-button-warning-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-warning-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-warning-soft-bg": "var(--gr-warning-light)",
          "gr-button-warning-soft-bg-active": "color-mix(in srgb, var(--gr-warning) 16%, var(--gr-button-warning-soft-bg))",
          "gr-button-warning-soft-bg-hover": "color-mix(in srgb, var(--gr-warning) 10%, var(--gr-button-warning-soft-bg))"
        },
        "modes": {
          "dark": {
            "gr-button-neutral-bg": "var(--gr-fg)",
            "gr-button-neutral-bg-active": "color-mix(in srgb, var(--gr-fg) 45%, #ffffff)",
            "gr-button-neutral-bg-hover": "color-mix(in srgb, var(--gr-fg) 70%, #ffffff)",
            "gr-button-neutral-fg": "var(--gr-bg)",
            "gr-button-shadow": "none",
            "gr-button-shadow-active": "none"
          },
          "light": {
            "gr-button-neutral-bg": "var(--gr-fg)",
            "gr-button-neutral-bg-active": "color-mix(in srgb, var(--gr-fg) 68%, #000000)",
            "gr-button-neutral-bg-hover": "color-mix(in srgb, var(--gr-fg) 82%, #000000)",
            "gr-button-neutral-fg": "var(--gr-card)",
            "gr-button-shadow": "none",
            "gr-button-shadow-active": "none"
          }
        }
      },
      "GrCarousel": {
        "root": {
          "gr-carousel-dot-ring-offset": "2px",
          "gr-carousel-dot-ring-width": "2px"
        }
      },
      "GrColorPicker": {
        "root": {
          "gr-color-picker-area-thumb-border": "#fff",
          "gr-color-picker-area-thumb-ring": "rgba(0, 0, 0, 0.45)"
        }
      },
      "GrCommandPalette": {
        "root": {
          "gr-command-active-bg": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
          "gr-command-input-font-size": "15px",
          "gr-command-item-radius": "10px",
          "gr-command-match-bg": "color-mix(in srgb, var(--gr-primary) 22%, transparent)"
        }
      },
      "GrDataTable": {
        "root": {
          "gr-datatable-detail-accent": "var(--gr-primary)",
          "gr-datatable-detail-bg": "color-mix(in srgb, var(--gr-muted) 45%, transparent)",
          "gr-datatable-drag-indicator-width": "2px",
          "gr-datatable-pinned-shadow": "4px 0 6px -4px rgba(0, 0, 0, 0.25)",
          "gr-datatable-pinned-shadow-end": "-4px 0 6px -4px rgba(0, 0, 0, 0.25)"
        }
      },
      "GrDivider": {
        "root": {
          "gr-divider-thickness": "1px"
        }
      },
      "GrImageViewer": {
        "root": {
          "gr-image-viewer-chrome-bg": "rgb(0 0 0 / 0.35)",
          "gr-image-viewer-chrome-bg-hover": "rgb(0 0 0 / 0.55)",
          "gr-image-viewer-chrome-bg-soft": "rgb(255 255 255 / 0.1)",
          "gr-image-viewer-chrome-brd": "rgb(255 255 255 / 0.2)",
          "gr-image-viewer-chrome-fg": "rgb(255 255 255 / 0.95)",
          "gr-image-viewer-chrome-fg-muted": "rgb(255 255 255 / 0.8)",
          "gr-image-viewer-ring": "rgb(255 255 255 / 0.8)",
          "gr-image-viewer-scrim": "rgb(0 0 0 / 0.6)"
        }
      },
      "GrProgressBar": {
        "root": {
          "gr-progress-azure-bg": "var(--gr-azure)",
          "gr-progress-bg": "var(--gr-primary)",
          "gr-progress-buffer-bg": "color-mix(in srgb, var(--gr-muted-fg) 40%, var(--gr-muted))",
          "gr-progress-danger-bg": "var(--gr-danger)",
          "gr-progress-indeterminate-bg": "var(--gr-muted-fg)",
          "gr-progress-indeterminate-duration": "1.4s",
          "gr-progress-info-bg": "var(--gr-info)",
          "gr-progress-neutral-bg": "var(--gr-muted-fg)",
          "gr-progress-slate-bg": "var(--gr-slate)",
          "gr-progress-success-bg": "var(--gr-success)",
          "gr-progress-warning-bg": "var(--gr-warning)"
        }
      },
      "GrProgressCircle": {
        "root": {
          "gr-progress-circle-cap": "round"
        }
      },
      "GrRating": {
        "root": {
          "gr-rating-void-color": "color-mix(in srgb, var(--gr-muted-fg) 35%, transparent)"
        }
      },
      "GrSegmented": {
        "modes": {
          "dark": {
            "gr-segmented-indicator-highlight-shadow": "0 0 0 1px rgba(248, 250, 252, 0.08)"
          },
          "light": {
            "gr-segmented-indicator-highlight-shadow": "0 0 0 0 transparent"
          }
        }
      },
      "GrSortableList": {
        "root": {
          "gr-sortable-indicator-width": "2px"
        }
      },
      "GrSteps": {
        "root": {
          "gr-steps-connector-size": "2px"
        }
      },
      "GrTable": {
        "root": {
          "gr-table-sticky-column-shadow": "4px 0 6px -4px rgba(0, 0, 0, 0.25)"
        }
      },
      "GrTimeline": {
        "root": {
          "gr-timeline-axis-width": "2px",
          "gr-timeline-dash": "4px",
          "gr-timeline-marker-ring": "2px"
        }
      },
      "GrTransfer": {
        "root": {
          "gr-transfer-arrived-bg": "color-mix(in srgb, var(--gr-primary) 32%, transparent)",
          "gr-transfer-drop-bg": "color-mix(in srgb, var(--gr-primary) 6%, transparent)",
          "gr-transfer-indicator-width": "3px",
          "gr-transfer-selected-bg": "color-mix(in srgb, var(--gr-primary) 12%, transparent)"
        }
      }
    }
  },
  "extensions": {
    "granularity": {
      "componentDefaults": {
        "GrButton": {
          "loadingIndicator": "shimmer"
        },
        "GrButtonGroup": {
          "appearance": "tray"
        }
      }
    }
  }
}

export default data
