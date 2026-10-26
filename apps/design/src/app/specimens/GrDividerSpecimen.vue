<script setup lang="ts">
import type { GrDividerSpacing, GrDividerVariant } from '@feugene/granularity/components/GrDivider'
import IconCalendar from '~icons/lucide/calendar'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const strokes: readonly { variant: GrDividerVariant, label: string }[] = [
  { variant: 'solid', label: 'solid' },
  { variant: 'dashed', label: 'dashed' },
  { variant: 'dotted', label: 'dotted' },
]

const spacings: readonly GrDividerSpacing[] = ['xs', 'md', 'lg']

const textClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrDivider />
    <GrDivider label="или" />
    <div class="flex h-5 items-center gap-3" :class="textClass">
      <span>Изменить</span>
      <GrDivider orientation="vertical" />
      <span>Удалить</span>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Линия и подпись" note="Без подписи — нативный hr; подпись становится именем разделителя для диктора.">
      <div class="flex flex-col gap-5">
        <GrDivider />
        <GrDivider label="или" />
        <GrDivider label="Архив" align="start" />
        <GrDivider label="Сегодня" align="end" />
      </div>
    </Specimen>

    <Specimen title="Начертание" note="Линия рисуется бордюром, поэтому у пунктира и точек та же толщина и цвет, что у сплошной.">
      <div class="flex flex-col gap-5">
        <GrDivider v-for="stroke in strokes" :key="stroke.variant" :variant="stroke.variant" :label="stroke.label" align="start" />
      </div>
    </Specimen>

    <Specimen title="Вертикальный" note="Тянется по высоте flex-родителя; вне flex длину задают явно.">
      <div class="flex flex-col gap-5">
        <div class="flex h-6 items-center gap-3" :class="textClass">
          <span>Изменить</span>
          <GrDivider orientation="vertical" />
          <span>Скопировать</span>
          <GrDivider orientation="vertical" />
          <span>Удалить</span>
        </div>
        <div :class="textClass">
          Черновик
          <GrDivider orientation="vertical" :length="16" spacing="sm" class="align-middle" />
          изменён 2 часа назад
        </div>
      </div>
    </Specimen>

    <Specimen title="Отступы и толщина" note="spacing — вертикальный зазор по шкале пакета, thickness — пиксели линии.">
      <div class="flex flex-col">
        <template v-for="spacing in spacings" :key="spacing">
          <p :class="mutedClass">
            spacing="{{ spacing }}"
          </p>
          <GrDivider :spacing="spacing" />
        </template>
        <p :class="mutedClass">
          thickness="3"
        </p>
        <GrDivider spacing="md" :thickness="3" />
      </div>
    </Specimen>

    <Specimen title="Подпись разметкой" note="Слот строкой не выразить, поэтому имя для диктора задаёт aria-label." wide>
      <GrDivider aria-label="Вчера, 24 октября">
        <span class="inline-flex items-center gap-1.5">
          <GrIcon size="sm">
            <IconCalendar />
          </GrIcon>
          Вчера, 24 октября
        </span>
      </GrDivider>
    </Specimen>
  </div>
</template>
