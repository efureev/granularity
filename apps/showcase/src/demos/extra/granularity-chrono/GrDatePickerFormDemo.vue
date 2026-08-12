<script setup lang="ts">
import { computed, ref } from 'vue'

// `GrDatePicker`, `GrFormField` и `GrButton` подставляются авто-импортом.
// Модель — строка `2026-08-20`: её задаёт адаптер, а не проп формата.
const departure = ref<string | null>(null)
const attempted = ref(false)
const submitted = ref('')

const today = new Date(2026, 7, 12)

const error = computed(() => (attempted.value && !departure.value ? 'Choose a departure date' : ''))

function submit(event: Event): void {
  attempted.value = true

  // Форме уходит `2026-08-20`, а не «Aug 20, 2026»: показ локале-зависим и на
  // сервере не разбирается.
  const data = new FormData(event.target as HTMLFormElement)
  submitted.value = String(data.get('departure') ?? '')
}
</script>

<template>
  <form class="grid max-w-[320px] gap-4" @submit.prevent="submit">
    <!-- Поле пикера — обычный форм-контрол: подпись через `<label for>`,
         ошибка через `aria-describedby`, значение уходит по `name`. -->
    <GrFormField label="Departure" :error="error" required>
      <GrDatePicker
        v-model="departure"
        name="departure"
        value-adapter="isoDate"
        :min="today"
        clearable
        placeholder="Pick a date"
      />
    </GrFormField>

    <GrButton type="submit" size="sm">
      Submit
    </GrButton>

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">form data=</span><code>{{ submitted || '—' }}</code>
    </p>
  </form>
</template>
