<script setup lang="ts">
import { computed } from 'vue'

import themeManifest from 'virtual:granum/themes'

import { themeTokenRows } from '../componentTokens'
import { componentTokens } from '../tokenRegistry'
import TokenTable from '../parts/TokenTable.vue'
import { plural } from '../plural'
import type { TokenTableSection } from '../themeTokens'
import { modeColumns } from '../themes'
import { useViewedTheme } from '../viewedTheme'
import { useCatalogComponent } from './views'

const component = useCatalogComponent()
const theme = useViewedTheme()

const tokens = computed(() => componentTokens.filter(token => component.value.tokenOwners.includes(token.owner)))
const modes = computed(() => modeColumns(themeManifest, theme.value.id))
const rows = computed(() => themeTokenRows(tokens.value, theme.value.data))
const others = computed(() => tokens.value.length - rows.value.length)

const sections = computed<TokenTableSection[]>(() => rows.value.length === 0
  ? []
  : [{
      id: 'theme',
      title: 'Токены вида theme',
      rows: rows.value.map(row => ({ name: row.token.name, description: row.token.description, value: row.root, modes: row.modes, preview: row.preview })),
    }])
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex max-w-[76ch] flex-col gap-1">
      <h2 class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)] tracking-[-0.01em]">
        Значения темы «{{ theme.data.title }}»
      </h2>
      <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)] text-[var(--gr-muted-fg)]">
        <template v-if="rows.length > 0">
          {{ plural(rows.length, ['токен', 'токена', 'токенов']) }} вида <code class="font-[var(--gr-font-mono)]">theme</code>:
          имена — контракт компонента, значения — у темы. Образцы посчитаны браузером под парой своего режима.
        </template>
        <template v-else>
          Своих токенов вида <code class="font-[var(--gr-font-mono)]">theme</code> у компонента нет: его вид задают
          роли темы — фон, текст, рамки, радиусы — и они на странице темы.
        </template>
        <template v-if="others > 0">
          Ещё {{ plural(others, ['токен', 'токена', 'токенов']) }} — ручки приложения и значения, которые ставит сам компонент: они на вкладке «Хуки» и в документации.
        </template>
      </p>
    </div>

    <TokenTable v-if="sections.length > 0" :sections="sections" :modes="modes" />
  </div>
</template>
