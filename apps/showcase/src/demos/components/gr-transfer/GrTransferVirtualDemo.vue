<script setup lang="ts">
import { ref } from 'vue'

import { GrTransfer } from '@feugene/granularity'

type Permission = { id: string, label: string }

const catalog: Permission[] = Array.from({ length: 400 }, (_, index) => ({
  id: `perm-${index}`,
  label: `Право ${String(index + 1).padStart(4, '0')}`,
}))

const granted = ref<string[]>(['perm-3', 'perm-17', 'perm-42'])
</script>

<template>
  <div class="grid gap-3">
    <GrTransfer
      v-model="granted"
      :items="catalog"
      item-key="id"
      item-label="label"
      virtual
      :max-height="280"
      source-title="Каталог"
      target-title="Выдано"
      aria-label="Права роли"
    />

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Четыреста строк в каталоге, а в разметке — окно вокруг видимой части.
      Перенос кнопками идёт по модели, поэтому виртуализация ему не мешает.
    </div>
  </div>
</template>
