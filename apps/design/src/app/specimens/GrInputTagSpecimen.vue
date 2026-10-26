<script setup lang="ts">
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewTags = ref(['дизайн', 'весна', 'сайт'])

const states = reactive({
  rest: [] as string[],
  filled: ['Москва', 'Казань'],
  invalid: ['анна@studio'],
  warning: ['бухгалтерия', 'все'],
  disabled: ['архив', '2024'],
  readonly: ['дизайн', 'весна', 'сайт'],
})

const skills = ref(['Исследования', 'Прототипы'])

const recipients = ref(['anna@studio.ru'])
const recipientsError = ref<string>()
const OUTSIDERS = new Set(['boris@gmail.com', 'test@test.ru'])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Проверка «на сервере»: адрес должен быть корректным и состоять в пространстве.
function checkRecipient(tag: string): Promise<boolean> {
  recipientsError.value = undefined
  return new Promise((resolve) => {
    setTimeout(() => resolve(EMAIL.test(tag) && !OUTSIDERS.has(tag)), 600)
  })
}

function onRejectRecipient(tag: string): void {
  recipientsError.value = EMAIL.test(tag)
    ? `${tag} не состоит в пространстве — сначала пригласите его`
    : `«${tag}» — не адрес почты`
}

const keywords = ref(['керамика', 'лён', 'ручная работа'])

const stepTags = ref(['лён', 'хлопок'])
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Метки проекта">
      <GrInputTag v-model="previewTags" placeholder="Добавить" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Состояния" note="На весь набор — одна остановка Tab, крестики достижимы стрелками; у каждого крестика имя своего тега." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Города доставки">
            <GrInputTag v-model="states.rest" placeholder="Город и Enter" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">заполнено</span>
          <GrFormField label="Города доставки">
            <GrInputTag v-model="states.filled" placeholder="Ещё город" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Копия письма" error="Нет домена после «@» — например, studio.ru" required>
            <GrInputTag v-model="states.invalid" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">предупреждение</span>
          <GrFormField label="Группы рассылки" hint="«все» — это 240 человек">
            <GrInputTag v-model="states.warning" state="warning" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Метки архива" hint="Архив закрыт для правок" disabled>
            <GrInputTag v-model="states.disabled" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Метки проекта" readonly>
            <GrInputTag v-model="states.readonly" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Предел и очистка" note="Enter или запятая превращают набранное в тег; на пределе поле живо, лишнее просто не добавляется.">
      <GrFormField label="Навыки" hint="До шести навыков">
        <GrInputTag
          v-model="skills"
          :max="6"
          placeholder="Добавить навык"
          clearable
          clear-all-label="Убрать все навыки"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Проверка перед добавлением" note="Вставка «a@x.ru; b@y.ru» разбивается на теги; проверка идёт со спиннером, отказ объясняет поле.">
      <GrFormField label="Получатели отчёта" :error="recipientsError" :hint="recipientsError ? undefined : 'Только участники пространства — boris@gmail.com не пройдёт'">
        <GrInputTag
          v-model="recipients"
          :separators="[',', ';', ' ']"
          :before-add="checkRecipient"
          placeholder="Адрес и Enter"
          @reject="onRejectRecipient"
        >
          <template #tag="{ tag }">
            <span class="font-500">{{ tag.split('@')[0] }}</span>
            <span class="text-[var(--gr-muted-fg)]">@{{ tag.split('@')[1] }}</span>
          </template>
        </GrInputTag>
      </GrFormField>
    </Specimen>

    <Specimen title="Правка на месте" note="Двойной клик или F2 на теге открывают правку: Enter сохраняет, Escape отменяет.">
      <GrFormField label="Ключевые слова" hint="Опечатку можно поправить, не набирая тег заново">
        <GrInputTag v-model="keywords" editable tag-tone="primary" placeholder="Ещё слово" />
      </GrFormField>
    </Specimen>

    <Specimen title="Ступени" note="Теги идут за ступенью поля.">
      <div v-for="size in SIZES" :key="size" class="flex items-center gap-3">
        <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrInputTag v-model="stepTags" :size="size" placeholder="Ткань" :aria-label="`Ткани, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
