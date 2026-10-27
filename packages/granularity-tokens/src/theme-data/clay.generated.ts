// СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются.

import type { GrThemeData } from '../types'

/** Полные данные темы `clay`: наследование `extends` раскрыто. */
const data: GrThemeData = {
  "id": "clay",
  "title": "Глина",
  "description": "Тёплая бумага, графитовые чернила и одна глиняная точка на экран.",
  "docs": "https://granularity.tech/themes/clay",
  "version": "2.0.1",
  "targets": {
    "@feugene/granularity": "^3.1.0",
    "@feugene/granularity-charts": "^3.0.0",
    "@feugene/granularity-media": "^3.0.0"
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
    "gr-font-display": "Georgia, 'Times New Roman', Times, serif",
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
    "gr-radius-control": "8px",
    "gr-radius-control-xs": "6px",
    "gr-radius-control-sm": "8px",
    "gr-radius-control-md": "8px",
    "gr-radius-control-lg": "10px",
    "gr-input-focus-ring-width": "1px",
    "gr-radius-md": "8px",
    "gr-radius-lg": "12px",
    "gr-radius-xl": "16px",
    "gr-radius-overlay": "12px",
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
        "gr-bg": "#faf9f5",
        "gr-fg": "#141413",
        "gr-card": "#ffffff",
        "gr-card-fg": "#141413",
        "gr-popover": "#ffffff",
        "gr-popover-fg": "#141413",
        "gr-muted": "#f0eee6",
        "gr-muted-fg": "#5e5d59",
        "gr-secondary": "#e8e6dc",
        "gr-secondary-fg": "#3d3d3a",
        "gr-overlay-bg": "rgb(28 27 24 / 0.45)",
        "gr-brd": "#d9d8d5",
        "gr-brd-strong": "#b8b7b4",
        "gr-input": "#82817e",
        "gr-input-hover": "#565553",
        "gr-input-focus-brd": "var(--gr-ring)",
        "gr-input-readonly-bg": "transparent",
        "gr-input-readonly-brd": "var(--gr-brd)",
        "gr-control-brd": "#82817e",
        "gr-control-brd-hover": "#565553",
        "gr-ring": "#2a78d6",
        "gr-disabled-bg": "#f0eee6",
        "gr-disabled-fg": "#9c9a92",
        "gr-disabled-brd": "var(--gr-disabled-bg)",
        "gr-invalid-brd": "var(--gr-danger)",
        "gr-invalid-ring": "var(--gr-danger)",
        "gr-invalid-text": "var(--gr-danger-text)",
        "gr-primary": "#d97757",
        "gr-primary-fg": "#141413",
        "gr-accent": "#f6e8e0",
        "gr-accent-fg": "#973f22",
        "gr-selected": "var(--gr-fg)",
        "gr-selected-fg": "var(--gr-bg)",
        "gr-selected-hover": "#3d3d3a",
        "gr-success": "#788c5d",
        "gr-success-light": "#e9ebe1",
        "gr-success-fg": "#141413",
        "gr-primary-text": "#973f22",
        "gr-success-text": "#4f5e3b",
        "gr-warning": "#c9a82d",
        "gr-warning-light": "#f4eedb",
        "gr-warning-fg": "#141413",
        "gr-warning-text": "#6f5a14",
        "gr-danger": "#b8433a",
        "gr-danger-light": "#f1e1dd",
        "gr-danger-fg": "#faf9f5",
        "gr-danger-text": "#9c2a34",
        "gr-info": "#2268bf",
        "gr-info-light": "#dfe8f1",
        "gr-info-fg": "#faf9f5",
        "gr-info-text": "#1c57a0",
        "gr-slate": "#4d4c48",
        "gr-slate-light": "#e4e3df",
        "gr-slate-fg": "#faf9f5",
        "gr-slate-text": "#4d4c48",
        "gr-azure": "#5b9fb6",
        "gr-azure-light": "#e5eded",
        "gr-azure-fg": "#141413",
        "gr-azure-text": "#2e6270",
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
        "gr-sidebar": "#f0eee6",
        "gr-sidebar-fg": "#141413",
        "gr-sidebar-primary": "#141413",
        "gr-sidebar-primary-fg": "#faf9f5",
        "gr-sidebar-accent": "#dad8d0",
        "gr-sidebar-accent-fg": "#141413",
        "gr-sidebar-brd": "#d1cfc8",
        "gr-sidebar-ring": "#2a78d6",
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
            "gr-primary-hover": "#de876b",
            "gr-primary-active": "#e19279",
            "gr-secondary-hover": "#d7d5cc",
            "gr-secondary-active": "#c6c4bc",
            "gr-brd-hover": "#9e9d9b",
            "gr-brd-active": "#80807e",
            "gr-success-hover": "#889a70",
            "gr-success-active": "#93a37d",
            "gr-warning-hover": "#cfb246",
            "gr-warning-active": "#d4b957",
            "gr-danger-hover": "#ab3f37",
            "gr-danger-active": "#9e3b34",
            "gr-info-hover": "#2161b1",
            "gr-info-active": "#205ba3",
            "gr-slate-hover": "#484844",
            "gr-slate-active": "#444340",
            "gr-azure-hover": "#6fabbf",
            "gr-azure-active": "#7cb2c5"
          }
        }
      ]
    },
    "dark": {
      "title": "Тёмный",
      "colorScheme": "dark",
      "tokens": {
        "gr-bg": "#262624",
        "gr-fg": "#faf9f5",
        "gr-card": "#30302e",
        "gr-card-fg": "#faf9f5",
        "gr-popover": "#30302e",
        "gr-popover-fg": "#faf9f5",
        "gr-muted": "#3a3a37",
        "gr-muted-fg": "#b0aea5",
        "gr-secondary": "#3a3a37",
        "gr-secondary-fg": "#d1cfc5",
        "gr-overlay-bg": "rgb(10 10 9 / 0.6)",
        "gr-brd": "#42423f",
        "gr-brd-strong": "#5f5e5a",
        "gr-input": "#878681",
        "gr-input-hover": "#afaea8",
        "gr-input-focus-brd": "var(--gr-ring)",
        "gr-input-readonly-bg": "transparent",
        "gr-input-readonly-brd": "var(--gr-brd)",
        "gr-control-brd": "#878681",
        "gr-control-brd-hover": "#afaea8",
        "gr-ring": "#6aa3e8",
        "gr-disabled-bg": "#353532",
        "gr-disabled-fg": "#73726c",
        "gr-disabled-brd": "var(--gr-disabled-bg)",
        "gr-invalid-brd": "var(--gr-danger)",
        "gr-invalid-ring": "var(--gr-danger)",
        "gr-invalid-text": "var(--gr-danger-text)",
        "gr-primary": "#d97757",
        "gr-primary-fg": "#141413",
        "gr-accent": "#46352d",
        "gr-accent-fg": "#e6a37f",
        "gr-selected": "var(--gr-fg)",
        "gr-selected-fg": "var(--gr-bg)",
        "gr-selected-hover": "#d1cfc5",
        "gr-success": "#8a9e6d",
        "gr-success-light": "#35382e",
        "gr-success-fg": "#141413",
        "gr-primary-text": "#e6a37f",
        "gr-success-text": "#b2c09a",
        "gr-warning": "#c9a82d",
        "gr-warning-light": "#433d26",
        "gr-warning-fg": "#141413",
        "gr-warning-text": "#dcc067",
        "gr-danger": "#e3585a",
        "gr-danger-light": "#482f2e",
        "gr-danger-fg": "#141413",
        "gr-danger-text": "#f5a097",
        "gr-info": "#6aa3e8",
        "gr-info-light": "#323c47",
        "gr-info-fg": "#141413",
        "gr-info-text": "#a1c1ec",
        "gr-slate": "#9c9a92",
        "gr-slate-light": "#3b3b38",
        "gr-slate-fg": "#141413",
        "gr-slate-text": "#c2c0b6",
        "gr-azure": "#5b9fb6",
        "gr-azure-light": "#303c3e",
        "gr-azure-fg": "#141413",
        "gr-azure-text": "#a3cbd8",
        "gr-primary-solid": "var(--gr-primary)",
        "gr-primary-solid-hover": "var(--gr-primary-hover)",
        "gr-primary-solid-active": "var(--gr-primary-active)",
        "gr-primary-solid-fg": "var(--gr-primary-fg)",
        "gr-success-solid": "#8a9e6d",
        "gr-success-solid-hover": "#97aa7a",
        "gr-success-solid-active": "#a3b587",
        "gr-success-solid-fg": "var(--gr-success-fg)",
        "gr-warning-solid": "var(--gr-warning)",
        "gr-warning-solid-hover": "var(--gr-warning-hover)",
        "gr-warning-solid-active": "var(--gr-warning-active)",
        "gr-warning-solid-fg": "var(--gr-warning-fg)",
        "gr-danger-solid": "#b8433a",
        "gr-danger-solid-hover": "#a93c34",
        "gr-danger-solid-active": "#99352e",
        "gr-danger-solid-fg": "#faf9f5",
        "gr-info-solid": "#2268bf",
        "gr-info-solid-hover": "#1f5fae",
        "gr-info-solid-active": "#1b559c",
        "gr-info-solid-fg": "#faf9f5",
        "gr-slate-solid": "#5e5d59",
        "gr-slate-solid-hover": "#575653",
        "gr-slate-solid-active": "#53524e",
        "gr-slate-solid-fg": "#faf9f5",
        "gr-azure-solid": "var(--gr-azure)",
        "gr-azure-solid-hover": "var(--gr-azure-hover)",
        "gr-azure-solid-active": "var(--gr-azure-active)",
        "gr-azure-solid-fg": "var(--gr-azure-fg)",
        "gr-chart-1": "#e0895f",
        "gr-chart-2": "#9dbb6a",
        "gr-chart-3": "#6fa2e2",
        "gr-chart-4": "#d684b4",
        "gr-chart-5": "#4fb8ac",
        "gr-sidebar": "#1f1e1d",
        "gr-sidebar-fg": "#faf9f5",
        "gr-sidebar-primary": "#faf9f5",
        "gr-sidebar-primary-fg": "#141413",
        "gr-sidebar-accent": "#3c3b39",
        "gr-sidebar-accent-fg": "#faf9f5",
        "gr-sidebar-brd": "#3c3b39",
        "gr-sidebar-ring": "#6aa3e8",
        "gr-shadow-1": "0 1px 2px rgba(0, 0, 0, 0.45)",
        "gr-shadow-2": "0 8px 24px rgba(0, 0, 0, 0.55)",
        "gr-shadow-3": "0 16px 48px rgba(0, 0, 0, 0.65)"
      },
      "fallbacks": [
        {
          "supports": "not (color: color-mix(in srgb, #000 50%, #fff))",
          "tokens": {
            "gr-primary-hover": "#dc8164",
            "gr-primary-active": "#de8c70",
            "gr-secondary-hover": "#494946",
            "gr-secondary-active": "#595955",
            "gr-brd-hover": "#797976",
            "gr-brd-active": "#959491",
            "gr-success-hover": "#93a578",
            "gr-success-active": "#9cad83",
            "gr-warning-hover": "#cdae3d",
            "gr-warning-active": "#d1b54d",
            "gr-danger-hover": "#e56566",
            "gr-danger-active": "#e77273",
            "gr-info-hover": "#76aae9",
            "gr-info-active": "#81b1ea",
            "gr-slate-hover": "#a4a29a",
            "gr-slate-active": "#aba9a2",
            "gr-azure-hover": "#68a6bb",
            "gr-azure-active": "#74adc0"
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
      "GrAlert": {
        "root": {
          "gr-alert-radius": "10px",
          "gr-alert-title-weight": "var(--gr-font-medium)",
          "gr-alert-body-fg": "var(--gr-secondary-fg)",
          "gr-alert-soft-brd": "transparent",
          "gr-alert-soft-brd-tone": "0%",
          "gr-alert-soft-title-tone": "0%",
          "gr-alert-soft-text-tone": "0%",
          "gr-alert-outline-bg": "var(--gr-card)",
          "gr-alert-outline-brd": "var(--gr-brd-strong)",
          "gr-alert-outline-brd-tone": "0%"
        }
      },
      "GrAutocomplete": {
        "modes": {
          "dark": {
            "gr-autocomplete-option-active-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-autocomplete-option-active-bg": "rgba(115, 114, 108, 0.1)"
          }
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
          "gr-avatar-square-radius": "10px",
          "gr-avatar-brd": "transparent",
          "gr-avatar-weight": "var(--gr-font-medium)",
          "gr-avatar-neutral-fg": "var(--gr-secondary-fg)"
        }
      },
      "GrBadge": {
        "root": {
          "gr-badge-neutral-bg": "var(--gr-fg)",
          "gr-badge-neutral-fg": "var(--gr-bg)",
          "gr-badge-semi-radius-lg": "6px",
          "gr-badge-semi-radius-md": "6px",
          "gr-badge-semi-radius-sm": "6px",
          "gr-badge-semi-radius-xs": "5px",
          "gr-badge-light-brd": "0%"
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
      "GrBreadcrumbs": {
        "root": {
          "gr-breadcrumbs-separator-fg": "var(--gr-brd-strong)",
          "gr-breadcrumbs-current-weight": "var(--gr-font-medium)"
        }
      },
      "GrButton": {
        "root": {
          "gr-button-azure-bg": "var(--gr-azure-solid)",
          "gr-button-azure-bg-active": "var(--gr-azure-solid-active)",
          "gr-button-azure-bg-hover": "var(--gr-azure-solid-hover)",
          "gr-button-azure-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-azure-border-soft": "transparent",
          "gr-button-azure-fg": "var(--gr-azure-solid-fg)",
          "gr-button-azure-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-azure-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-azure-glow": "transparent",
          "gr-button-danger-bg": "var(--gr-danger-solid)",
          "gr-button-danger-bg-active": "var(--gr-danger-solid-active)",
          "gr-button-danger-bg-hover": "var(--gr-danger-solid-hover)",
          "gr-button-danger-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-danger-border-soft": "transparent",
          "gr-button-danger-fg": "var(--gr-danger-solid-fg)",
          "gr-button-danger-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-danger-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-danger-glow": "transparent",
          "gr-button-disabled-bg": "var(--gr-disabled-bg)",
          "gr-button-disabled-border-style": "solid",
          "gr-button-disabled-brd": "var(--gr-disabled-brd)",
          "gr-button-disabled-fg": "var(--gr-disabled-fg)",
          "gr-button-disabled-image": "none",
          "gr-button-focus-offset": "2px",
          "gr-button-focus-offset-from": "2px",
          "gr-button-font-weight": "var(--gr-font-medium)",
          "gr-button-glow": "0 0 0 0",
          "gr-button-glow-hover": "0 0 0 0",
          "gr-button-info-bg": "var(--gr-info-solid)",
          "gr-button-info-bg-active": "var(--gr-info-solid-active)",
          "gr-button-info-bg-hover": "var(--gr-info-solid-hover)",
          "gr-button-info-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-info-border-soft": "transparent",
          "gr-button-info-fg": "var(--gr-info-solid-fg)",
          "gr-button-info-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-info-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-info-glow": "transparent",
          "gr-button-lift": "0px",
          "gr-button-motion-duration": "var(--gr-duration-fast)",
          "gr-button-motion-ease": "var(--gr-ease-out)",
          "gr-button-neutral-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-neutral-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-neutral-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-neutral-glow": "transparent",
          "gr-button-neutral-soft-bg": "var(--gr-card)",
          "gr-button-neutral-soft-bg-active": "color-mix(in srgb, var(--gr-fg) 11%, var(--gr-card))",
          "gr-button-neutral-soft-bg-hover": "color-mix(in srgb, var(--gr-fg) 6%, var(--gr-card))",
          "gr-button-primary-bg": "var(--gr-primary-solid)",
          "gr-button-primary-bg-active": "var(--gr-primary-solid-active)",
          "gr-button-primary-bg-hover": "var(--gr-primary-solid-hover)",
          "gr-button-primary-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-primary-border-soft": "transparent",
          "gr-button-primary-fg": "var(--gr-primary-solid-fg)",
          "gr-button-primary-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-primary-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-primary-glow": "transparent",
          "gr-button-radius-lg": "10px",
          "gr-button-radius-md": "8px",
          "gr-button-radius-sm": "8px",
          "gr-button-radius-xs": "6px",
          "gr-button-response-color": "transparent",
          "gr-button-response-duration": "var(--gr-duration-fast)",
          "gr-button-response-ease": "var(--gr-ease-out)",
          "gr-button-response-from": "none",
          "gr-button-response-height": "auto",
          "gr-button-response-inset": "0",
          "gr-button-response-opacity": "0",
          "gr-button-response-origin": "50%",
          "gr-button-response-soft-color": "transparent",
          "gr-button-response-solid-color": "transparent",
          "gr-button-shimmer-duration": "1.8s",
          "gr-button-slate-bg": "var(--gr-slate-solid)",
          "gr-button-slate-bg-active": "var(--gr-slate-solid-active)",
          "gr-button-slate-bg-hover": "var(--gr-slate-solid-hover)",
          "gr-button-slate-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-slate-border-soft": "transparent",
          "gr-button-slate-fg": "var(--gr-slate-solid-fg)",
          "gr-button-slate-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-slate-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-slate-glow": "transparent",
          "gr-button-solid-image": "none",
          "gr-button-success-bg": "var(--gr-success-solid)",
          "gr-button-success-bg-active": "var(--gr-success-solid-active)",
          "gr-button-success-bg-hover": "var(--gr-success-solid-hover)",
          "gr-button-success-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-success-border-soft": "transparent",
          "gr-button-success-fg": "var(--gr-success-solid-fg)",
          "gr-button-success-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-success-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-success-glow": "transparent",
          "gr-button-surface-shadow": "none",
          "gr-button-track-duration": "1.1s",
          "gr-button-warning-bg": "var(--gr-warning-solid)",
          "gr-button-warning-bg-active": "var(--gr-warning-solid-active)",
          "gr-button-warning-bg-hover": "var(--gr-warning-solid-hover)",
          "gr-button-warning-border": "color-mix(in srgb, var(--gr-fg) 30%, var(--gr-bg))",
          "gr-button-warning-border-soft": "transparent",
          "gr-button-warning-fg": "var(--gr-warning-solid-fg)",
          "gr-button-warning-ghost-bg-active": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-button-warning-ghost-bg-hover": "color-mix(in srgb, var(--gr-fg) 8%, transparent)",
          "gr-button-warning-glow": "transparent",
          "gr-button-primary-border-hover": "var(--gr-button-primary-border)",
          "gr-button-primary-border-active": "var(--gr-button-primary-border)",
          "gr-button-primary-border-soft-hover": "transparent",
          "gr-button-neutral-border-hover": "var(--gr-button-neutral-border)",
          "gr-button-neutral-border-active": "var(--gr-button-neutral-border)",
          "gr-button-neutral-border-soft-hover": "var(--gr-button-neutral-border-soft)",
          "gr-button-success-border-hover": "var(--gr-button-success-border)",
          "gr-button-success-border-active": "var(--gr-button-success-border)",
          "gr-button-success-border-soft-hover": "transparent",
          "gr-button-warning-border-hover": "var(--gr-button-warning-border)",
          "gr-button-warning-border-active": "var(--gr-button-warning-border)",
          "gr-button-warning-border-soft-hover": "transparent",
          "gr-button-danger-border-hover": "var(--gr-button-danger-border)",
          "gr-button-danger-border-active": "var(--gr-button-danger-border)",
          "gr-button-danger-border-soft-hover": "transparent",
          "gr-button-info-border-hover": "var(--gr-button-info-border)",
          "gr-button-info-border-active": "var(--gr-button-info-border)",
          "gr-button-info-border-soft-hover": "transparent",
          "gr-button-slate-border-hover": "var(--gr-button-slate-border)",
          "gr-button-slate-border-active": "var(--gr-button-slate-border)",
          "gr-button-slate-border-soft-hover": "transparent",
          "gr-button-azure-border-hover": "var(--gr-button-azure-border)",
          "gr-button-azure-border-active": "var(--gr-button-azure-border)",
          "gr-button-azure-border-soft-hover": "transparent",
          "gr-button-disabled-outline-brd": "var(--gr-brd)",
          "gr-button-press-scale": "1",
          "gr-button-neutral-border-soft": "color-mix(in srgb, var(--gr-fg) 15%, var(--gr-bg))"
        },
        "modes": {
          "dark": {
            "gr-button-azure-soft-bg": "color-mix(in srgb, var(--gr-azure) 18%, var(--gr-bg))",
            "gr-button-azure-soft-bg-active": "color-mix(in srgb, var(--gr-azure) 30%, var(--gr-bg))",
            "gr-button-azure-soft-bg-hover": "color-mix(in srgb, var(--gr-azure) 24%, var(--gr-bg))",
            "gr-button-danger-soft-bg": "color-mix(in srgb, var(--gr-danger) 18%, var(--gr-bg))",
            "gr-button-danger-soft-bg-active": "color-mix(in srgb, var(--gr-danger) 30%, var(--gr-bg))",
            "gr-button-danger-soft-bg-hover": "color-mix(in srgb, var(--gr-danger) 24%, var(--gr-bg))",
            "gr-button-info-soft-bg": "color-mix(in srgb, var(--gr-info) 18%, var(--gr-bg))",
            "gr-button-info-soft-bg-active": "color-mix(in srgb, var(--gr-info) 30%, var(--gr-bg))",
            "gr-button-info-soft-bg-hover": "color-mix(in srgb, var(--gr-info) 24%, var(--gr-bg))",
            "gr-button-neutral-bg": "var(--gr-fg)",
            "gr-button-neutral-bg-active": "color-mix(in srgb, var(--gr-fg) 87%, var(--gr-bg))",
            "gr-button-neutral-bg-hover": "color-mix(in srgb, var(--gr-fg) 91%, var(--gr-bg))",
            "gr-button-neutral-fg": "var(--gr-bg)",
            "gr-button-primary-soft-bg": "color-mix(in srgb, var(--gr-primary) 18%, var(--gr-bg))",
            "gr-button-primary-soft-bg-active": "color-mix(in srgb, var(--gr-primary) 30%, var(--gr-bg))",
            "gr-button-primary-soft-bg-hover": "color-mix(in srgb, var(--gr-primary) 24%, var(--gr-bg))",
            "gr-button-shadow": "none",
            "gr-button-shadow-active": "none",
            "gr-button-slate-soft-bg": "color-mix(in srgb, var(--gr-slate) 18%, var(--gr-bg))",
            "gr-button-slate-soft-bg-active": "color-mix(in srgb, var(--gr-slate) 30%, var(--gr-bg))",
            "gr-button-slate-soft-bg-hover": "color-mix(in srgb, var(--gr-slate) 24%, var(--gr-bg))",
            "gr-button-success-soft-bg": "color-mix(in srgb, var(--gr-success) 18%, var(--gr-bg))",
            "gr-button-success-soft-bg-active": "color-mix(in srgb, var(--gr-success) 30%, var(--gr-bg))",
            "gr-button-success-soft-bg-hover": "color-mix(in srgb, var(--gr-success) 24%, var(--gr-bg))",
            "gr-button-warning-soft-bg": "color-mix(in srgb, var(--gr-warning) 18%, var(--gr-bg))",
            "gr-button-warning-soft-bg-active": "color-mix(in srgb, var(--gr-warning) 30%, var(--gr-bg))",
            "gr-button-warning-soft-bg-hover": "color-mix(in srgb, var(--gr-warning) 24%, var(--gr-bg))"
          },
          "light": {
            "gr-button-azure-soft-bg": "color-mix(in srgb, var(--gr-azure) 13%, var(--gr-bg))",
            "gr-button-azure-soft-bg-active": "color-mix(in srgb, var(--gr-azure) 25%, var(--gr-bg))",
            "gr-button-azure-soft-bg-hover": "color-mix(in srgb, var(--gr-azure) 19%, var(--gr-bg))",
            "gr-button-danger-soft-bg": "color-mix(in srgb, var(--gr-danger) 13%, var(--gr-bg))",
            "gr-button-danger-soft-bg-active": "color-mix(in srgb, var(--gr-danger) 25%, var(--gr-bg))",
            "gr-button-danger-soft-bg-hover": "color-mix(in srgb, var(--gr-danger) 19%, var(--gr-bg))",
            "gr-button-info-soft-bg": "color-mix(in srgb, var(--gr-info) 13%, var(--gr-bg))",
            "gr-button-info-soft-bg-active": "color-mix(in srgb, var(--gr-info) 25%, var(--gr-bg))",
            "gr-button-info-soft-bg-hover": "color-mix(in srgb, var(--gr-info) 19%, var(--gr-bg))",
            "gr-button-neutral-bg": "var(--gr-fg)",
            "gr-button-neutral-bg-active": "color-mix(in srgb, var(--gr-fg) 82%, var(--gr-bg))",
            "gr-button-neutral-bg-hover": "color-mix(in srgb, var(--gr-fg) 88%, var(--gr-bg))",
            "gr-button-neutral-fg": "var(--gr-card)",
            "gr-button-primary-soft-bg": "color-mix(in srgb, var(--gr-primary) 13%, var(--gr-bg))",
            "gr-button-primary-soft-bg-active": "color-mix(in srgb, var(--gr-primary) 25%, var(--gr-bg))",
            "gr-button-primary-soft-bg-hover": "color-mix(in srgb, var(--gr-primary) 19%, var(--gr-bg))",
            "gr-button-shadow": "none",
            "gr-button-shadow-active": "none",
            "gr-button-slate-soft-bg": "color-mix(in srgb, var(--gr-slate) 13%, var(--gr-bg))",
            "gr-button-slate-soft-bg-active": "color-mix(in srgb, var(--gr-slate) 25%, var(--gr-bg))",
            "gr-button-slate-soft-bg-hover": "color-mix(in srgb, var(--gr-slate) 19%, var(--gr-bg))",
            "gr-button-success-soft-bg": "color-mix(in srgb, var(--gr-success) 13%, var(--gr-bg))",
            "gr-button-success-soft-bg-active": "color-mix(in srgb, var(--gr-success) 25%, var(--gr-bg))",
            "gr-button-success-soft-bg-hover": "color-mix(in srgb, var(--gr-success) 19%, var(--gr-bg))",
            "gr-button-warning-soft-bg": "color-mix(in srgb, var(--gr-warning) 13%, var(--gr-bg))",
            "gr-button-warning-soft-bg-active": "color-mix(in srgb, var(--gr-warning) 25%, var(--gr-bg))",
            "gr-button-warning-soft-bg-hover": "color-mix(in srgb, var(--gr-warning) 19%, var(--gr-bg))"
          }
        }
      },
      "GrButtonGroup": {
        "root": {
          "gr-button-group-tray-radius": "10px"
        }
      },
      "GrCard": {
        "root": {
          "gr-card-title-size": "var(--gr-text-xl)",
          "gr-card-title-leading": "var(--gr-leading-lg)",
          "gr-card-title-weight": "var(--gr-font-medium)",
          "gr-card-padding-sm": "0.75rem",
          "gr-card-padding-md": "1.25rem",
          "gr-card-padding-lg": "1.5rem",
          "gr-card-hover-bg": "var(--gr-card)",
          "gr-card-hover-brd": "var(--gr-control-brd)"
        }
      },
      "GrCarousel": {
        "root": {
          "gr-carousel-dot-ring-offset": "2px",
          "gr-carousel-dot-ring-width": "2px"
        }
      },
      "GrChip": {
        "root": {
          "gr-chip-neutral-bg": "var(--gr-bg)",
          "gr-chip-neutral-fg": "var(--gr-fg)",
          "gr-chip-neutral-brd": "var(--gr-control-brd)",
          "gr-chip-neutral-hover-brd": "var(--gr-control-brd-hover)"
        },
        "modes": {
          "dark": {
            "gr-chip-neutral-hover-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-chip-neutral-hover-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrColorPicker": {
        "root": {
          "gr-color-picker-area-thumb-border": "#fff",
          "gr-color-picker-area-thumb-ring": "rgba(0, 0, 0, 0.25)",
          "gr-color-picker-trigger-hover-brd": "var(--gr-input-hover)"
        }
      },
      "GrCommandPalette": {
        "root": {
          "gr-command-active-bg": "var(--gr-muted)",
          "gr-command-input-font-size": "16px",
          "gr-command-item-radius": "8px",
          "gr-command-match-bg": "transparent",
          "gr-command-group-label-transform": "none",
          "gr-command-group-label-tracking": "0",
          "gr-command-match-weight": "var(--gr-font-semibold)",
          "gr-command-footer-bg": "var(--gr-bg)"
        }
      },
      "GrDataTable": {
        "root": {
          "gr-datatable-detail-accent": "transparent",
          "gr-datatable-detail-bg": "var(--gr-bg)",
          "gr-datatable-drag-indicator-width": "2px",
          "gr-datatable-pinned-shadow": "inset -1px 0 0 color-mix(in srgb, var(--gr-fg) 30%, transparent)",
          "gr-datatable-pinned-shadow-end": "inset 1px 0 0 color-mix(in srgb, var(--gr-fg) 30%, transparent)",
          "gr-datatable-head-weight": "var(--gr-font-medium)",
          "gr-datatable-first-row-brd": "transparent"
        }
      },
      "GrDescriptionList": {
        "root": {
          "gr-description-list-row-space": "0.625rem",
          "gr-description-list-divided-space": "0.625rem"
        }
      },
      "GrDialog": {
        "root": {
          "gr-dialog-title-size": "22px",
          "gr-dialog-title-leading": "var(--gr-leading-xl)",
          "gr-dialog-title-weight": "var(--gr-font-medium)",
          "gr-dialog-divider": "transparent"
        }
      },
      "GrDivider": {
        "root": {
          "gr-divider-thickness": "1px"
        }
      },
      "GrDrawer": {
        "root": {
          "gr-drawer-title-size": "var(--gr-text-xl)",
          "gr-drawer-title-leading": "var(--gr-leading-lg)",
          "gr-drawer-title-weight": "var(--gr-font-medium)",
          "gr-drawer-shadow": "var(--gr-shadow-3)",
          "gr-drawer-radius": "var(--gr-radius-xl)"
        }
      },
      "GrDropdownMenu": {
        "root": {
          "gr-dropdown-menu-item-height": "2.25rem",
          "gr-dropdown-menu-item-px": "0.625rem",
          "gr-dropdown-menu-item-py": "0.5rem",
          "gr-dropdown-menu-item-hover-fg": "var(--gr-fg)",
          "gr-dropdown-menu-item-danger-hover-bg": "color-mix(in srgb, var(--gr-danger) 10%, transparent)",
          "gr-dropdown-menu-item-danger-hover-fg": "var(--gr-danger-text)",
          "gr-dropdown-menu-item-disabled-bg": "transparent",
          "gr-dropdown-menu-item-disabled-fg": "var(--gr-disabled-fg)"
        },
        "modes": {
          "dark": {
            "gr-dropdown-menu-item-hover-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-dropdown-menu-item-hover-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrEmptyState": {
        "root": {
          "gr-empty-state-title-size-xs": "var(--gr-text-sm)",
          "gr-empty-state-title-leading-xs": "var(--gr-leading-sm)",
          "gr-empty-state-title-size-sm": "var(--gr-text-base)",
          "gr-empty-state-title-leading-sm": "var(--gr-leading-base)",
          "gr-empty-state-title-size-md": "var(--gr-text-xl)",
          "gr-empty-state-title-leading-md": "var(--gr-leading-lg)",
          "gr-empty-state-title-size-lg": "var(--gr-text-2xl)",
          "gr-empty-state-title-leading-lg": "var(--gr-leading-xl)",
          "gr-empty-state-title-weight": "var(--gr-font-medium)",
          "gr-empty-state-icon-brd": "transparent",
          "gr-empty-state-icon-fg": "var(--gr-secondary-fg)",
          "gr-empty-state-icon-radius-xs": "var(--gr-radius-full)",
          "gr-empty-state-icon-radius-sm": "var(--gr-radius-full)",
          "gr-empty-state-icon-radius-md": "var(--gr-radius-full)",
          "gr-empty-state-icon-radius-lg": "var(--gr-radius-full)"
        }
      },
      "GrFileUpload": {
        "root": {
          "gr-file-upload-zone-bg": "var(--gr-bg)",
          "gr-file-upload-zone-brd": "var(--gr-control-brd)",
          "gr-file-upload-zone-over-brd": "var(--gr-fg)",
          "gr-file-upload-icon-brd": "transparent",
          "gr-file-upload-icon-fg": "var(--gr-secondary-fg)",
          "gr-file-upload-icon-radius-xs": "var(--gr-radius-full)",
          "gr-file-upload-icon-radius-sm": "var(--gr-radius-full)",
          "gr-file-upload-icon-radius-md": "var(--gr-radius-full)",
          "gr-file-upload-icon-radius-lg": "var(--gr-radius-full)",
          "gr-file-upload-list-gap": "0.5rem",
          "gr-file-upload-item-bg": "var(--gr-card)",
          "gr-file-upload-item-brd": "var(--gr-brd)",
          "gr-file-upload-item-radius": "10px",
          "gr-file-upload-item-padding": "0.625rem"
        },
        "modes": {
          "dark": {
            "gr-file-upload-zone-hover-bg": "rgba(240, 238, 230, 0.08)",
            "gr-file-upload-zone-over-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-file-upload-zone-hover-bg": "rgba(115, 114, 108, 0.1)",
            "gr-file-upload-zone-over-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrFormField": {
        "root": {
          "gr-form-field-label-fg": "var(--gr-fg)",
          "gr-form-field-label-weight": "var(--gr-font-medium)",
          "gr-form-field-required-fg": "var(--gr-muted-fg)"
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
      "GrLoading": {
        "root": {
          "gr-loading-panel-bg": "var(--gr-card)",
          "gr-loading-panel-radius": "12px",
          "gr-loading-panel-shadow": "var(--gr-shadow-2)"
        }
      },
      "GrModal": {
        "root": {
          "gr-modal-shadow": "var(--gr-shadow-3)",
          "gr-modal-width-sm": "400px",
          "gr-modal-width-md": "480px",
          "gr-modal-width-lg": "640px",
          "gr-modal-width-xl": "920px"
        }
      },
      "GrOtpInput": {
        "root": {
          "gr-otp-input-focus-brd": "var(--gr-ring)",
          "gr-otp-input-caret-color": "var(--gr-fg)"
        }
      },
      "GrPagination": {
        "root": {
          "gr-pagination-page-fg": "var(--gr-fg)",
          "gr-pagination-page-hover-fg": "var(--gr-fg)",
          "gr-pagination-page-weight": "var(--gr-font-medium)"
        },
        "modes": {
          "dark": {
            "gr-pagination-page-hover-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-pagination-page-hover-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrProgressBar": {
        "root": {
          "gr-progress-azure-bg": "var(--gr-azure)",
          "gr-progress-bg": "var(--gr-fg)",
          "gr-progress-buffer-bg": "color-mix(in srgb, var(--gr-muted-fg) 40%, var(--gr-muted))",
          "gr-progress-danger-bg": "var(--gr-danger)",
          "gr-progress-indeterminate-bg": "var(--gr-fg)",
          "gr-progress-indeterminate-duration": "1.6s",
          "gr-progress-info-bg": "var(--gr-info)",
          "gr-progress-neutral-bg": "var(--gr-muted-fg)",
          "gr-progress-slate-bg": "var(--gr-slate)",
          "gr-progress-success-bg": "var(--gr-success-text)",
          "gr-progress-warning-bg": "var(--gr-warning)",
          "gr-progress-track-bg": "var(--gr-brd)",
          "gr-progress-height-xs": "2px",
          "gr-progress-height-sm": "4px",
          "gr-progress-height-md": "6px",
          "gr-progress-height-lg": "8px"
        }
      },
      "GrProgressCircle": {
        "root": {
          "gr-progress-circle-cap": "round",
          "gr-progress-circle-track-bg": "var(--gr-brd)"
        }
      },
      "GrRadio": {
        "root": {
          "gr-radio-checked-bg": "var(--gr-selected)",
          "gr-radio-checked-hover-bg": "var(--gr-selected-hover)",
          "gr-radio-dot": "var(--gr-selected-fg)"
        }
      },
      "GrRating": {
        "root": {
          "gr-rating-void-color": "var(--gr-control-brd)",
          "gr-rating-void-fill": "transparent",
          "gr-rating-void-stroke": "currentColor",
          "gr-rating-stroke-width": "1.5"
        }
      },
      "GrSegmented": {
        "root": {
          "gr-segmented-label-weight": "var(--gr-font-medium)"
        },
        "modes": {
          "dark": {
            "gr-segmented-indicator-highlight-shadow": "0 0 0 1px color-mix(in srgb, var(--gr-fg) 14%, transparent)"
          },
          "light": {
            "gr-segmented-indicator-highlight-shadow": "0 0 0 1px color-mix(in srgb, var(--gr-fg) 15%, transparent)"
          }
        }
      },
      "GrSelect": {
        "modes": {
          "dark": {
            "gr-select-option-active-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-select-option-active-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrSidebar": {
        "root": {
          "gr-sidebar-item-active-weight": "var(--gr-font-medium)",
          "gr-sidebar-group-label-size": "var(--gr-text-xs)",
          "gr-sidebar-group-label-leading": "var(--gr-leading-xs)",
          "gr-sidebar-group-label-weight": "var(--gr-font-regular)",
          "gr-sidebar-group-label-transform": "none",
          "gr-sidebar-group-label-tracking": "0"
        },
        "modes": {
          "dark": {
            "gr-sidebar-item-active-bg": "rgba(240, 238, 230, 0.14)"
          },
          "light": {
            "gr-sidebar-item-active-bg": "rgba(115, 114, 108, 0.18)"
          }
        }
      },
      "GrSkeleton": {
        "root": {
          "gr-skeleton-bg": "var(--gr-muted)",
          "gr-skeleton-brd": "transparent",
          "gr-skeleton-pulse-opacity": "1",
          "gr-skeleton-shine": "color-mix(in srgb, var(--gr-muted) 35%, var(--gr-card))"
        }
      },
      "GrSortableList": {
        "root": {
          "gr-sortable-indicator-width": "2px"
        }
      },
      "GrSteps": {
        "root": {
          "gr-steps-connector-size": "2px",
          "gr-steps-done-bg": "var(--gr-selected)",
          "gr-steps-done-fg": "var(--gr-selected-fg)",
          "gr-steps-current-fg": "var(--gr-fg)"
        }
      },
      "GrSwitch": {
        "root": {
          "gr-switch-off-bg": "var(--gr-control-brd)",
          "gr-switch-thumb-bg": "var(--gr-bg)",
          "gr-switch-thumb-shadow": "none",
          "gr-switch-track-height-xs": "14px",
          "gr-switch-track-width-xs": "24px",
          "gr-switch-track-height-sm": "16px",
          "gr-switch-track-width-sm": "28px",
          "gr-switch-track-height-md": "18px",
          "gr-switch-track-width-md": "32px",
          "gr-switch-track-height-lg": "20px",
          "gr-switch-track-width-lg": "36px",
          "gr-switch-text-track-width-md": "44px",
          "gr-switch-text-track-width-lg": "52px"
        }
      },
      "GrTable": {
        "root": {
          "gr-table-sticky-column-shadow": "inset -1px 0 0 color-mix(in srgb, var(--gr-fg) 30%, transparent)",
          "gr-table-head-bg": "var(--gr-card)",
          "gr-table-hover-share": "100%",
          "gr-table-stripe-share": "55%",
          "gr-table-head-line": "var(--gr-brd-strong)",
          "gr-table-head-line-width": "1px"
        }
      },
      "GrTabs": {
        "root": {
          "gr-tabs-font-weight": "var(--gr-font-medium)",
          "gr-tabs-pills-list-bg": "transparent",
          "gr-tabs-pills-list-brd": "transparent",
          "gr-tabs-pills-radius": "var(--gr-radius-full)",
          "gr-tabs-pills-active-bg": "var(--gr-selected)",
          "gr-tabs-pills-active-fg": "var(--gr-selected-fg)",
          "gr-tabs-pills-active-brd": "var(--gr-selected)"
        },
        "modes": {
          "dark": {
            "gr-tabs-pills-hover-bg": "rgba(240, 238, 230, 0.08)"
          },
          "light": {
            "gr-tabs-pills-hover-bg": "rgba(115, 114, 108, 0.1)"
          }
        }
      },
      "GrTimeline": {
        "root": {
          "gr-timeline-axis-width": "2px",
          "gr-timeline-dash": "4px",
          "gr-timeline-marker-ring": "2px",
          "gr-timeline-neutral-marker": "var(--gr-fg)",
          "gr-timeline-neutral-outline": "var(--gr-control-brd)",
          "gr-timeline-title-weight": "var(--gr-font-regular)",
          "gr-timeline-group-title-transform": "none",
          "gr-timeline-group-title-tracking": "0"
        }
      },
      "GrToaster": {
        "root": {
          "gr-toaster-brd": "transparent",
          "gr-toaster-title-weight": "var(--gr-font-medium)",
          "gr-toaster-icon-tone": "0%"
        },
        "modes": {
          "dark": {
            "gr-toaster-shadow": "0 8px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(240, 238, 230, 0.12)"
          },
          "light": {
            "gr-toaster-shadow": "0 8px 24px rgba(28, 27, 24, 0.13), 0 0 0 1px rgba(31, 30, 29, 0.12)"
          }
        }
      },
      "GrTooltip": {
        "root": {
          "gr-tooltip-bg": "var(--gr-fg)",
          "gr-tooltip-fg": "var(--gr-bg)",
          "gr-tooltip-brd": "var(--gr-fg)",
          "gr-tooltip-radius": "8px",
          "gr-tooltip-shadow": "none"
        }
      },
      "GrTransfer": {
        "root": {
          "gr-transfer-arrived-bg": "color-mix(in srgb, var(--gr-fg) 14%, transparent)",
          "gr-transfer-drop-bg": "color-mix(in srgb, var(--gr-fg) 4%, transparent)",
          "gr-transfer-indicator-width": "3px",
          "gr-transfer-selected-bg": "color-mix(in srgb, var(--gr-fg) 6%, transparent)"
        }
      },
      "GrTree": {
        "root": {
          "gr-tree-branch-weight": "var(--gr-font-regular)"
        }
      }
    },
    "@feugene/granularity-charts": {
      "GrChartArea": {
        "root": {
          "gr-chart-area-fill-fade": "0.02",
          "gr-chart-area-fill-opacity": "0.28",
          "gr-chart-area-line-width": "2px",
          "gr-chart-area-stack-opacity": "0.85"
        }
      },
      "GrChartBar": {
        "root": {
          "gr-chart-bar-dim": "0.35",
          "gr-chart-bar-gap": "1px"
        }
      },
      "GrChartFrame": {
        "root": {
          "gr-chart-frame-brush-fill-opacity": "0.12",
          "gr-chart-frame-grid-width": "1px",
          "gr-chart-frame-reference-band-opacity": "0.12"
        }
      },
      "GrChartFunnel": {
        "root": {
          "gr-chart-funnel-dim": "0.45"
        }
      },
      "GrChartLine": {
        "root": {
          "gr-chart-line-gap-opacity": "0.3",
          "gr-chart-line-width": "2px"
        }
      },
      "GrChartPie": {
        "root": {
          "gr-chart-pie-dim": "0.45",
          "gr-chart-pie-gap": "2px"
        }
      },
      "GrChartRadar": {
        "root": {
          "gr-chart-radar-fill": "0.18",
          "gr-chart-radar-width": "2px"
        }
      },
      "GrChartWaterfall": {
        "root": {
          "gr-chart-waterfall-connector-width": "1px",
          "gr-chart-waterfall-zero-step": "2px"
        }
      },
      "GrSparkline": {
        "root": {
          "gr-sparkline-fill-opacity": "0.15",
          "gr-sparkline-width": "1.5px"
        }
      }
    },
    "@feugene/granularity-media": {
      "GrImageCrop": {
        "root": {
          "gr-image-crop-mask": "rgb(0 0 0 / 0.55)"
        }
      }
    }
  },
  "extensions": {
    "granularity": {
      "componentDefaults": {
        "GrAvatar": {
          "autoColor": false
        },
        "GrBadge": {
          "radius": "semi"
        },
        "GrBreadcrumbs": {
          "separator": "/"
        },
        "GrButton": {
          "loadingIndicator": "shimmer",
          "tone": "neutral"
        },
        "GrButtonGroup": {
          "appearance": "tray"
        },
        "GrConfirmDialog": {
          "cancelVariant": "ghost"
        },
        "GrDescriptionList": {
          "labelWidth": "160px"
        },
        "GrFormField": {
          "hintPosition": "bottom"
        },
        "GrPagination": {
          "size": "sm"
        },
        "GrProgressBar": {
          "borderless": true
        },
        "GrPromptDialog": {
          "cancelVariant": "ghost"
        },
        "GrRating": {
          "tone": "neutral"
        },
        "GrSteps": {
          "size": "sm"
        },
        "GrTabs": {
          "variant": "line"
        },
        "GrToaster": {
          "placement": "bottom-right"
        }
      }
    }
  }
}

export default data
