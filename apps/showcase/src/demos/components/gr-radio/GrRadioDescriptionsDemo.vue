<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrRadio, GrRadioGroup } from '@feugene/granularity'

// Значения числовые: перечисления в реальных формах — это обычно id, а не строка.
const planId = ref(2)

const plans = [
  { id: 1, label: 'Команда', description: 'До 10 участников, общий проект' },
  { id: 2, label: 'Бизнес', description: 'Роли, аудит-лог, приоритетная поддержка' },
  { id: 3, label: 'Enterprise', description: 'Только по договору', disabled: true },
]

const confirmed = ref(false)
const error = computed(() => (confirmed.value && planId.value === 1 ? 'Для аудит-лога нужен тариф выше' : ''))
</script>

<template>
  <div class="grid gap-4">
    <GrFormField label="Тариф" :error="error">
      <GrRadioGroup v-model="planId" name="plan" :invalid="Boolean(error)">
        <GrRadio
          v-for="plan in plans"
          :key="plan.id"
          :value="plan.id"
          :disabled="plan.disabled"
        >
          {{ plan.label }}
          <template #description>
            {{ plan.description }}
          </template>
        </GrRadio>
      </GrRadioGroup>
    </GrFormField>

    <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
      <input v-model="confirmed" type="checkbox">
      Проверять требование аудит-лога
    </label>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Выбран тариф <span class="font-semibold text-[var(--gr-fg)]">#{{ planId }}</span>.
      Группа — одна остановка `Tab`: внутри работают стрелки, `Home` и `End`, отключённый вариант пропускается.
    </div>
  </div>
</template>
