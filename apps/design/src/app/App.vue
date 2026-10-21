<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useTheme } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'
import IconMenu from '~icons/lucide/menu'
import IconMoon from '~icons/lucide/moon'
import IconSun from '~icons/lucide/sun'

import AppSidebar from './parts/AppSidebar.vue'
import { THEME_STORAGE_KEY } from './theme'
import { designThemes } from './themes'

const route = useRoute()
const router = useRouter()
const { isDark, toggleMode } = useTheme({ storageKey: THEME_STORAGE_KEY })

// Тема — в адресе: выбор в шапке — та же страница под другой темой.
const themeOptions = designThemes(themeManifest)
  .filter(theme => theme.build !== 'absent')
  .map(theme => ({ value: theme.entry.id, label: theme.entry.title }))
const viewedTheme = computed({
  get: () => String(route.params.theme ?? ''),
  set: (id: string) => void router.push({ params: { theme: id } }),
})

/**
 * Узкий экран решает приложение, а не панель: своих брейкпоинтов у пакета нет.
 * Совпадает с `--gr-bp-lg`.
 */
const narrow = ref(false)
const menuOpen = ref(false)
let query: MediaQueryList | undefined

function syncNarrow(): void {
  narrow.value = query?.matches ?? false
}

onMounted(() => {
  query = matchMedia('(max-width: 1023px)')
  syncNarrow()
  query.addEventListener('change', syncNarrow)
})

onBeforeUnmount(() => query?.removeEventListener('change', syncNarrow))

watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <a href="#main" class="skip-link">К содержимому</a>

  <div class="flex min-h-screen bg-[var(--gr-bg)] text-[var(--gr-fg)]">
    <AppSidebar v-model:open="menuOpen" :overlay="narrow" />

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-[var(--gr-z-navbar)] flex h-14 items-center gap-2 border-b border-[var(--gr-brd)] bg-[color-mix(in_srgb,var(--gr-bg)_88%,transparent)] px-4 backdrop-blur-[8px] lg:px-8">
        <GrButton
          v-if="narrow"
          variant="ghost"
          tone="neutral"
          square
          aria-label="Разделы"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          @click="menuOpen = true"
        >
          <GrIcon><IconMenu /></GrIcon>
        </GrButton>
        <template v-if="narrow">
          <span class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">granularity</span>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">дизайн-система</span>
        </template>

        <div class="ms-auto flex items-center gap-2">
          <GrSelect
            v-if="viewedTheme"
            v-model="viewedTheme"
            :options="themeOptions"
            size="sm"
            aria-label="Тема"
            class="w-36"
          />
          <GrButton
            variant="ghost"
            tone="neutral"
            square
            :aria-label="isDark ? 'Светлый режим' : 'Тёмный режим'"
            @click="toggleMode"
          >
            <GrIcon>
              <IconSun v-if="isDark" />
              <IconMoon v-else />
            </GrIcon>
          </GrButton>
        </div>
      </header>

      <main id="main" tabindex="-1" class="min-w-0 flex-1 outline-none">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  inset-block-start: var(--gr-space-3);
  inset-inline-start: var(--gr-space-3);
  z-index: var(--gr-z-toast);
  padding: var(--gr-space-2) var(--gr-space-3);
  border-radius: var(--gr-radius-control);
  background: var(--gr-card);
  box-shadow: var(--gr-shadow-2);
  color: var(--gr-fg);
  font-size: var(--gr-text-sm);
  transform: translateY(calc(-100% - var(--gr-space-6)));
}

.skip-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
  transform: none;
}
</style>
