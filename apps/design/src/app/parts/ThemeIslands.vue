<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import type { GrModeEntry } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import { themeModes } from '../themes'

/**
 * Одно содержимое во всех режимах темы рядом. Режим — пара в атрибуте
 * поддерева, поэтому остров светлого режима честно светлый и внутри тёмной
 * страницы. Без `theme` — тема документа, она же тема адреса, с ним — эта тема
 * сборки: режимы островов — всегда той темы, чьи значения они показывают.
 */
const props = defineProps<{ theme?: string }>()

defineSlots<{ default: (props: { mode: GrModeEntry }) => unknown }>()

const route = useRoute()
const modes = computed(() => themeModes(themeManifest, props.theme ?? String(route.params.theme)))
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <GrConfigProvider
      v-for="mode in modes"
      :key="mode.name"
      :theme="props.theme"
      :mode="mode.name"
    >
      <div class="flex h-full min-w-0 flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4 text-[var(--gr-fg)] lg:p-5">
        <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          {{ mode.title ?? mode.name }} · <code class="font-[var(--gr-font-mono)] font-400">{{ mode.value }}</code>
        </p>
        <slot :mode="mode" />
      </div>
    </GrConfigProvider>
  </div>
</template>
