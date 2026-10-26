<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { findComponent, findGroup } from '../catalog'
import { viewsOf } from '../component/views'
import { comparisonRow, comparisonTable, designDoc } from '../docs'
import CopyButton from '../parts/CopyButton.vue'
import HooksPanel from '../parts/HooksPanel.vue'
import PageHeader from '../parts/PageHeader.vue'
import ThemePicker from '../parts/ThemePicker.vue'
import { useViewedTheme } from '../viewedTheme'
import NotFoundPage from './NotFoundPage.vue'

const route = useRoute()
const router = useRouter()
const theme = useViewedTheme()

const component = computed(() => findComponent(String(route.params.component)))
const views = computed(() => (component.value ? viewsOf(component.value) : undefined))

const importLine = computed(() => (component.value ? `import { ${component.value.exports.join(', ')} } from '${component.value.importPath}'` : ''))

const traits = computed(() => {
  const doc = component.value ? designDoc(component.value.exports[0]!) : undefined
  const table = doc ? comparisonTable(doc) : undefined
  return table ? comparisonRow(table, 'Характер') : undefined
})

const tabs = computed(() => [
  { value: 'overview', label: 'Обзор' },
  ...(views.value?.style ? [{ value: 'style', label: `Стиль темы «${theme.value.data.title}»` }] : []),
  { value: 'themes', label: 'Темы рядом' },
  { value: 'tokens', label: 'Токены' },
  { value: 'hooks', label: 'Хуки' },
])

/** Вкладка — в адресе (`?tab=`): ссылку на «Токены „Чертежа“» можно отдать, смена темы её сохраняет. */
const activeTab = computed({
  get: () => {
    const tab = route.query.tab
    return typeof tab === 'string' && tabs.value.some(item => item.value === tab) ? tab : 'overview'
  },
  set: (next: string) => {
    void router.replace({ query: next === 'overview' ? {} : { tab: next } })
  },
})
</script>

<template>
  <NotFoundPage v-if="!component || !views" />

  <!-- Ключ — компонент: страница переиспользуется маршрутом, и без него вкладки (`keep-alive`) показали бы прежний компонент. -->
  <div v-else :key="component.id" class="mx-auto flex max-w-[1360px] flex-col gap-8 px-4 py-10 lg:px-10">
    <PageHeader :eyebrow="`Компонент · ${findGroup(component.group)?.title}`" :title="component.name" :lead="component.summary">
      <div class="mt-1 flex min-w-0 max-w-full items-center gap-1 self-start rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] py-1 pe-1 ps-3">
        <code class="min-w-0 truncate font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ importLine }}</code>
        <CopyButton :text="importLine" label="Скопировать импорт" />
      </div>
    </PageHeader>

    <section class="flex flex-col gap-3" aria-labelledby="theme-picker-title">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="theme-picker-title" class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
          Тема
        </h2>
        <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
          Выбранная тема включается у всего приложения — как переключателем в шапке.
        </p>
      </div>
      <ThemePicker :traits="traits">
        <template #preview>
          <component :is="views.preview" />
        </template>
      </ThemePicker>
    </section>

    <div class="flex flex-col gap-8">
      <div class="component-tabs">
        <GrTabs v-model="activeTab" variant="line" :tabs="tabs" :id-base="`tabs-${component.id}`" />
      </div>

      <GrTabPanels v-model="activeTab" :id-base="`tabs-${component.id}`">
        <GrTabPanel value="overview" keep-alive lazy>
          <component :is="views.overview" />
        </GrTabPanel>
        <GrTabPanel v-if="views.style" value="style" keep-alive lazy>
          <component :is="views.style" />
        </GrTabPanel>
        <GrTabPanel value="themes" keep-alive lazy>
          <component :is="views.themes" />
        </GrTabPanel>
        <GrTabPanel value="tokens" keep-alive lazy>
          <component :is="views.tokens" />
        </GrTabPanel>
        <GrTabPanel value="hooks" keep-alive lazy>
          <HooksPanel :owners="component.exports" />
        </GrTabPanel>
      </GrTabPanels>
    </div>
  </div>
</template>

<style scoped>
/* Вкладки под шапкой приложения (`h-14`): длинная вкладка не уводит их из виду. */
.component-tabs {
  position: sticky;
  top: 3.5rem;
  z-index: 1;
  margin-inline: calc(-1 * var(--gr-space-4));
  padding-inline: var(--gr-space-4);
  border-bottom: 1px solid var(--gr-brd);
  background: color-mix(in srgb, var(--gr-bg) 92%, transparent);
  backdrop-filter: blur(8px);
}

@media (min-width: 1024px) {
  .component-tabs {
    margin-inline: calc(-1 * var(--gr-space-10));
    padding-inline: var(--gr-space-10);
  }
}
</style>
