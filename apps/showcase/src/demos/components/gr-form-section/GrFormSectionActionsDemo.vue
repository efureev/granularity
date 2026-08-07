<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrCard, GrFormField, GrFormSection, GrInput } from '@feugene/granularity'

const members = ref([
  { id: 1, email: 'ada@example.com' },
  { id: 2, email: 'grace@example.com' },
])

function addMember(): void {
  members.value = [...members.value, { id: Date.now(), email: '' }]
}
</script>

<template>
  <GrCard class="p-4">
    <!-- Заголовок секции — настоящий `h4`, поэтому форма обходится по заголовкам. -->
    <GrFormSection
      title="Участники проекта"
      description="Приглашения уходят на почту сразу после сохранения."
      :heading-level="4"
    >
      <template #title>
        Участники проекта
        <GrBadge tone="neutral">
          {{ members.length }}
        </GrBadge>
      </template>

      <template #actions>
        <GrButton variant="outline" size="sm" @click="addMember">
          Добавить
        </GrButton>
      </template>

      <div class="grid gap-3">
        <GrFormField v-for="(member, index) in members" :key="member.id" :label="`Участник ${index + 1}`">
          <GrInput v-model="member.email" type="email" placeholder="name@example.com" />
        </GrFormField>
      </div>
    </GrFormSection>
  </GrCard>
</template>
