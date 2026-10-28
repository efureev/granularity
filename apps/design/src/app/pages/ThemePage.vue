<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import themeManifest from 'virtual:granum/themes'
import IconArrowRight from '~icons/lucide/arrow-right'

import { catalog } from '../catalog'
import ColorSwatch from '../parts/ColorSwatch.vue'
import DocSection from '../parts/DocSection.vue'
import HooksPanel from '../parts/HooksPanel.vue'
import ThemeIslands from '../parts/ThemeIslands.vue'
import { plural } from '../plural'
import ThemeComponentValues from '../theme/ThemeComponentValues.vue'
import ThemeHero from '../theme/ThemeHero.vue'
import ThemeTokensPanel from '../theme/ThemeTokensPanel.vue'
import { findDesignTheme, islandTheme, modeColumns } from '../themes'
import { useThemeView } from '../viewedTheme'
import { componentTokens } from '../tokenRegistry'
import NotFoundPage from './NotFoundPage.vue'

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug))
const theme = computed(() => findDesignTheme(themeManifest, slug.value))
const islands = computed(() => (theme.value ? islandTheme(theme.value) : undefined))
const { view, error: dataError } = useThemeView(() => slug.value)
const modes = computed(() => modeColumns(themeManifest, slug.value))
const hookOwners = [...new Set(componentTokens.filter(token => token.kind === 'hook').map(token => token.owner))]

const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'tokens', label: 'Токены' },
  { value: 'hooks', label: 'Хуки' },
]

/** Вкладка — в адресе (`?tab=`): ссылку на токены темы можно отдать. */
const activeTab = computed({
  get: () => {
    const tab = route.query.tab
    return typeof tab === 'string' && tabs.some(item => item.value === tab) ? tab : 'overview'
  },
  set: (next: string) => {
    void router.replace({ query: next === 'overview' ? {} : { tab: next } })
  },
})

// Тема всего приложения живёт в адресе: применить — перейти на ту же страницу
// под этой темой, а роутер включит её у документа.
const applying = ref(false)
const applyError = ref<string>()
const applied = computed(() => theme.value?.entry.id === route.params.theme)

async function applyToApp(): Promise<void> {
  if (!theme.value)
    return
  applying.value = true
  applyError.value = undefined
  try {
    await router.push({ params: { theme: theme.value.entry.id } })
  }
  catch (error) {
    applyError.value = (error as Error).message
  }
  finally {
    applying.value = false
  }
}

const roles = [
  { title: 'Поверхности и текст', names: ['--gr-bg', '--gr-card', '--gr-muted', '--gr-fg', '--gr-muted-fg', '--gr-brd'] },
  { title: 'Тоны', names: ['--gr-primary', '--gr-success', '--gr-warning', '--gr-danger', '--gr-info', '--gr-accent'] },
]
const radii = ['--gr-radius-sm', '--gr-radius-control', '--gr-radius-md', '--gr-radius-lg']
const tones = ['primary', 'neutral', 'success', 'danger'] as const

const query = ref('Поиск по проекту')
const notify = ref(true)
const period = ref('week')
const scale = ref('День')
const scales = ['День', 'Неделя', 'Месяц']
const periods = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
]
</script>

<template>
  <NotFoundPage v-if="!theme" />

  <!-- Ключ — тема: страница переиспользуется маршрутом, и вкладки (`keep-alive`) не должны держать прежнюю. -->
  <div v-else :key="theme.entry.id" class="mx-auto flex max-w-[1360px] flex-col gap-8 px-4 py-10 lg:px-10">
    <ThemeHero :theme="theme" :applied="applied" :applying="applying" @apply="applyToApp" />

    <GrAlert v-if="applyError" tone="danger" title="Тему не удалось применить">
      {{ applyError }}
    </GrAlert>

    <GrAlert v-if="theme.build === 'absent'" tone="warning" title="Тема не собрана">
      Блоков её пар нет в CSS этой сборки: добавьте <code>'{{ theme.entry.id }}'</code> в
      <code>themes</code> конфига granum.
    </GrAlert>

    <GrAlert v-if="dataError" tone="danger" title="Данные темы не загрузились">
      {{ dataError }}
    </GrAlert>

    <div class="flex flex-col gap-8">
      <div class="theme-tabs">
        <GrTabs v-model="activeTab" variant="line" :tabs="tabs" id-base="theme-tabs" />
      </div>

      <GrTabPanels v-model="activeTab" id-base="theme-tabs">
        <GrTabPanel value="overview" keep-alive lazy>
          <div v-if="theme.build !== 'absent'" class="flex flex-col gap-12">
      <DocSection title="Режимы" wide-lead lead="Режим включается парой в атрибуте корня или поддерева; режим по умолчанию у основной темы действует и без атрибута.">
        <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Режимы темы">
          <table class="w-full min-w-[480px] border-collapse text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-base)]">
            <thead>
              <tr class="text-[var(--gr-muted-fg)]">
                <th scope="col" class="py-2 pe-3 text-start font-500">
                  режим
                </th>
                <th scope="col" class="px-2 py-2 text-start font-500">
                  схема
                </th>
                <th scope="col" class="px-2 py-2 text-start font-500">
                  пара
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mode in theme.modes" :key="mode.name" class="border-t border-[var(--gr-brd)]">
                <th scope="row" class="py-2.5 pe-3 text-start font-500">
                  {{ mode.title ?? mode.name }}
                  <GrBadge v-if="mode.name === theme.entry.defaultMode" tone="neutral" size="sm" class="ms-1.5">
                    по умолчанию
                  </GrBadge>
                </th>
                <td class="px-2 py-2.5">
                  {{ mode.colorScheme }}
                </td>
                <td class="px-2 py-2.5">
                  <code class="font-[var(--gr-font-mono)]">data-theme="{{ mode.value }}"</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Основы" wide-lead lead="Роли и форма — значения этой темы в каждом её режиме.">
        <ThemeIslands :theme="islands">
          <div class="flex flex-col gap-5">
            <div v-for="group in roles" :key="group.title" class="flex flex-col gap-2">
              <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
                {{ group.title }}
              </h3>
              <ul class="grid gap-3 sm:grid-cols-2">
                <li v-for="name in group.names" :key="name">
                  <ColorSwatch :name="name" />
                </li>
              </ul>
            </div>
            <div class="flex flex-col gap-2">
              <h3 class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
                Скругления
              </h3>
              <ul class="flex flex-wrap gap-3">
                <li
                  v-for="radius in radii"
                  :key="radius"
                  class="flex h-14 w-24 items-end border border-[var(--gr-control-brd)] bg-[var(--gr-card)] p-2"
                  :style="{ borderRadius: `var(${radius})` }"
                >
                  <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]">{{ radius.slice(12) }}</code>
                </li>
              </ul>
            </div>
          </div>
        </ThemeIslands>
      </DocSection>

      <DocSection title="Компоненты" wide-lead lead="Настоящие компоненты пакета под парой темы: токены компонентов и пропсы по умолчанию — её.">
        <RouterLink class="theme-components-link" :to="{ name: 'components', params: { theme: theme.entry.id } }">
          Все {{ plural(catalog.length, ['компонент', 'компонента', 'компонентов']) }} в теме «{{ theme.entry.title }}»
          <GrIcon><IconArrowRight /></GrIcon>
        </RouterLink>
        <ThemeIslands :theme="islands">
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <GrButton v-for="tone in tones" :key="tone" :tone="tone">
                {{ tone }}
              </GrButton>
              <GrButton variant="secondary">
                Второстепенная
              </GrButton>
              <GrButton variant="outline" tone="danger">
                Удалить
              </GrButton>
            </div>
            <!-- Пропсы по умолчанию темы: вид загрузки и группы — свои у каждой темы -->
            <div class="flex flex-wrap items-center gap-3">
              <GrButton tone="neutral" loading>
                Сохраняем
              </GrButton>
              <GrButtonGroup size="sm" aria-label="Масштаб">
                <GrButton v-for="item in scales" :key="item" :aria-pressed="scale === item ? 'true' : 'false'" @click="scale = item">
                  {{ item }}
                </GrButton>
              </GrButtonGroup>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <GrBadge tone="success">
                Оплачено
              </GrBadge>
              <GrBadge tone="warning">
                Ждёт
              </GrBadge>
              <GrBadge tone="info">
                Черновик
              </GrBadge>
            </div>
            <GrFormField label="Запрос">
              <GrInput v-model="query" />
            </GrFormField>
            <div class="flex flex-wrap items-center gap-4">
              <GrSwitch v-model="notify">
                Уведомления
              </GrSwitch>
              <GrSegmented v-model="period" :options="periods" aria-label="Период" />
            </div>
            <GrAlert tone="info" title="Подсказка">
              Мягкая подложка тона и текст на ней.
            </GrAlert>
          </div>
        </ThemeIslands>
      </DocSection>

      <ThemeComponentValues v-if="view" :view="view" />
          </div>
        </GrTabPanel>

        <GrTabPanel value="tokens" keep-alive lazy>
          <ThemeTokensPanel v-if="view" :view="view" :modes="modes" :previews="theme.build !== 'absent'" />
          <GrSkeleton v-else :rows="6" />
        </GrTabPanel>

        <GrTabPanel value="hooks" keep-alive lazy>
          <HooksPanel :owners="hookOwners" filters />
        </GrTabPanel>
      </GrTabPanels>
    </div>
  </div>
</template>

<style scoped>
.theme-components-link {
  display: inline-flex;
  align-items: center;
  gap: var(--gr-space-1);
  align-self: flex-start;
  border-radius: var(--gr-radius-xs);
  color: var(--gr-fg);
  font-size: var(--gr-text-sm);
  font-weight: var(--gr-font-semibold);
  line-height: var(--gr-leading-sm);
  text-decoration: none;
}

.theme-components-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.theme-components-link:focus-visible {
  outline: 2px solid var(--gr-ring);
  outline-offset: 2px;
}

/* Вкладки под шапкой приложения (`h-14`): длинная вкладка не уводит их из виду. */
.theme-tabs {
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
  .theme-tabs {
    margin-inline: calc(-1 * var(--gr-space-10));
    padding-inline: var(--gr-space-10);
  }
}
</style>
