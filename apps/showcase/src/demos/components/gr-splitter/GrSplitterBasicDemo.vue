<script setup lang="ts">
import { ref } from 'vue'
import { GrSplitter } from '@feugene/granularity'

const size = ref(28)

const files = ['src/', '  components/', '  composables/', '  styles/', 'docs/', 'package.json']
</script>

<template>
  <div class="grid gap-3">
    <div class="h-64 overflow-hidden rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]">
      <GrSplitter v-model="size" :min="15" :max="60" aria-label="Ширина дерева файлов">
        <template #start>
          <div class="h-full overflow-auto bg-[var(--gr-muted)] p-3" tabindex="0">
            <p
              v-for="file in files"
              :key="file"
              class="whitespace-pre text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-relaxed)] text-[var(--gr-muted-fg)]"
            >{{ file }}</p>
          </div>
        </template>

        <template #end>
          <div class="h-full overflow-auto p-4">
            <p class="text-[length:var(--gr-text-sm)] text-[var(--gr-fg)]">
              Тяните границу мышью или доведите до неё фокус клавишей Tab: стрелки двигают на процент,
              Shift + стрелка — на десять, Home и End упираются в границы.
            </p>
          </div>
        </template>
      </GrSplitter>
    </div>

    <p class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      Доля первой панели: {{ Math.round(size) }} %
    </p>
  </div>
</template>
