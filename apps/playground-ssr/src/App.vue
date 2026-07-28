<script setup lang="ts">
import { ref } from 'vue'

import {
  GrAlert,
  GrAutocomplete,
  GrBadge,
  GrButton,
  GrCard,
  GrCheckbox,
  GrDropdown,
  GrFormField,
  GrInput,
  GrModal,
  GrSelect,
  GrTable,
  GrTooltip,
} from '@feugene/granularity'

import ClientOnly from './ClientOnly.vue'

/**
 * Страница разделена по тому, как компонент ведёт себя при серверном рендере:
 *
 *  1. изоморфные (`GrCard`, `GrBadge`, `GrTable`, `GrInput`, …) — приходят с
 *     сервера целиком и гидрируются без единого расхождения;
 *  2. телепортирующие (`GrSelect` в режиме `panel`, `GrAutocomplete`,
 *     `GrDropdown`, `GrTooltip`, `GrModal`) — на сервере их разметка не
 *     совпадает с клиентской, поэтому обёрнуты в `ClientOnly`;
 *  3. `GrSelect` по умолчанию — нативный `<select>`, телепорта нет вовсе.
 *
 * Почему пункт 2 именно так — доказано тестами в `src/__tests__/`:
 * без обёртки Vue сообщает hydration mismatch, а в браузере страница
 * пропадает целиком (см. README и ANALYSIS §60).
 */

const projectName = ref('SSR')
const compact = ref(true)

const frameworkNative = ref('vue')
const frameworkPanel = ref('vue')
const renderer = ref('')

const frameworks = [
  { label: 'Vue', value: 'vue' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Vite SSR', value: 'vite-ssr' },
]

const renderers = [
  { label: 'renderToString', value: 'to-string' },
  { label: 'renderToWebStream', value: 'web-stream' },
]

const modalOpen = ref(false)
</script>

<template>
  <main class="min-h-screen bg-[var(--gr-bg)] text-[var(--gr-fg)]">
    <div class="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header>
        <p class="text-sm text-[var(--gr-muted-fg)]">
          playground-ssr
        </p>
        <h1 class="text-2xl font-semibold">
          Серверный рендер и гидрация
        </h1>
        <p class="mt-2 text-sm text-[var(--gr-muted-fg)]">
          Смотрите <b>исходный HTML</b> страницы, а не DOM в инспекторе: секции 1 и 3
          пришли с сервера, секция 2 на сервере пуста намеренно.
        </p>
      </header>

      <GrAlert tone="info" data-testid="isomorphic-alert">
        Этот блок отрисован на сервере целиком.
      </GrAlert>

      <GrCard class="p-5">
        <div class="flex flex-col gap-4">
          <h2 class="text-base font-semibold">
            1. Изоморфные компоненты
          </h2>

          <GrFormField label="Название проекта">
            <GrInput v-model="projectName" />
          </GrFormField>

          <GrCheckbox v-model="compact">
            Компактные строки
          </GrCheckbox>

          <div class="flex flex-wrap gap-2">
            <GrBadge tone="success">
              server
            </GrBadge>
            <GrBadge tone="info" dark>
              hydrated
            </GrBadge>
          </div>

          <!-- GrTable — «тонкий» контейнер: разметку строк даёт консьюмер -->
          <GrTable caption="Классы компонентов по docs/ssr.md">
            <template #head>
              <tr>
                <th class="px-3 py-2 text-left">
                  Компонент
                </th>
                <th class="px-3 py-2 text-left">
                  Класс по docs/ssr.md
                </th>
              </tr>
            </template>

            <tr>
              <td class="px-3 py-2">
                GrCard
              </td>
              <td class="px-3 py-2">
                изоморфный
              </td>
            </tr>
            <tr>
              <td class="px-3 py-2">
                GrDropdown
              </td>
              <td class="px-3 py-2">
                телепорт без гарда
              </td>
            </tr>
            <tr>
              <td class="px-3 py-2">
                GrModal
              </td>
              <td class="px-3 py-2">
                телепорт с гардом
              </td>
            </tr>
          </GrTable>
        </div>
      </GrCard>

      <GrCard class="p-5">
        <div class="flex flex-col gap-4">
          <h2 class="text-base font-semibold">
            2. Требуют client-only
          </h2>

          <p class="text-sm text-[var(--gr-muted-fg)]">
            Их панели телепортируются, и серверная разметка не совпадает с
            клиентской. Без обёртки страница ломается целиком: стили панели
            «прилипают» к контейнеру приложения. Поэтому здесь — рабочий обход,
            <code>ClientOnly</code>: на сервере пусто, рендер после гидрации.
          </p>

          <ClientOnly>
            <template #fallback>
              <div class="text-sm text-[var(--gr-muted-fg)]">
                Здесь на сервере намеренно пусто.
              </div>
            </template>

            <div class="flex flex-col gap-4">
              <GrFormField label="Фреймворк (optionsView=panel)">
                <GrSelect
                  v-model="frameworkPanel"
                  :options="frameworks"
                  options-view="panel"
                />
              </GrFormField>

              <GrFormField label="Рендерер (автокомплит)">
                <GrAutocomplete v-model="renderer" :options="renderers" />
              </GrFormField>

              <GrDropdown>
                <template #trigger="{ triggerProps }">
                  <GrButton v-bind="triggerProps" variant="outline" size="sm">
                    Меню
                  </GrButton>
                </template>
                <template #content>
                  <div class="px-3 py-2 text-sm">
                    Пункт меню
                  </div>
                </template>
              </GrDropdown>

              <GrTooltip text="Подсказка появится после гидрации">
                <GrButton variant="ghost" size="sm">
                  Наведи или сфокусируй
                </GrButton>
              </GrTooltip>

              <div>
                <GrButton size="sm" @click="modalOpen = true">
                  Открыть модалку
                </GrButton>
              </div>

              <GrModal v-model="modalOpen">
                <template #title>
                  Модалка
                </template>
                Оверлеи тоже телепортируют — и тоже требуют client-only.
              </GrModal>
            </div>
          </ClientOnly>
        </div>
      </GrCard>

      <GrCard class="p-5">
        <div class="flex flex-col gap-4">
          <h2 class="text-base font-semibold">
            3. Безопасны на сервере
          </h2>

          <p class="text-sm text-[var(--gr-muted-fg)]">
            Нативный <code>&lt;select&gt;</code> приходит с сервера вместе с опциями:
            телепорта нет, гидрировать нечего, расхождений нет.
          </p>

          <!-- GrSelect по умолчанию — нативный <select>, никакого телепорта -->
          <GrFormField label="Фреймворк (optionsView=native, по умолчанию)">
            <GrSelect v-model="frameworkNative" :options="frameworks" />
          </GrFormField>

        </div>
      </GrCard>
    </div>
  </main>
</template>
