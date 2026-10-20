<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import themeManifest from 'virtual:granum/themes'

import ColorSwatch from '../parts/ColorSwatch.vue'
import DocSection from '../parts/DocSection.vue'
import PageHeader from '../parts/PageHeader.vue'
import ThemeIslands from '../parts/ThemeIslands.vue'
import { findDesignTheme, THEME_BUILD_LABEL } from '../themes'
import NotFoundPage from './NotFoundPage.vue'

const route = useRoute()

const theme = computed(() => findDesignTheme(themeManifest, String(route.params.theme)))
/** Тема превью пишется в острова явно, активная — наследуется от корня. */
const islandTheme = computed(() => (theme.value?.build === 'preview' ? theme.value.entry.id : undefined))

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

  <div v-else class="mx-auto flex max-w-[1360px] flex-col gap-12 px-4 py-10 lg:px-10">
    <PageHeader eyebrow="Темы" :title="theme.entry.title" :lead="theme.entry.description">
      <div class="flex flex-wrap items-center gap-1.5">
        <GrBadge :tone="theme.build === 'absent' ? 'warning' : 'success'" size="sm">
          {{ THEME_BUILD_LABEL[theme.build] }}
        </GrBadge>
        <GrBadge tone="neutral" size="sm">
          <code class="font-[var(--gr-font-mono)]">theme: '{{ theme.entry.id }}'</code>
        </GrBadge>
        <GrBadge v-if="theme.entry.extends" tone="neutral" size="sm">
          поверх «{{ theme.entry.extends }}»
        </GrBadge>
        <GrLink v-if="theme.entry.docs" :href="theme.entry.docs" class="ms-1 text-[length:var(--gr-text-sm)]">
          {{ theme.entry.docs }}
        </GrLink>
      </div>
    </PageHeader>

    <GrAlert v-if="theme.build === 'absent'" tone="warning" title="Тема не собрана">
      Блоков её пар нет в CSS этой сборки: добавьте <code>'{{ theme.entry.id }}'</code> в
      <code>previews</code> конфига granum.
    </GrAlert>

    <template v-else>
      <DocSection title="Режимы" lead="Режим включается парой в атрибуте корня или поддерева; режим по умолчанию у активной темы висит ещё и на :root.">
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

      <DocSection title="Основы" lead="Роли и форма — значения этой темы в каждом её режиме.">
        <ThemeIslands :theme="islandTheme">
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

      <DocSection title="Компоненты" lead="Настоящие компоненты пакета под парой темы: токены компонентов и пропсы по умолчанию — её.">
        <ThemeIslands :theme="islandTheme">
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
    </template>
  </div>
</template>
