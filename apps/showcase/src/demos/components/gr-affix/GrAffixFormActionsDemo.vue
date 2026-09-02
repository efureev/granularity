<script setup lang="ts">
import { ref } from 'vue'

import { GrAffix, GrButton, GrFormField, GrInput, GrTextarea } from '@feugene/granularity'

const fields = ref({
  title: 'Договор поставки № 4417',
  counterparty: 'ООО «Севертранс»',
  amount: '1 840 000',
  contact: 'Ирина Логвинова',
  email: 'logvinova@severtrans.ru',
  comment: '',
})
</script>

<template>
  <div
    class="h-[340px] w-full overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
    tabindex="0"
    role="group"
    aria-label="Карточка договора"
  >
    <!--
      Отступы живут на содержимом, а не на прокручиваемом блоке: панель обязана
      быть во всю его ширину, иначе поля контейнера остаются по бокам от неё и
      уезжающая форма видна в этих просветах.

      Панель — прямой ребёнок формы: её containing block и есть форма, вдоль
      которой панель едет. Обёртка вокруг панели зажала бы `sticky` и он
      перестал бы работать вовсе.
    -->
    <form @submit.prevent>
      <div class="flex flex-col gap-4 p-4">
        <GrFormField label="Название">
          <GrInput v-model="fields.title" />
        </GrFormField>
        <GrFormField label="Контрагент">
          <GrInput v-model="fields.counterparty" />
        </GrFormField>
        <GrFormField label="Сумма, ₽">
          <GrInput v-model="fields.amount" />
        </GrFormField>
        <GrFormField label="Контактное лицо">
          <GrInput v-model="fields.contact" />
        </GrFormField>
        <GrFormField label="Почта для уведомлений">
          <GrInput v-model="fields.email" type="email" />
        </GrFormField>
        <GrFormField label="Комментарий">
          <GrTextarea v-model="fields.comment" :rows="4" />
        </GrFormField>
      </div>

      <GrAffix placement="bottom">
        <div class="flex justify-end gap-2 px-4 py-3">
          <GrButton variant="ghost">
            Отмена
          </GrButton>
          <GrButton variant="primary" type="submit">
            Сохранить договор
          </GrButton>
        </div>
      </GrAffix>
    </form>
  </div>
</template>
