<script setup lang="ts">
import { reactive, ref, shallowRef, watch } from 'vue'

import { loadBoard, type LoadedBoard } from '../boards'
import type { Board } from '../catalog'
import { boardFit } from '../preferences'
import BoardFrame from './BoardFrame.vue'

const props = defineProps<{
  componentId: string
  versionId: string
  board: Board
}>()

const loaded = shallowRef<LoadedBoard>()
const failed = ref<string>()

const optionValues = reactive<Record<string, string>>(
  Object.fromEntries((props.board.options ?? []).map(option => [option.prop, option.choices[0]!.value])),
)

const fitOptions = [
  { value: 'fit', label: 'По ширине' },
  { value: 'actual', label: '100 %' },
]

watch(
  () => [props.componentId, props.versionId, props.board.file] as const,
  async ([componentId, versionId, file]) => {
    loaded.value = undefined
    failed.value = undefined
    try {
      loaded.value = await loadBoard(componentId, versionId, file)
    }
    catch (error) {
      failed.value = error instanceof Error ? error.message : String(error)
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="flex flex-col gap-3" :aria-label="`Макет: ${board.title}`">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h2 class="text-[length:var(--gr-text-base)] font-600 leading-[var(--gr-leading-base)]">
          {{ board.title }}
        </h2>
        <GrBadge v-if="board.interactive" tone="info" size="sm">
          интерактивный
        </GrBadge>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <GrSegmented
          v-for="option in board.options"
          :key="option.prop"
          v-model="optionValues[option.prop]"
          size="sm"
          :aria-label="option.label"
          :options="option.choices"
        />
        <GrSegmented
          size="sm"
          aria-label="Масштаб макета"
          :model-value="boardFit ? 'fit' : 'actual'"
          :options="fitOptions"
          @update:model-value="boardFit = $event === 'fit'"
        />
      </div>
    </div>

    <GrAlert v-if="failed" tone="danger" title="Макет не загрузился">
      {{ failed }}
    </GrAlert>
    <GrSkeleton v-else-if="!loaded" class="h-[480px] w-full rounded-[var(--gr-radius-lg)]" />
    <BoardFrame v-else :css="loaded.css" :width="board.width" :fit="boardFit">
      <component :is="loaded.component" v-bind="optionValues" />
    </BoardFrame>
  </section>
</template>
