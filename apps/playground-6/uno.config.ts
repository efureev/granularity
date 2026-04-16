import {
  createGranularityCssPreflights,
  presetGranularity,
} from '@feugene/granularity/uno'
import { defineConfig, presetMini } from 'unocss'

export const playground6ContentIncludes = [
  /apps\/playground-6\/src\/.*\.(vue|ts)($|\?)/,
]

export const playground6GranularityComponents = ['DsButton'] as const
export const playground6GranularityLayer = 'granularity'

export const playground6PreflightCss = `
:root {
  --bg: #fff1f2;
  --fg: #3f0d24;
  --primary: #db2777;
  --primary-fg: #ffffff;
  --secondary: #fbcfe8;
  --secondary-fg: #831843;
  --destructive: #be123c;
  --destructive-fg: #ffffff;
  --brd: #f9a8d4;
  --ring: #ec4899;
  --muted: #ffe4e6;
  --primary-hover: #be185d;
  --primary-active: #9d174d;
  --secondary-hover: #f9a8d4;
  --secondary-active: #f472b6;
  --destructive-hover: #9f1239;
  --destructive-active: #881337;
}

html, body, #app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
  background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%);
  color: var(--fg);
}
`

export default defineConfig({
  content: {
    pipeline: {
      include: playground6ContentIncludes,
    },
  },
  presets: [
    presetMini(),
    presetGranularity({
      components: [...playground6GranularityComponents],
      layer: playground6GranularityLayer,
      preflights: createGranularityCssPreflights([playground6PreflightCss], playground6GranularityLayer),
    }),
  ],
})
