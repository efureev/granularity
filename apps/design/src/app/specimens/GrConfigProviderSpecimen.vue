<script setup lang="ts">
import type { GrComponentDefaults, GrComponentSize } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { builtThemes } from '../themes'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const route = useRoute()

const modeIslands = [
  { mode: 'light', title: 'Светлый остров' },
  { mode: 'dark', title: 'Тёмный остров' },
]
const notify = ref(true)
const email = ref('anna@studio.ru')

const themes = builtThemes(themeManifest)
const themeOptions = themes.map(theme => ({ value: theme.entry.id, label: theme.entry.title }))
// Остров интересен темой, отличной от темы адреса: иначе он выглядел бы как страница вокруг.
const islandTheme = ref(themes.find(theme => theme.entry.id !== String(route.params.theme))?.entry.id ?? themes[0]?.entry.id ?? '')
const islandModes = computed(() => themes.find(theme => theme.entry.id === islandTheme.value)?.modes ?? [])
const modeOptions = computed(() => islandModes.value.map(mode => ({ value: mode.name, label: mode.title ?? mode.name })))
const islandMode = ref(islandModes.value[0]?.name ?? 'light')
watch(islandModes, (modes) => {
  if (!modes.some(mode => mode.name === islandMode.value))
    islandMode.value = modes[0]?.name ?? islandMode.value
})
const islandPair = computed(() => islandModes.value.find(mode => mode.name === islandMode.value)?.value ?? '')

const sizeOptions = ['xs', 'sm', 'md', 'lg'].map(step => ({ value: step, label: step }))
const subtreeSize = ref<string>('sm')
const subtreeStep = computed(() => subtreeSize.value as GrComponentSize)
const search = ref('Смета')

const outerDefaults: GrComponentDefaults = {
  GrButton: { variant: 'outline' },
  GrInput: { clearable: true },
  GrAvatar: { autoColor: true },
}
const innerDefaults: GrComponentDefaults = {
  GrButton: { tone: 'danger' },
}
const project = ref('Запуск весной')
const team = ['Анна Соколова', 'Иван Петров', 'Мария Ким']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="grid grid-cols-2 gap-3">
      <GrConfigProvider v-for="island in modeIslands" :key="island.mode" :mode="island.mode">
        <div class="flex flex-col gap-2 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3 text-[var(--gr-fg)]">
          <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ island.title }}
          </span>
          <GrButton size="sm">
            Оплатить
          </GrButton>
        </div>
      </GrConfigProvider>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Остров режима" note="поддерево в своём режиме без глобального переключения — и тёмное в светлом, и светлое в тёмном" wide>
      <div class="grid gap-4 md:grid-cols-2">
        <GrConfigProvider v-for="island in modeIslands" :key="island.mode" :mode="island.mode">
          <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-5 text-[var(--gr-fg)]">
            <div class="flex items-center justify-between gap-3">
              <span class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">{{ island.title }}</span>
              <GrBadge tone="success" size="sm">
                Активен
              </GrBadge>
            </div>
            <GrFormField label="Почта для счетов">
              <GrInput v-model="email" type="email" />
            </GrFormField>
            <GrSwitch v-model="notify">
              Присылать итоги месяца
            </GrSwitch>
            <div class="flex gap-2">
              <GrButton>
                Сохранить
              </GrButton>
              <GrButton variant="ghost" tone="neutral">
                Отмена
              </GrButton>
            </div>
          </div>
        </GrConfigProvider>
      </div>
    </Specimen>

    <Specimen title="Остров другой темы" note="тема сборки на поддереве: значения, токены компонентов и пропсы по умолчанию — её">
      <div class="flex flex-wrap gap-2">
        <GrSegmented v-model="islandTheme" :options="themeOptions" size="sm" aria-label="Тема острова" />
        <GrSegmented v-if="modeOptions.length > 1" v-model="islandMode" :options="modeOptions" size="sm" aria-label="Режим острова" />
      </div>
      <GrConfigProvider :theme="islandTheme" :mode="islandMode">
        <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-5 text-[var(--gr-fg)]">
          <code class="self-start font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">
            data-theme="{{ islandPair }}"
          </code>
          <GrFormField label="Почта для счетов">
            <GrInput v-model="email" type="email" />
          </GrFormField>
          <div class="flex flex-wrap items-center gap-2">
            <GrButton>
              Сохранить
            </GrButton>
            <GrButton variant="secondary" tone="neutral">
              Отмена
            </GrButton>
            <GrBadge tone="primary" size="sm">
              Новое
            </GrBadge>
          </div>
        </div>
      </GrConfigProvider>
    </Specimen>

    <Specimen title="Размер поддерева" note="одна ступень на все контролы внутри — вместо пропа на каждом поле">
      <GrSegmented v-model="subtreeSize" :options="sizeOptions" size="sm" aria-label="Ступень поддерева" class="self-start" />
      <GrConfigProvider :size="subtreeStep">
        <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-4">
          <GrInput v-model="search" type="search" aria-label="Поиск по документам" />
          <div class="flex flex-wrap items-center gap-2">
            <GrButton>
              Найти
            </GrButton>
            <GrButton variant="ghost" tone="neutral">
              Сбросить
            </GrButton>
            <GrKbd keys="mod+K" platform="apple" />
          </div>
        </div>
      </GrConfigProvider>
    </Specimen>

    <Specimen title="Пропсы по умолчанию и вложение" note="вложенный провайдер мержится поверх родителя по пропу; проп на месте сильнее обоих" wide>
      <GrConfigProvider :component-defaults="outerDefaults">
        <div class="grid gap-6 rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-5 md:grid-cols-3">
          <div class="flex flex-col gap-3">
            <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              Провайдер: обводка, очистка поля, цвет аватаров
            </span>
            <GrInput v-model="project" aria-label="Название проекта" />
            <div class="flex flex-wrap items-center gap-2">
              <GrButton>
                Сохранить
              </GrButton>
              <GrAvatarGroup size="sm" aria-label="Участники проекта">
                <GrAvatar v-for="name in team" :key="name" :name="name" />
              </GrAvatarGroup>
            </div>
          </div>
          <GrConfigProvider :component-defaults="innerDefaults">
            <div class="flex flex-col gap-3">
              <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                Вложенный: тон опасный, обводка осталась
              </span>
              <div class="flex flex-wrap gap-2">
                <GrButton>
                  Удалить проект
                </GrButton>
              </div>
            </div>
          </GrConfigProvider>
          <div class="flex flex-col gap-3">
            <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
              Проп на месте сильнее провайдера
            </span>
            <div class="flex flex-wrap gap-2">
              <GrButton variant="primary">
                Опубликовать
              </GrButton>
            </div>
          </div>
        </div>
      </GrConfigProvider>
    </Specimen>
  </div>
</template>
