<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrDrawer, GrInput } from '@feugene/granularity'

const open = ref(false)
const query = ref('')

const members = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra']
const found = computed(() =>
  members.filter(name => name.toLowerCase().includes(query.value.trim().toLowerCase())),
)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open member picker
    </GrButton>

    <GrDrawer v-model="open" title="Team members" size="sm">
      <!-- Своя шапка заменяет и заголовок, и крестик. Имя слоя при этом
           остаётся: заголовок уходит в скрытый элемент. -->
      <template #header="{ title, close }">
        <div class="flex items-center gap-2">
          <GrInput v-model="query" :placeholder="title" class="flex-1" />
          <GrButton variant="ghost" size="sm" @click="close">
            Done
          </GrButton>
        </div>
      </template>

      <ul class="grid gap-1 text-sm">
        <li v-for="name in found" :key="name" class="rounded-md px-2 py-1.5 hover:bg-[var(--gr-muted)]">
          {{ name }}
        </li>
        <li v-if="found.length === 0" class="px-2 py-1.5 text-[var(--gr-muted-fg)]">
          Nobody matches “{{ query }}”
        </li>
      </ul>
    </GrDrawer>
  </div>
</template>
