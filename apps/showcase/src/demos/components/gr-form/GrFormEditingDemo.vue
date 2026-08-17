<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput } from '@feugene/granularity'
import type { GrFormInstance, GrFormRules } from '@feugene/granularity'

type FormInstance = GrFormInstance

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
  // Снимок из `setup` был снят с пустой модели: без пересъёмки «Сбросить»
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
</template>
