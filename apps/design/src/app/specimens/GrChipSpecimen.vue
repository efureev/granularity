<script setup lang="ts">
import { ref } from 'vue'

import { GR_TONES } from '@feugene/granularity'
import type { GrChipRadius, GrChipSize, GrChipTone, GrTone } from '@feugene/granularity'

import IconCheck from '~icons/lucide/check'
import IconUsers from '~icons/lucide/users'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const RECORD_TAGS: { value: string, label: string, tone: GrChipTone }[] = [
  { value: 'core', label: 'Команда ядра', tone: 'azure' },
  { value: 'accepted', label: 'Принят', tone: 'success' },
  { value: 'beta', label: 'Бета', tone: 'info' },
]
const recordTags = ref([...RECORD_TAGS])

function removeTag(value: string): void {
  recordTags.value = recordTags.value.filter(tag => tag.value !== value)
}

function restoreTags(): void {
  recordTags.value = [...RECORD_TAGS]
}

const onlyMine = ref(true)
const withTeam = ref(false)

const TONE_WORDS: Record<GrTone, string> = {
  primary: 'Главное',
  neutral: 'Черновик',
  success: 'Принят',
  warning: 'На проверке',
  danger: 'Отклонён',
  info: 'Бета',
  slate: 'Архив',
  azure: 'Внешний',
}

const CHIP_SIZES: readonly GrChipSize[] = ['xs', 'sm', 'md', 'lg']

const RADII: { radius: GrChipRadius, label: string }[] = [
  { radius: 'round', label: 'Москва' },
  { radius: 'semi', label: 'ORD-2041' },
  { radius: 'square', label: 'Сверено' },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div v-if="recordTags.length" class="flex flex-wrap items-center gap-2">
      <GrChip
        v-for="tag in recordTags"
        :key="tag.value"
        :label="tag.label"
        :tone="tag.tone"
        :remove-label="`Убрать метку «${tag.label}»`"
        closable
        @remove="removeTag(tag.value)"
      />
    </div>
    <div v-else>
      <GrButton size="sm" variant="ghost" tone="neutral" @click="restoreTags">
        Вернуть метки
      </GrButton>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <GrChip v-model:selected="onlyMine" selectable label="Только мои">
        <template v-if="onlyMine" #icon>
          <IconCheck class="h-full w-full" aria-hidden="true" />
        </template>
      </GrChip>
      <GrChip v-model:selected="withTeam" selectable tone="azure" label="С командой" />
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Снимаемые метки" note="Вне группы крестик — настоящая кнопка со своим именем. Снятие — просьба: состав ведёт экран.">
      <div v-if="recordTags.length" class="flex flex-wrap items-center gap-2">
        <GrChip
          v-for="tag in recordTags"
          :key="tag.value"
          :label="tag.label"
          :tone="tag.tone"
          :remove-label="`Убрать метку «${tag.label}»`"
          closable
          @remove="removeTag(tag.value)"
        />
      </div>
      <p v-else class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
        Меток не осталось.
      </p>
      <div v-if="recordTags.length < RECORD_TAGS.length">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="restoreTags">
          Вернуть метки
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Переключатель" note="selectable — кнопка с aria-pressed. Выбор виден плотной заливкой того же тона и полужирной подписью.">
      <div class="flex flex-wrap items-center gap-2">
        <GrChip v-model:selected="onlyMine" selectable label="Только мои">
          <template v-if="onlyMine" #icon>
            <IconCheck class="h-full w-full" aria-hidden="true" />
          </template>
        </GrChip>
        <GrChip v-model:selected="withTeam" selectable tone="azure" label="С командой">
          <template #icon>
            <IconUsers class="h-full w-full" aria-hidden="true" />
          </template>
        </GrChip>
        <GrChip selectable disabled label="Из архива" />
      </div>
    </Specimen>

    <Specimen title="Тоны" note="Палитра общая с меткой: чип и метка в одном ряду совпадают по цвету. dark — плотный вес для пёстрого фона." wide>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <GrChip v-for="tone in GR_TONES" :key="tone" :tone="tone" :label="TONE_WORDS[tone]" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <GrChip v-for="tone in GR_TONES" :key="tone" :tone="tone" dark :label="TONE_WORDS[tone]" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Кегль — как у соседнего контрола, высота ниже: 24 · 28 · 32 · 36 px. Цель под палец в 44 px — это кнопка, а не чип.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in CHIP_SIZES" :key="size">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
          <div class="flex flex-wrap items-center gap-2">
            <GrChip :size="size" tone="info" label="Бета" />
            <GrChip :size="size" label="Москва">
              <template #icon>
                <IconCheck class="h-full w-full" aria-hidden="true" />
              </template>
            </GrChip>
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Формы" note="round, semi и square — те же три радиуса, что у метки.">
      <div class="flex flex-wrap items-end gap-6">
        <div v-for="item in RADII" :key="item.radius" class="flex flex-col items-start gap-1.5">
          <GrChip tone="slate" :radius="item.radius" :label="item.label" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ item.radius }}</code>
        </div>
      </div>
    </Specimen>
  </div>
</template>
