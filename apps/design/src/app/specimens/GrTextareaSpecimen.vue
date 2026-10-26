<script setup lang="ts">
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewComment = ref('Позвоните за час до приезда, домофон не работает.')

const states = reactive({
  rest: '',
  invalid: 'Хорошо',
  success: 'Курьер приедет с 10 до 14, оплата картой при получении.',
  warning: 'Оставьте у двери, подпишу акт потом.',
  disabled: 'Текст договора согласует юрист.',
  readonly: 'Доставка по Москве в пределах МКАД — бесплатно, за МКАД — по тарифу курьерской службы.',
})

const comment = ref('Позвоните за час до приезда, домофон не работает — код 42К.')
const address = ref('Москва, ул. Лесная, 12\nподъезд 3, этаж 5\nвход со двора')
const tweet = ref('Весенняя коллекция уже в мастерской: льняные рубашки, плетёные сумки и керамика ручной работы.')
const note = ref('Не забыть: образцы ткани для примерки в четверг.')
const draft = ref('')
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Комментарий к заказу">
      <GrTextarea v-model="previewComment" :rows="2" resize="none" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="Те же состояния, что у однострочного поля; только для чтения — текст остаётся чернилами." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">покой</span>
          <GrFormField label="Пожелания">
            <GrTextarea v-model="states.rest" :rows="2" placeholder="Например, позвонить заранее" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Отзыв" error="Нужно хотя бы 20 знаков — что понравилось, что нет" required>
            <GrTextarea v-model="states.invalid" :rows="2" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">успех</span>
          <GrFormField label="Условия" hint="Курьер увидит их в приложении">
            <GrTextarea v-model="states.success" :rows="2" state="success" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">предупреждение</span>
          <GrFormField label="Инструкция курьеру" hint="Без подписи акт придётся оформлять заново">
            <GrTextarea v-model="states.warning" :rows="2" state="warning" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Особые условия" hint="Правит только юрист" disabled>
            <GrTextarea v-model="states.disabled" :rows="2" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Условия доставки" readonly>
            <GrTextarea v-model="states.readonly" :rows="2" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Счётчик и автовысота" note="Растёт вместе с текстом; у лимита счётчик связан с полем и читается диктором.">
      <GrFormField label="Комментарий к заказу" hint="Курьер увидит его в приложении">
        <GrTextarea v-model="comment" :rows="3" :maxlength="280" autosize resize="none" show-count />
      </GrFormField>
    </Specimen>

    <Specimen title="Строки и своя формулировка" note="Строки считаются по переводам, перебор показан, а не обрезан; формулировку счётчика можно заменить.">
      <GrFormField label="Адрес для этикетки" hint="Принтер печатает до четырёх строк">
        <GrTextarea v-model="address" :rows="3" :max-lines="4" show-line-count />
      </GrFormField>
      <GrFormField label="Анонс в соцсетях">
        <GrTextarea v-model="tweet" :rows="3" :maxlength="140">
          <template #count="{ remaining }">
            {{ remaining !== undefined && remaining < 0 ? `перебор на ${-remaining}` : `в запасе ${remaining}` }}
          </template>
        </GrTextarea>
      </GrFormField>
    </Specimen>

    <Specimen title="Очистка" note="Крестик в углу появляется, когда есть что стирать; первая строка под него не уходит.">
      <GrFormField label="Заметка">
        <GrTextarea v-model="note" :rows="2" clearable clear-label="Стереть заметку" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Кегль и отступы — по шкале полей ввода.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3">
        <span class="w-6 shrink-0 pt-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrTextarea v-model="draft" :size="size" :rows="2" resize="none" placeholder="Черновик письма" :aria-label="`Черновик письма, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
