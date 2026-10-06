<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, GrSelect } from '@feugene/granularity'

// Подпись сбоку стоит на линии своего поля, есть у строки подсказка или ошибка.
const terms = ref('net-30')
const prefix = ref('INV-')
const email = ref('billing@')

// `reserveMessage`: строка ошибки держит место, и форма не прыгает по submit.
const model = ref({ name: '', iban: '' })
const rules = {
  name: [{ required: true, message: 'Укажите получателя' }],
  iban: [{ required: true, message: 'Укажите IBAN' }],
}
</script>

<template>
  <div class="grid gap-6">
    <div data-demo="start-rows" class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrFormField label="Payment terms" label-position="start" label-width="9rem">
        <GrSelect
          v-model="terms"
          :options="[{ value: 'net-30', label: 'Net 30' }, { value: 'net-60', label: 'Net 60' }]"
        />
      </GrFormField>
      <GrFormField label="Number prefix" hint="Next invoice: INV-0419" label-position="start" label-width="9rem">
        <GrInput v-model="prefix" />
      </GrFormField>
      <GrFormField label="Billing email" error="Адрес без домена" label-position="start" label-width="9rem">
        <GrInput v-model="email" />
      </GrFormField>
    </div>

    <GrForm
      data-demo="reserved"
      :model="model"
      :rules="rules"
      reserve-message
      class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4"
    >
      <GrFormField label="Получатель" name="name">
        <GrInput v-model="model.name" />
      </GrFormField>
      <GrFormField label="IBAN" name="iban">
        <GrInput v-model="model.iban" />
      </GrFormField>
      <div>
        <GrButton type="submit" size="sm">
          Проверить
        </GrButton>
      </div>
    </GrForm>
  </div>
</template>
