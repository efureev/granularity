<script setup lang="ts">
import { reactive, ref } from 'vue'

import IconSearch from '~icons/lucide/search'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewMail = ref('anna@studio')

const fields = reactive({
  hint: 'Анна Ершова',
  required: '',
  invalid: 'anna@studio',
  errors: 'qwerty',
  disabled: 'Мастерская',
  readonly: 'Д-2024/118',
})

const sideName = ref('Анна Ершова')
const sideTeam = ref('Мастерская')

const iban = ref('RU02 0445 2560 0407 0281')
const bik = ref('04452')
const checked = ref(false)

const steps = reactive<Record<string, string>>({ xs: '', sm: '', md: '', lg: '' })

const filters = reactive({ query: '', from: null as number | null, to: 50000 as number | null })
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Рабочая почта" error="Нет домена после «@» — например, studio.ru" required>
      <GrInput v-model="previewMail" type="email" autocomplete="email" />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Подпись, подсказка, ошибка" note="Подпись связана с полем сама, подсказка и ошибка уходят в его описание; звёздочку объявляет контрол, а не текст." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">подсказка</span>
          <GrFormField label="Имя в подписи писем" hint="Видят получатели">
            <GrInput v-model="fields.hint" autocomplete="name" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">обязательное</span>
          <GrFormField label="Название пространства" required>
            <GrInput v-model="fields.required" placeholder="Например, Мастерская" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Почта" error="Нет домена после «@» — например, studio.ru" required>
            <GrInput v-model="fields.invalid" type="email" autocomplete="email" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">несколько ошибок</span>
          <GrFormField label="Пароль" :error="['Не короче 10 знаков', 'Нужна хотя бы одна цифра']" required>
            <GrInput v-model="fields.errors" type="password" autocomplete="new-password" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Команда" hint="Меняет владелец пространства" disabled>
            <GrInput v-model="fields.disabled" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Номер договора" readonly>
            <GrInput v-model="fields.readonly" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Подпись слева" note="Для длинных настроек: подпись встаёт на линию текста поля, подсказка и ошибка — под полем.">
      <GrFormField label="Имя" label-position="start" :label-width="132">
        <GrInput v-model="sideName" autocomplete="name" />
      </GrFormField>
      <GrFormField label="Команда" label-position="start" :label-width="132" hint="Видна в подписи писем">
        <GrInput v-model="sideTeam" />
      </GrFormField>
    </Specimen>

    <Specimen title="Место под ошибку" note="Строка под сообщение держится заранее: проверка не сдвигает кнопку и поля ниже.">
      <GrFormField label="IBAN" :error="checked ? 'В IBAN 33 знака — здесь меньше' : undefined" reserve-message>
        <GrInput v-model="iban" />
      </GrFormField>
      <GrFormField label="БИК" :error="checked ? 'БИК — девять цифр' : undefined" reserve-message>
        <GrInput v-model="bik" inputmode="numeric" />
      </GrFormField>
      <div>
        <GrButton variant="outline" tone="neutral" @click="checked = !checked">
          {{ checked ? 'Снять ошибки' : 'Проверить реквизиты' }}
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Подпись, подсказка и отступы идут за ступенью поля.">
      <GrFormField v-for="size in SIZES" :key="size" :label="`Название · ${size}`" :size="size" hint="Видно в шапке">
        <GrInput v-model="steps[size]" :size="size" placeholder="Мастерская" />
      </GrFormField>
    </Specimen>

    <Specimen title="Плотная форма" note="Фильтры над таблицей на ступени sm: поля и кнопки в одну линию, подписи над полями." wide>
      <div class="flex flex-wrap items-end gap-3">
        <GrFormField label="Поиск" size="sm" class="w-full sm:w-64">
          <GrInput v-model="filters.query" type="search" size="sm" addon="inline" placeholder="Номер или клиент">
            <template #prefix>
              <GrIcon size="sm">
                <IconSearch />
              </GrIcon>
            </template>
          </GrInput>
        </GrFormField>
        <GrFormField label="Сумма от" size="sm" class="w-36">
          <GrNumberInput v-model="filters.from" size="sm" :min="0" locale="ru-RU" use-grouping>
            <template #suffix>
              ₽
            </template>
          </GrNumberInput>
        </GrFormField>
        <GrFormField label="Сумма до" size="sm" class="w-36">
          <GrNumberInput v-model="filters.to" size="sm" :min="0" locale="ru-RU" use-grouping>
            <template #suffix>
              ₽
            </template>
          </GrNumberInput>
        </GrFormField>
        <div class="flex gap-2">
          <GrButton size="sm">
            Применить
          </GrButton>
          <GrButton size="sm" variant="ghost" tone="neutral">
            Сбросить
          </GrButton>
        </div>
      </div>
    </Specimen>
  </div>
</template>
