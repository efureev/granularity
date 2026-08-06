import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-basic-menu',
    title: 'Basic actions menu',
    description: 'Стартовый сценарий для `GrDropdown`: trigger/content slots, короткий action list и автоматическое закрытие по клику.',
    status: 'ready',
    previewKey: 'gr-dropdown-basic-menu',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const lastAction = ref(t('components.GrDropdown.basic.noAction'))

function select(action: string) {
  lastAction.value = action
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown>
      <template #trigger="{ open, triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">
          {{ open ? t('components.GrDropdown.basic.closeMenu') : t('components.GrDropdown.basic.openMenu') }}
        </GrButton>
      </template>

      <template #content>
        <div class="grid gap-1">
          <button type="button" role="menuitem" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.preview'))">
            {{ t('components.GrDropdown.basic.preview') }}
          </button>
          <button type="button" role="menuitem" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.duplicate'))">
            {{ t('components.GrDropdown.basic.duplicate') }}
          </button>
          <button type="button" role="menuitem" class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]" @click="select(t('components.GrDropdown.basic.archive'))">
            {{ t('components.GrDropdown.basic.archive') }}
          </button>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ lastAction }}
    </GrBadge>
  </div>
</template>`,
  },
  {
    id: 'dropdown-alignment-width',
    title: 'Alignment and width presets',
    description: 'Отдельно сравниваем `align` и `width`, чтобы быстро проверить positioning и ожидаемую ширину выпадающего контента.',
    status: 'ready',
    previewKey: 'gr-dropdown-alignment-width',
    code: `<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown placement="bottom-start" width="12rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">{{ t('components.GrDropdown.alignment.left') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.leftAligned') }}</div>
          <div class="text-[var(--gr-muted-fg)]">
            {{ t('components.GrDropdown.alignment.leftHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="top" :offset="16" :width="240">
      <template #trigger="{ triggerProps }">
        <GrButton v-bind="triggerProps">{{ t('components.GrDropdown.alignment.center') }}</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.alignment.centerAligned') }}</div>
          <div class="text-[var(--gr-muted-fg)]">
            {{ t('components.GrDropdown.alignment.centerHint') }}
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="bottom-end" width="auto">
      <template #trigger="{ triggerProps }">
        <GrButton variant="ghost-border" v-bind="triggerProps">{{ t('components.GrDropdown.alignment.autoWidth') }}</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          {{ t('components.GrDropdown.alignment.autoHint') }}
        </div>
      </template>
    </GrDropdown>
  </div>
</template>`,
  },
  {
    id: 'dropdown-persistent-content',
    title: 'Persistent content with manual close',
    description: 'Показываем `closeOnContentClick=false`, когда внутри dropdown есть mini-form/filter pane и компонент не должен закрываться после каждого клика.',
    status: 'ready',
    previewKey: 'gr-dropdown-persistent-content',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrDropdown } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()

const options = computed(() => [
  { value: 'errors', label: t('components.GrDropdown.persistent.errors') },
  { value: 'warnings', label: t('components.GrDropdown.persistent.warnings') },
  { value: 'passed', label: t('components.GrDropdown.persistent.passed') },
])

const selected = ref<string[]>(['errors'])

const selectedLabels = computed(() =>
  options.value
    .filter(option => selected.value.includes(option.value))
    .map(option => option.label)
    .join(', '),
)

function toggleOption(option: string) {
  selected.value = selected.value.includes(option)
    ? selected.value.filter(item => item !== option)
    : [...selected.value, option]
}
</script>

<template>
  <div class="grid gap-3">
    <GrDropdown :close-on-content-click="false" width="16rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">{{ t('components.GrDropdown.persistent.filters') }}</GrButton>
      </template>

      <template #content="{ close }">
        <div class="grid gap-3 px-3 py-2 text-sm">
          <div class="font-semibold">{{ t('components.GrDropdown.persistent.visibleStates') }}</div>

          <label v-for="option in options" :key="option.value" class="flex items-center gap-2">
            <input
              :checked="selected.includes(option.value)"
              type="checkbox"
              @change="toggleOption(option.value)"
            >
            <span>{{ option.label }}</span>
          </label>

          <GrButton size="sm" class="justify-self-start" @click="close">
            {{ t('components.GrDropdown.persistent.apply') }}
          </GrButton>
        </div>
      </template>
    </GrDropdown>

    <GrBadge>
      {{ selectedLabels }}
    </GrBadge>
  </div>
</template>`,
    note: 'Это типичный composition-case: dropdown используется не как простое menu, а как контейнер для mini-control surface.',
  },
  {
    id: 'dropdown-hover',
    title: 'Hover trigger and disabled state',
    description: '`trigger="hover"` открывает панель по наведению с задержками `openDelay`/`closeDelay` — курсор успевает дойти до пункта через зазор `offset`. Клик и клавиатура при этом продолжают работать: меню, доступное только мышью, недоступно с клавиатуры вовсе. `disabled` закрывает панель и не даёт открыть её ничем, оставляя триггер фокусируемым.',
    status: 'ready',
    previewKey: 'gr-dropdown-hover',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown, GrSwitch } from '@feugene/granularity'

const disabled = ref(false)
const lastAction = ref('—')

const items = ['Экспорт в CSV', 'Экспорт в XLSX', 'Отправить на почту']
</script>

<template>
  <div class="grid gap-3">
    <GrSwitch v-model="disabled" class="justify-self-start">
      disabled
    </GrSwitch>

    <div class="flex flex-wrap items-center gap-3">
      <!-- Наведение открывает панель, но клик и клавиатура продолжают работать:
           меню, доступное только мышью, недоступно с клавиатуры вовсе. -->
      <GrDropdown trigger="hover" :disabled="disabled" width="14rem">
        <template #trigger="{ triggerProps }">
          <GrButton variant="outline" v-bind="triggerProps">
            Действия (наведение)
          </GrButton>
        </template>

        <template #content>
          <div class="grid gap-1">
            <button
              v-for="item in items"
              :key="item"
              type="button"
              role="menuitem"
              class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]"
              @click="lastAction = item"
            >
              {{ item }}
            </button>
          </div>
        </template>
      </GrDropdown>

      <GrBadge>{{ lastAction }}</GrBadge>
    </div>
  </div>
</template>`,
  },
]
