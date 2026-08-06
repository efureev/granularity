import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-validation',
    title: 'Declarative validation & submit',
    description: 'Модель формы (`:model`) + декларативные `rules` по имени поля. `GrFormField` с `name` сам подтягивает ошибку и маркер обязательности из формы, а `submit` эмитится только если форма валидна. Контролы (`GrInput`) не меняются — они уже читают `invalid`/`id`/`aria-describedby` из контекста поля.',
    status: 'ready',
    previewKey: 'gr-form-validation',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, type GrFormRules } from '@feugene/granularity'

const model = reactive({ name: '', email: '', password: '' })

const rules: GrFormRules = {
  name: [{ required: true }],
  email: [{ required: true, type: 'email' }],
  password: [{ required: true, min: 8 }],
}

const formRef = ref<InstanceType<typeof GrForm>>()
const submitted = ref(false)

function onSubmit() {
  submitted.value = true
}

function reset() {
  formRef.value?.resetFields()
  submitted.value = false
}
</script>

<template>
  <GrForm
    ref="formRef"
    :model="model"
    :rules="rules"
    class="grid max-w-sm gap-4"
    @submit="onSubmit"
  >
    <GrFormField name="name" label="Name">
      <GrInput v-model="model.name" placeholder="Ada Lovelace" />
    </GrFormField>

    <GrFormField name="email" label="Email">
      <GrInput v-model="model.email" type="email" placeholder="ada@example.com" />
    </GrFormField>

    <GrFormField name="password" label="Password" hint="At least 8 characters">
      <GrInput v-model="model.password" type="password" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">
        Sign up
      </GrButton>
      <GrButton variant="secondary" type="button" @click="reset">
        Reset
      </GrButton>
    </div>

    <p v-if="submitted" class="text-sm text-[var(--gr-success)]">
      Submitted — form is valid.
    </p>
  </GrForm>
</template>`,
    note: 'Ошибка снимается по мере исправления поля; `resetFields()` возвращает начальные значения. Императивный API — через template ref: `validate()` / `validateField()` / `clearValidate()` / `scrollToField()`.',
  },
  {
    id: 'form-mixed-controls',
    title: 'Any control + custom / async rules',
    description: 'Ключевой архитектурный смысл: `GrSelect`, `GrAutocomplete`, `GrInput` валидируются одинаково — через `GrFormField name`, без правок самих контролов. Кастомный (в т.ч. async) `validator` получает значение и весь `model` (проверка совпадения паролей). `validate()` скроллит к первому невалидному полю.',
    status: 'ready',
    previewKey: 'gr-form-mixed-controls',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  GrAutocomplete,
  GrButton,
  GrForm,
  GrFormField,
  GrInput,
  GrSelect,
  type GrFormRules,
} from '@feugene/granularity'

const model = reactive({ username: '', country: '', framework: '', password: '', confirm: '' })

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
]

const frameworks = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
]

const rules: GrFormRules = {
  username: [{ required: true, min: 3, trigger: 'blur' }],
  country: [{ required: true }],
  framework: [{ required: true }],
  password: [{ required: true, min: 8 }],
  confirm: [
    { required: true },
    { validator: value => value === model.password || 'Passwords do not match' },
  ],
}

const formRef = ref<InstanceType<typeof GrForm>>()
const result = ref('')

async function checkValidity() {
  const valid = await formRef.value?.validate()
  result.value = valid ? 'All fields valid ✓' : 'Fix the highlighted fields'
}
</script>

<template>
  <GrForm ref="formRef" :model="model" :rules="rules" class="grid max-w-md gap-4">
    <GrFormField name="username" label="Username">
      <GrInput v-model="model.username" placeholder="ada" />
    </GrFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <GrFormField name="country" label="Country">
        <GrSelect v-model="model.country" :options="countries" placeholder="Select…" aria-label="Country" />
      </GrFormField>

      <GrFormField name="framework" label="Framework">
        <GrAutocomplete v-model="model.framework" :options="frameworks" placeholder="Search…" aria-label="Framework" />
      </GrFormField>
    </div>

    <GrFormField name="password" label="Password" hint="At least 8 characters">
      <GrInput v-model="model.password" type="password" />
    </GrFormField>

    <GrFormField name="confirm" label="Confirm password">
      <GrInput v-model="model.confirm" type="password" />
    </GrFormField>

    <div class="flex items-center gap-3">
      <GrButton type="button" @click="checkValidity">
        Validate
      </GrButton>
      <span class="text-sm text-[var(--gr-muted-fg)]">{{ result }}</span>
    </div>
  </GrForm>
</template>`,
    note: 'Правило может иметь `trigger: "blur" | "change" | "submit"`; правило без триггера срабатывает на любом. Дефолтные сообщения (`gr.form.*`) локализованы (en/ru/es) и перекрываются `rule.message`.',
  },
  {
    id: 'form-custom-control',
    title: 'Custom control + custom validator',
    description: 'Свой контрол интегрируется в форму так же, как встроенные: он читает контекст `GrFormField` через `useGrFormFieldContext()` (id / aria-describedby / aria-invalid / required) и работает с `v-model`. Правило `brandColor` использует кастомный `validator`, возвращающий строку-ошибку для невалидного hex-цвета.',
    status: 'ready',
    previewKey: 'gr-form-custom-control',
    code: `<!-- CustomColorInput.vue — кастомный контрол -->
<script setup lang="ts">
import { computed } from 'vue'

import { useGrFormFieldContext } from '@feugene/granularity'

const model = defineModel<string>({ default: '' })

// Кастомный контрол сам подключается к GrFormField через контекст: id (связка с
// label \`for\`), aria-describedby (hint + error), aria-invalid и aria-required —
// ровно так же, как это делают встроенные GrInput / GrSelect / GrAutocomplete.
const field = useGrFormFieldContext()
const invalid = computed(() => Boolean(field?.invalid.value))
const isHex = computed(() => /^#[0-9a-f]{6}$/i.test(model.value))
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="h-9 w-9 shrink-0 rounded-lg border border-[var(--gr-brd)]"
      :style="{ background: isHex ? model : 'transparent' }"
    />
    <input
      :id="field?.id.value"
      v-model="model"
      :aria-describedby="field?.describedById.value"
      :aria-invalid="invalid || undefined"
      :aria-required="field?.required.value || undefined"
      placeholder="#3b82f6"
      class="h-9 w-full rounded-lg border bg-[var(--gr-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gr-primary)]/40"
      :class="invalid ? 'border-[var(--gr-danger)]' : 'border-[var(--gr-brd)]'"
    >
  </div>
</template>

<!-- Demo.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, type GrFormRules } from '@feugene/granularity'

import CustomColorInput from './CustomColorInput.vue'

const model = reactive({ label: '', brandColor: '' })

// Свой валидатор: возвращает true (ок) или строку с текстом ошибки.
function isHexColor(value: unknown) {
  return /^#[0-9a-f]{6}$/i.test(String(value)) || 'Use a 6-digit hex color, e.g. #3b82f6'
}

const rules: GrFormRules = {
  label: [{ required: true, min: 2 }],
  brandColor: [{ required: true }, { validator: isHexColor }],
}

const formRef = ref<InstanceType<typeof GrForm>>()
const saved = ref('')

function onSubmit() {
  saved.value = \`Saved “\${model.label}” · \${model.brandColor}\`
}
</script>

<template>
  <GrForm
    ref="formRef"
    :model="model"
    :rules="rules"
    class="grid max-w-sm gap-4"
    @submit="onSubmit"
  >
    <GrFormField name="label" label="Label">
      <GrInput v-model="model.label" placeholder="Primary brand" />
    </GrFormField>

    <GrFormField name="brandColor" label="Brand color" hint="Custom control — validated like any GrInput">
      <CustomColorInput v-model="model.brandColor" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">
        Save
      </GrButton>
      <GrButton variant="secondary" type="button" @click="formRef?.resetFields()">
        Reset
      </GrButton>
    </div>

    <p v-if="saved" class="text-sm text-[var(--gr-success)]">
      {{ saved }}
    </p>
  </GrForm>
</template>`,
    note: 'Тот же приём работает и для async-валидатора (например, проверка на сервере): `validator` может вернуть `Promise`. Любой контрол, который читает `useGrFormFieldContext()`, автоматически получает id/aria и попадает в валидацию.',
  },
  {
    id: 'form-editing',
    title: 'Editing form: snapshot, dirty state and async rule',
    description: 'Данные приходят после монтирования, поэтому форма пересниает снимок через `setSnapshot()` — иначе «Сбросить» вернул бы пустоту, какой модель была до ответа сервера. `isDirty` блокирует кнопки, `disabled` выключает всю форму на время отправки, а асинхронное правило показывает состояние проверки вместо молчания. Поле «Имя» обязательно пропом `required`, без записи в `rules`, — и submit это проверяет.',
    status: 'ready',
    previewKey: 'gr-form-editing',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput } from '@feugene/granularity'
import type { GrFormRules } from '@feugene/granularity'

type FormInstance = InstanceType<typeof GrForm>

const form = ref<FormInstance>()
const model = reactive<Record<string, unknown>>({ name: '', login: '' })
const loaded = ref(false)
const saving = ref(false)
const status = ref('—')

// Логин проверяется «на сервере»: пока ответ не пришёл, поле показывает
// состояние проверки, а не молчит.
const rules: GrFormRules = {
  login: [{
    async validator(value) {
      await new Promise(resolve => setTimeout(resolve, 900))
      return String(value).trim() === 'taken' ? 'Этот логин уже занят' : true
    },
  }],
}

async function load() {
  status.value = 'Загружаем…'
  await new Promise(resolve => setTimeout(resolve, 500))

  Object.assign(model, { name: 'Алан Тьюринг', login: 'alan' })
  // Снимок из \`setup\` был снят с пустой модели: без пересъёмки «Сбросить»
  // вернул бы форму к пустоте, а не к загруженным данным.
  form.value?.setSnapshot()

  loaded.value = true
  status.value = 'Данные загружены'
}

async function save() {
  saving.value = true
  status.value = 'Сохраняем…'
  await new Promise(resolve => setTimeout(resolve, 800))

  form.value?.setSnapshot()
  saving.value = false
  status.value = 'Сохранено'
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton variant="outline" :disabled="loaded" @click="load">
        Загрузить данные
      </GrButton>
      <span class="text-xs text-[var(--gr-muted-fg)]">{{ status }}</span>
    </div>

    <GrForm
      ref="form"
      :model="model"
      :rules="rules"
      :disabled="saving"
      class="grid gap-3"
      @submit="save"
    >
      <!-- Обязательность объявлена полем, а не правилом: submit её всё равно
           проверит. -->
      <GrFormField name="name" label="Имя" required>
        <GrInput v-model="model.name as string" placeholder="Как вас зовут" />
      </GrFormField>

      <GrFormField name="login" label="Логин" hint="Введите «taken», чтобы увидеть отказ сервера">
        <GrInput v-model="model.login as string" placeholder="alan" />
      </GrFormField>

      <div class="flex flex-wrap items-center gap-3">
        <GrButton type="submit" :disabled="!form?.isDirty || saving">
          Сохранить
        </GrButton>
        <GrButton variant="outline" :disabled="!form?.isDirty || saving" @click="form?.resetFields()">
          Сбросить
        </GrButton>
        <span class="text-xs text-[var(--gr-muted-fg)]">
          isDirty: {{ String(Boolean(form?.isDirty)) }} · isValid: {{ String(Boolean(form?.isValid)) }}
        </span>
      </div>
    </GrForm>
  </div>
</template>`,
  },
]
