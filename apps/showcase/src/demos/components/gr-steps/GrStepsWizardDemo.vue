<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import { GrButton, GrCard, GrForm, GrFormField, GrInput, GrSteps } from '@feugene/granularity'
import type { GrStep } from '@feugene/granularity'

// Мастер оформления: шаг не отпускает, пока его поля не сойдутся.
const steps = ref<GrStep[]>([
  { value: 'contacts', label: 'Контакты', description: 'Куда писать' },
  { value: 'delivery', label: 'Доставка', description: 'Адрес и срок' },
  { value: 'done', label: 'Готово' },
])

const step = ref('contacts')
const model = ref({ email: '', address: '' })

const rules = {
  email: [{ required: true, message: 'Укажите почту' }, { type: 'email' as const, message: 'Похоже на опечатку' }],
  address: [{ required: true, message: 'Укажите адрес' }],
}

const formRef = useTemplateRef('formRef')
const stepsRef = useTemplateRef('stepsRef')

const fieldsByStep: Record<string, string[]> = {
  contacts: ['email'],
  delivery: ['address'],
  done: [],
}

const isLast = computed(() => step.value === 'done')

/**
 * Гейт перехода. `GrSteps` про форму ничего не знает — проверку ставит
 * приложение, а назад пускает всегда: правка заполненного не должна упираться
 * в валидацию.
 */
async function beforeLeave(from: string, to: string): Promise<boolean> {
  const order = steps.value.map(item => item.value)
  if (order.indexOf(to) < order.indexOf(from)) return true

  const names = fieldsByStep[from] ?? []
  const results = await Promise.all(names.map(name => formRef.value!.validateField(name)))
  const passed = results.every(Boolean)

  // Шаг с ошибкой помечается явно: вывести это из позиции неоткуда.
  steps.value = steps.value.map(item => (item.value === from
    ? { ...item, status: passed ? ('complete' as const) : ('error' as const) }
    : item))

  return passed
}
</script>

<template>
  <GrCard class="grid gap-5 p-5">
    <GrSteps ref="stepsRef" v-model="step" :steps="steps" :before-leave="beforeLeave" />

    <GrForm ref="formRef" :model="model" :rules="rules">
      <GrFormField v-if="step === 'contacts'" name="email" label="Почта">
        <GrInput v-model="model.email" name="email" type="email" placeholder="you@example.com" />
      </GrFormField>

      <GrFormField v-else-if="step === 'delivery'" name="address" label="Адрес">
        <GrInput v-model="model.address" name="address" placeholder="Город, улица, дом" />
      </GrFormField>

      <p v-else class="text-sm text-[var(--gr-muted-fg)]">
        Заказ готов к отправке: {{ model.email }}, {{ model.address }}.
      </p>
    </GrForm>

    <div class="flex justify-end gap-2">
      <GrButton variant="outline" @click="stepsRef?.back()">
        Назад
      </GrButton>
      <GrButton :disabled="isLast" @click="stepsRef?.next()">
        Далее
      </GrButton>
    </div>
  </GrCard>
</template>
