<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { z } from 'zod'

import { GrButton } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
import type { GrSchemaModel } from '@feugene/granularity-forms-schema'
import type { GrUiSchema } from '@feugene/granularity-forms-schema/ui-schema'
import { zodAdapter } from '@feugene/granularity-forms-schema/zod'

/**
 * Три яруса проверки — и почему их именно три.
 *
 * Ярусы не про удобство реализации, а про то, когда появляется сообщение.
 * Первый успевает к нажатию клавиши, третий требует прогнать схему целиком, и
 * платить за это на каждый символ незачем.
 */
const schema = z.object({
  // Ярус 1 — ложится в правило ядра: сообщение из локали, то же, что у формы,
  // написанной руками.
  email: z.email().meta({ title: 'Почта' }),
  // Ярус 2 — локальный валидатор: кратность правилом ядра не выражается.
  seats: z.number().int().multipleOf(5).min(5).max(100).meta({ title: 'Мест в тарифе, кратно 5' }),
  password: z.string().min(8).meta({ title: 'Пароль' }),
  passwordAgain: z.string().min(8).meta({ title: 'Пароль ещё раз' }),
  // Ярус 2 же: «обязан быть отмечен» — это не `required`, см. текст под формой.
  terms: z.literal(true).meta({ title: 'Согласен с условиями' }),
})
  // Ярус 3 — кросс-полевое правило. Из модели такое не выражается вовсе:
  // `residual` получает корневой узел, а дальше схему надо звать самому — см.
  // `onSubmit` ниже.
  .refine(value => value.password === value.passwordAgain, {
    path: ['passwordAgain'],
    message: 'Пароли не совпадают',
  })

const ui: GrUiSchema = {
  layout: { columns: { base: 1, md: 2 } },
  fields: { terms: { span: 'full' } },
}

const model = ref<Record<string, unknown>>({
  email: 'не-почта',
  seats: 7,
  password: 'correct-horse',
  passwordAgain: 'battery-staple',
})

const submitted = ref(false)

const parsed = shallowRef<GrSchemaModel | null>(null)
const schemaErrors = ref<{ errors: Record<string, string[]> } | null>(null)

/**
 * Ярус 3 — схема как последняя инстанция, и подключается он вручную.
 *
 * `refine` помечает `residual` **корневой** узел, а контейнеры правил не несут:
 * дотянуться до `passwordAgain` объявлением поля нечем — путь ошибки zod
 * сообщает только в момент проверки. Поэтому схему гоняют на отправке, а её
 * замечания раскладывают по полям тем же путём, что и ответ сервера.
 */
function onSubmit(): void {
  const issues = parsed.value?.validate?.(model.value)

  if (!Array.isArray(issues) || issues.length === 0) {
    schemaErrors.value = null
    submitted.value = true

    return
  }

  submitted.value = false
  // Карта «поле: сообщения» — форма Laravel, самая короткая из тех, что
  // `serverErrors` понимает без настройки.
  schemaErrors.value = {
    errors: issues.reduce<Record<string, string[]>>((map, issue) => {
      map[issue.path] = [...(map[issue.path] ?? []), issue.message]

      return map
    }, {}),
  }
}
</script>

<template>
  <div class="grid gap-3">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[zodAdapter]"
      :ui-schema="ui"
      :server-errors="schemaErrors"
      show-form-errors
      @parsed="value => (parsed = value)"
      @submit="onSubmit"
      @invalid="submitted = false"
    >
      <!-- Кнопку рисует потребитель: форма не знает, одна она на странице или
           лежит в подвале мастера рядом с «Назад». -->
      <template #actions>
        <div class="mt-2 flex justify-end">
          <GrButton type="submit">
            Отправить
          </GrButton>
        </div>
      </template>
    </GrSchemaForm>

    <p v-if="submitted" class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-fg)]">
      Отправлено: прошли все три яруса.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Нажмите «Отправить», ничего не меняя, — сработают три разных механизма. Ядро возвращает
      <strong>первое</strong> сработавшее правило на поле, поэтому третий ярус видно после того, как
      починены первые два: поправьте почту и число мест, и появится «Пароли не совпадают».
      <code>email</code> ловит <strong>правило ядра</strong> (ярус 1, сообщение из локали, то же
      самое, что у формы, написанной руками). «Мест в тарифе» — <strong>локальный валидатор</strong>
      (ярус 2: кратность пяти в правило ядра не укладывается, как и уникальность элементов или
      строгие границы). «Пароли не совпадают» — <strong>полная проверка схемой</strong> (ярус 3:
      кросс-полевое условие из модели не выражается вовсе, узел помечен <code>residual</code>).
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Третий ярус подключается <strong>вручную</strong>, обвязкой в исходнике демо, и причина
      видна в модели: <code>refine</code> помечает <code>residual</code> у <strong>корневого</strong>
      узла, а не у <code>passwordAgain</code>. Путь ошибки zod сообщает только в момент проверки,
      объявить его заранее нечем. Поэтому схему гоняют на отправке, а её замечания раскладывают по
      полям тем же способом, что и ответ сервера, — через <code>serverErrors</code>. Схема здесь
      последняя инстанция, ровно как бэкенд.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Флажок согласия — <strong>не</strong> <code>required</code>, и это ловушка, на которой
      обжигаются все. Ядро не считает <code>false</code> пустым — иначе поле пряталось бы там, где
      форма считает его заполненным, — поэтому <code>required</code> на чекбоксе спокойно пропускает
      <strong>снятый</strong> флажок. Правильный способ — <code>z.literal(true)</code>: «обязан быть
      отмечен» это утверждение о значении, а не о заполненности.
    </p>
  </div>
</template>
