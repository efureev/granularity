<script setup lang="ts">
import { ref } from 'vue'
import { GrSplitter } from '@feugene/granularity'

const treeWidth = ref(25)
const consoleHeight = ref(65)
</script>

<template>
  <div class="h-72 overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]">
    <GrSplitter v-model="treeWidth" :min="15" :max="50" aria-label="Ширина дерева">
      <template #start>
        <div class="h-full bg-[var(--gr-muted)] p-3 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
          Дерево
        </div>
      </template>

      <template #end>
        <!-- Трёхпанельная раскладка — это вложение, а не третья панель у сплиттера. -->
        <GrSplitter v-model="consoleHeight" orientation="vertical" :min="30" aria-label="Высота консоли">
          <template #start>
            <div class="h-full p-4 text-[length:var(--gr-text-sm)] text-[var(--gr-fg)]">
              Редактор
            </div>
          </template>

          <template #end>
            <div class="h-full overflow-auto bg-[var(--gr-muted)] p-3 font-mono text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]" tabindex="0">
              <p>$ yarn build</p>
              <p>✓ built in 692ms</p>
            </div>
          </template>
        </GrSplitter>
      </template>
    </GrSplitter>
  </div>
</template>
