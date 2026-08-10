<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrCollapse, GrCollapseItem, GrSwitch } from '@feugene/granularity'

const sections = [
  { name: 'billing', title: 'Billing', body: 'Invoices, payment method and tax details.' },
  { name: 'members', title: 'Members', body: 'Roles, invitations and seat limits.' },
]

const opened = ref<string[]>(['billing'])
const showSections = ref(true)

// Пустоту считает сам аккордеон: фильтр, не нашедший ничего, отдаёт пустой
// `v-for` — заглушка появляется без единой строчки на стороне экрана.
const visible = computed(() => (showSections.value ? sections : []))
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="showSections">
      Show sections
    </GrSwitch>

    <GrCollapse v-model="opened">
      <GrCollapseItem
        v-for="section in visible"
        :key="section.name"
        :name="section.name"
        :title="section.title"
      >
        {{ section.body }}
      </GrCollapseItem>
    </GrCollapse>

    <GrCollapse borderless>
      <template #empty>
        <span class="text-[var(--gr-muted-fg)]">Own markup instead of the default text — the `empty` slot.</span>
      </template>
    </GrCollapse>
  </div>
</template>
