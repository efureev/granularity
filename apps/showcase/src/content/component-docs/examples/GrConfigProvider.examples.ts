import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfigProviderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'config-provider-size',
    title: 'Default size for nested controls',
    description: '`GrConfigProvider` задаёт дефолтный `size` для всех вложенных контролов, которые его поддерживают (сейчас — `GrButton` и `GrInput`). У самих контролов проп `size` не указан — он приходит из провайдера. Локальный `size` на компоненте всегда побеждает.',
    status: 'ready',
    previewKey: 'gr-config-provider-size',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider, GrInput, type GrComponentSize } from '@feugene/granularity'

const size = ref<GrComponentSize>('md')
const value = ref('Config-driven size')

const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']
</script>

<template>
  <div class="grid gap-4">
    <!-- Переключатель размера — сами кнопки вне провайдера (фиксированный sm). -->
    <div class="flex gap-2">
      <GrButton
        v-for="s in sizes"
        :key="s"
        size="sm"
        :variant="size === s ? 'primary' : 'outline'"
        @click="size = s"
      >
        {{ s }}
      </GrButton>
    </div>

    <!-- Ни у одного контрола ниже нет пропа \`size\` — он приходит из провайдера. -->
    <GrConfigProvider :size="size">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="value" class="max-w-[16rem]" aria-label="Config-driven input" />
        <GrButton>Save</GrButton>
        <GrButton variant="outline">Cancel</GrButton>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Активный размер: <code>{{ size }}</code>. Проп <code>size</code> на контролах не задан.
    </p>
  </div>
</template>`,
    note: 'Провайдер рендерится прозрачно (`display: contents`) и не влияет на layout. Поддержку конфига компонент включает через `useGrComponentSize()` / `useGrConfig()`.',
  },
  {
    id: 'config-provider-nested',
    title: 'Nested providers merge',
    description: 'Провайдеры можно вкладывать: дочерний мержится поверх родительского. Здесь внешний задаёт `size="lg"`, а внутренний переопределяет его на `sm` только для своего поддерева — остальные значения (`componentDefaults`, i18n) наследуются.',
    status: 'ready',
    previewKey: 'gr-config-provider-nested',
    code: `<script setup lang="ts">
import { GrButton, GrConfigProvider, GrInput } from '@feugene/granularity'
</script>

<template>
  <!-- Внешний провайдер: size = lg. -->
  <GrConfigProvider size="lg">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Outer provider — <code>size="lg"</code>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Large" class="max-w-[14rem]" aria-label="Large input" />
        <GrButton>Large</GrButton>
      </div>

      <!-- Вложенный провайдер переопределяет только size; остальное наследуется. -->
      <GrConfigProvider size="sm">
        <div class="grid gap-3 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3">
          <div class="text-sm font-semibold text-[var(--gr-fg)]">
            Inner provider — <code>size="sm"</code>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <GrInput model-value="Small" class="max-w-[14rem]" aria-label="Small input" />
            <GrButton>Small</GrButton>
          </div>
        </div>
      </GrConfigProvider>
    </div>
  </GrConfigProvider>
</template>`,
  },
  {
    id: 'config-provider-defaults',
    title: 'Default props per component',
    description: '`componentDefaults` задаёт дефолтные пропсы по имени компонента: оформление всего поддерева описывается одним объектом, а у самих компонентов пропы не указаны. Локальный проп всегда побеждает конфиг. Набор настраиваемых пропов закрытый (`GrButton` — `variant`/`tone`/`size`/`square`, `GrInput` — `size`/`clearable`, `GrBadge` — `tone`/`size`/`radius`): через конфиг настраивается оформление, но не `modelValue` и не обработчики.',
    status: 'ready',
    previewKey: 'gr-config-provider-defaults',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrConfigProvider,
  GrInput,
  type GrComponentDefaults,
} from '@feugene/granularity'

const value = ref('Igor Petrov')

// Оформление всего поддерева задаётся одним объектом: у самих компонентов
// ни \`variant\`, ни \`tone\`, ни \`clearable\` не указаны.
const brandDefaults: GrComponentDefaults = {
  GrButton: { variant: 'outline', tone: 'azure' },
  GrInput: { clearable: true },
  GrBadge: { tone: 'azure', radius: 'semi' },
}

const enabled = ref(true)
</script>

<template>
  <div class="grid gap-4">
    <GrButton size="sm" variant="ghost" @click="enabled = !enabled">
      {{ enabled ? 'Turn defaults off' : 'Turn defaults on' }}
    </GrButton>

    <GrConfigProvider :component-defaults="enabled ? brandDefaults : undefined">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="value" class="max-w-[16rem]" aria-label="Full name" />
        <GrButton>Invite</GrButton>
        <GrButton>Copy link</GrButton>
        <GrBadge>Pro</GrBadge>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Локальный проп всегда сильнее конфига — у кнопки-переключателя выше явно задан
      <code>variant="ghost"</code>, и она не меняется.
    </p>
  </div>
</template>`,
    note: 'Чтобы компонент умел читать конфиг, его настраиваемый проп обязан иметь дефолт `undefined`, а «настоящий» дефолт — жить в резолвере `useGrComponentProp`. Иначе Vue подставит дефолт раньше, чем компонент заглянет в конфиг, и отличить «пользователь передал значение» от «сработал дефолт» будет невозможно.',
  },
  {
    id: 'config-provider-dialog',
    title: 'Imperative dialogs inherit the config',
    description: '`useDialogService` монтирует хост в `body`, вне дерева компонентов, — обычный `inject` туда не дотягивается. Пакет закрывает это сам: сервис захватывает конфиг в момент вызова `useDialogService()`, и диалог получает те же дефолты, что и контролы вокруг. От приложения ничего не требуется.',
    status: 'ready',
    previewKey: 'gr-config-provider-dialog',
    code: `<!-- DialogCaller.vue -->
<script setup lang="ts">
import { GrButton, useDialogService } from '@feugene/granularity'

/**
 * Отдельный компонент здесь по существу, а не для красоты: \`useDialogService()\`
 * захватывает конфиг в \`setup\`, поэтому вызывать его нужно там, где компонент
 * уже находится внутри \`GrConfigProvider\`.
 */
const emit = defineEmits<{ (e: 'answer', value: string): void }>()

const dialogs = useDialogService()

async function ask(): Promise<void> {
  const confirmed = await dialogs.confirm('Удалить черновик? Действие необратимо.')
  emit('answer', confirmed ? 'подтвердил' : 'отменил')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
    <GrButton @click="ask">
      Открыть диалог
    </GrButton>
    <span class="text-sm text-[var(--gr-muted-fg)]">
      кнопка снаружи — для сравнения размеров
    </span>
  </div>
</template>

<!-- Demo.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider } from '@feugene/granularity'

import DialogCaller from './DialogCaller.vue'

const size = ref<'sm' | 'lg'>('sm')
const lastAnswer = ref<string | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium">Размер в провайдере:</span>
      <GrButton
        v-for="s in (['sm', 'lg'] as const)"
        :key="s"
        size="sm"
        :variant="size === s ? 'primary' : 'outline'"
        @click="size = s"
      >
        {{ s }}
      </GrButton>
    </div>

    <!-- Вызывающий компонент внутри провайдера — значит и диалог унаследует конфиг. -->
    <GrConfigProvider :size="size">
      <DialogCaller @answer="lastAnswer = $event" />
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Диалог монтируется в <code>body</code>, вне дерева провайдера, но кнопки в нём
      приходят того же размера, что и контролы вокруг. Последний ответ:
      <code>{{ lastAnswer ?? '—' }}</code>
    </p>
  </div>
</template>`,
    note: 'Захват происходит в `useDialogService()`, а не при вызове `confirm()`. Поэтому сервис нужно получать в `setup` компонента, находящегося внутри провайдера: сервис-синглтон из модуля или стора дерева не видит и откатится на дефолты компонентов. Приоритет внутри диалога: опции вызова → `useDialogService(defaults)` → провайдер → дефолты компонентов.',
  },
  {
    id: 'config-provider-read',
    title: 'Read the config in your own component',
    description: 'Любой компонент читает конфиг ближайшего провайдера через `useGrConfig()` — так подключаются собственные контролы. Провайдер отдаёт `size` и `componentDefaults` (per-component дефолтные пропсы); вне провайдера всё разрешается в fallback-значения.',
    status: 'ready',
    previewKey: 'gr-config-provider-read',
    code: `<!-- ConfigReader.vue -->
<script setup lang="ts">
import { GrBadge, useGrConfig } from '@feugene/granularity'

// Любой компонент может прочитать конфиг ближайшего GrConfigProvider.
const config = useGrConfig()
</script>

<template>
  <div class="grid gap-2 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3 text-sm">
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">size</span>
      <GrBadge tone="info">{{ config.size.value ?? '—' }}</GrBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">GrButton default variant</span>
      <GrBadge tone="success">{{ config.componentDefaults.value.GrButton?.variant ?? '—' }}</GrBadge>
    </div>
  </div>
</template>

<!-- Demo.vue -->
<script setup lang="ts">
import { GrConfigProvider } from '@feugene/granularity'

import ConfigReader from './ConfigReader.vue'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Inside a provider
      </div>
      <GrConfigProvider
        size="lg"
        :component-defaults="{ GrButton: { variant: 'secondary' } }"
      >
        <ConfigReader />
      </GrConfigProvider>
    </div>

    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        No provider (fallbacks)
      </div>
      <ConfigReader />
    </div>
  </div>
</template>`,
    note: 'Провайдер также принимает проп `i18n` — адаптер переводов прокидывается вложенным компонентам через общий inject-ключ (иначе приложение инжектит его вручную).',
  },
  {
    id: 'config-provider-theme-island',
    title: 'Theme island (including teleported panels)',
    description: 'Проп `theme` кладёт `data-theme` на обёртку провайдера — тёмный остров внутри светлой страницы работает без дополнительных стилей, потому что темы объявлены атрибутным селектором. Панели селекта и дропдауна телепортируются в `body`, вне обёртки, и всё равно остаются тёмными: в дереве компонентов они внутри, поэтому тему берут из контекста и ставят себе сами.',
    status: 'ready',
    previewKey: 'gr-config-provider-theme-island',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider, GrDropdown, GrInput, GrSelect } from '@feugene/granularity'

const value = ref('a')
const options = [
  { value: 'a', label: 'Первый' },
  { value: 'b', label: 'Второй' },
]
</script>

<template>
  <!-- Тема поддерева: \`data-theme\` на обёртке провайдера. Тема документа
       остаётся за \`useTheme\` — это именно остров. -->
  <GrConfigProvider theme="dark" size="sm">
    <div class="grid gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-[var(--gr-card-fg)]">
      <div class="text-sm font-semibold">
        Тёмный остров внутри страницы
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <GrInput model-value="Поле" class="max-w-[12rem]" aria-label="Поле острова" />

        <!-- Панели телепортируются в body, вне обёртки провайдера, и всё равно
             остаются тёмными: тему они ставят себе сами из контекста. -->
        <GrSelect v-model="value" :options="options" class="max-w-[12rem]" aria-label="Выбор" />

        <GrDropdown width="12rem">
          <template #trigger="{ triggerProps }">
            <GrButton variant="outline" v-bind="triggerProps">
              Меню
            </GrButton>
          </template>

          <template #content>
            <div class="grid gap-1">
              <button
                v-for="item in ['Открыть', 'Дублировать', 'Удалить']"
                :key="item"
                type="button"
                role="menuitem"
                class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]"
              >
                {{ item }}
              </button>
            </div>
          </template>
        </GrDropdown>
      </div>
    </div>
  </GrConfigProvider>
</template>`,
  },
]
