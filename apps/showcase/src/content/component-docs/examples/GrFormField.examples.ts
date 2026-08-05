import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFieldExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-field-context',
    title: 'Auto id, hint, required and error linking',
    description: 'Поле само генерирует `id` (связка с `label for`) и через provide/inject отдаёт контролу `aria-describedby` (hint + error), `aria-invalid` и `aria-required` — без ручного `forId`. Ошибка анонсируется через `role="alert"`.',
    status: 'ready',
    previewKey: 'gr-form-field-context',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const email = ref('john')
const error = computed(() =>
  email.value && !email.value.includes('@') ? 'Enter a valid email address' : undefined,
)
</script>

<template>
  <!--
    Контрол сам получает id (связка с label \`for\`), aria-describedby (hint + error),
    aria-invalid и aria-required через inject-контекст \`GrFormField\` — без \`forId\` вручную.
  -->
  <div class="grid max-w-sm gap-4">
    <GrFormField
      label="Email"
      required
      hint="We'll never share your email."
      :error="error"
    >
      <GrInput v-model="email" type="email" placeholder="you@example.com" />
    </GrFormField>
  </div>
</template>`,
    note: 'GrInput / GrSelect / GrTextarea внутри `GrFormField` подхватывают контекст автоматически — id/aria прокидывать не нужно.',
  },
  {
    id: 'form-field-basic-label',
    title: 'Basic label and `forId` wiring',
    description: 'Минимальный сценарий показывает, как `GrFormField` связывает label и control, не навязывая конкретный input-тип.',
    status: 'ready',
    previewKey: 'gr-form-field-basic-label',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const name = ref('Operations dashboard')
</script>

<template>
  <GrFormField label="Workspace name" for-id="workspace-name">
    <GrInput id="workspace-name" v-model="name" placeholder="Enter workspace name" />
  </GrFormField>
</template>`,
  },
  {
    id: 'form-field-error-state',
    title: 'Inline validation message',
    description: 'Отдельно документируем ответственность `GrFormField` за error copy, когда сам control лишь сигнализирует invalid-state.',
    status: 'ready',
    previewKey: 'gr-form-field-error-state',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const slug = ref('')

const error = computed(() => {
  if (!slug.value)
    return 'Slug is required for deploy previews.'

  return /^[a-z0-9-]+$/.test(slug.value)
    ? undefined
    : 'Use lowercase latin letters, numbers and dashes only.'
})
</script>

<template>
  <GrFormField label="Preview slug" for-id="preview-slug" :error="error">
    <GrInput id="preview-slug" v-model="slug" :invalid="Boolean(error)" placeholder="team-dashboard" />
  </GrFormField>
</template>`,
  },
  {
    id: 'form-field-custom-label',
    title: 'Section-style labels via `labelClass`',
    description: 'Компонент можно использовать и как мини-секцию формы: label становится heading-строкой, а внутри slot живёт уже более сложная композиция.',
    status: 'ready',
    previewKey: 'gr-form-field-custom-label',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox, GrFormField } from '@feugene/granularity'

const approvals = ref(false)
</script>

<template>
  <GrFormField
    label="Release checklist"
    label-class="font-semibold uppercase tracking-[0.12em] text-xs text-[var(--gr-fg)]"
  >
    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrCheckbox v-model="approvals">
        I verified rollout steps and stakeholder approvals.
      </GrCheckbox>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        This pattern works well when the label behaves like a section heading instead of a per-input caption.
      </div>
    </div>
  </GrFormField>
</template>`,
  },
  {
    id: 'form-field-custom-control',
    title: 'Custom control + custom rule (no GrForm)',
    description: 'Даже без `GrForm` поле связывает свой контрол и ошибку: кастомный контрол (звёздный рейтинг) читает контекст через `useGrFormFieldContext()`, а валидация делается вручную — своя функция-правило вычисляет `:error`, который `GrFormField` показывает через `role="alert"`.',
    status: 'ready',
    previewKey: 'gr-form-field-custom-control',
    code: `<!-- StarRatingInput.vue — кастомный контрол -->
<script setup lang="ts">
import { computed } from 'vue'

import { useGrFormFieldContext } from '@feugene/granularity'

const model = defineModel<number>({ default: 0 })

// Даже без GrForm кастомный контрол читает контекст GrFormField, чтобы получить
// id (label \`for\`), aria-describedby (hint + error) и aria-invalid.
const field = useGrFormFieldContext()
const invalid = computed(() => Boolean(field?.invalid.value))
const stars = [1, 2, 3, 4, 5]
</script>

<template>
  <div
    :id="field?.id.value"
    role="radiogroup"
    :aria-describedby="field?.describedById.value"
    :aria-invalid="invalid || undefined"
    :aria-required="field?.required.value || undefined"
    class="flex gap-1"
  >
    <button
      v-for="star in stars"
      :key="star"
      type="button"
      role="radio"
      :aria-checked="model === star"
      :aria-label="\`\${star} stars\`"
      class="text-2xl leading-none transition-transform hover:scale-110"
      :class="star <= model ? 'text-[var(--gr-warning)]' : 'text-[var(--gr-muted-fg)]'"
      @click="model = star"
    >
      ★
    </button>
  </div>
</template>

<!-- Demo.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrFormField } from '@feugene/granularity'

import StarRatingInput from './StarRatingInput.vue'

const rating = ref(0)
const touched = ref(false)

// Кастомное правило без GrForm: валидируем сами и отдаём текст в \`:error\`.
function validateRating(value: number): string | undefined {
  if (value < 1)
    return 'Please pick a rating.'
  if (value < 3)
    return 'We would love at least 3 stars 🙂'
  return undefined
}

const error = computed(() => (touched.value ? validateRating(rating.value) : undefined))

function submit() {
  touched.value = true
}
</script>

<template>
  <div class="grid max-w-sm gap-4">
    <GrFormField
      label="Satisfaction"
      required
      hint="Custom control + custom rule, without GrForm."
      :error="error"
    >
      <StarRatingInput v-model="rating" />
    </GrFormField>

    <div>
      <GrButton type="button" @click="submit">
        Send feedback
      </GrButton>
    </div>
  </div>
</template>`,
    note: 'Тот же приём (чтение `useGrFormFieldContext()`) делает любой контрол совместимым и с `GrForm` — тогда правило описывается декларативно в `rules`, а не вручную.',
  },
  {
    id: 'form-field-inline-label',
    title: 'Dense form: inline label, several errors, size',
    description: '`labelPosition="start"` с `labelWidth` собирает плотную форму, `error` принимает массив претензий, а `showMessage: false` помечает поле невалидным без текста.',
    status: 'ready',
    previewKey: 'gr-form-field-inline-label',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput, GrSegmented, GrSwitch } from '@feugene/granularity'

const size = ref<'sm' | 'md'>('md')
const compact = ref(true)

const host = ref('')
const port = ref('5432')

// Несколько претензий к одному полю: массив вместо склеенной строки.
const hostErrors = computed<string[]>(() => {
  const issues: string[] = []
  if (!host.value) issues.push('Хост обязателен')
  else if (host.value.includes(' ')) issues.push('Пробелы в хосте недопустимы')
  if (host.value.endsWith('.')) issues.push('Точка в конце — опечатка')
  return issues
})

const portError = computed(() => (Number(port.value) > 0 ? undefined : 'Порт — положительное число'))
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="size"
        size="sm"
        :options="[{ value: 'sm', label: 'size=sm' }, { value: 'md', label: 'size=md' }]"
      />
      <GrSwitch v-model="compact" size="sm">
        Подпись сбоку
      </GrSwitch>
    </div>

    <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrFormField
        label="Хост"
        hint="Домен или IP базы"
        :error="hostErrors"
        :size="size"
        :label-position="compact ? 'start' : 'top'"
        :label-width="140"
        required
      >
        <GrInput v-model="host" :size="size" placeholder="db.internal" />
      </GrFormField>

      <!-- \`showMessage: false\` — поле остаётся невалидным для контрола и AT,
           но текст не занимает места: объяснение живёт в сводке формы. -->
      <GrFormField
        label="Порт"
        :error="portError"
        :show-message="false"
        :size="size"
        :label-position="compact ? 'start' : 'top'"
        :label-width="140"
      >
        <GrInput v-model="port" :size="size" />
      </GrFormField>
    </div>
  </div>
</template>`,
  },
]
