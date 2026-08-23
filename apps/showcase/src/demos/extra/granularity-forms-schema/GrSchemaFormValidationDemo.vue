<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'

import { GrButton } from '@feugene/granularity'
import { GrSchemaForm } from '@feugene/granularity-forms-schema'
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
  // `residual` получает корневой узел, и форма гоняет схему сама на отправке.
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
</script>

<template>
  <div class="grid gap-3">
    <GrSchemaForm
      v-model="model"
      :schema="schema"
      :adapters="[zodAdapter]"
      :ui-schema="ui"
      show-form-errors
      @submit="submitted = true"
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
      Третий ярус не требует ни строчки обвязки. <code>refine</code> на объекте помечает
      <code>residual</code> у <strong>корневого</strong> узла, а не у <code>passwordAgain</code>:
      путь ошибки схема сообщает только в момент проверки, объявить его заранее нечем. Поэтому
      форма сама прогоняет схему на отправке и раскладывает её замечания по полям — тем же путём,
      которым разбирает ответ сервера. Формам без кросс-полевых правил это не стоит ничего: проверка
      не запускается вовсе. Выключается тем же <code>validation.tiers</code>, без второго пропа.
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
