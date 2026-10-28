<script setup lang="ts">
import type { GrRichTextProps } from '@feugene/granularity-editor'
import { computed, reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

/** Значение поля: строка разметки при `output="html"`, документ TipTap при `output="json"`. */
type RichTextValue = GrRichTextProps['modelValue']

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const previewText = ref<RichTextValue>('<p>Привезите образцы <strong>льна</strong> к четвергу.</p>')

const description = ref<RichTextValue>(
  '<h2>Рубашка из льна</h2>'
  + '<p>Свободный крой, <strong>плотный лён</strong> и перламутровые пуговицы. Садится после первой стирки на <em>полразмера</em>.</p>'
  + '<ul><li><p>стирка при 30 °C</p></li><li><p>не отбеливать</p></li></ul>',
)

/** Одно значение в двух схемах: чего нет в схеме, то не переживает разбора — скрипт и фрейм не доходят ни до одной. */
const DIRTY = '<h2>Условия возврата</h2><p>Вернуть товар можно <strong>в течение 14 дней</strong>.</p>'
  + '<blockquote><p>Бирки и упаковка сохранены.</p></blockquote>'
  + '<script>alert(1)<\/script><iframe></iframe>'
const bySchema = reactive<Record<'minimal' | 'article', RichTextValue>>({ minimal: DIRTY, article: DIRTY })

const states = reactive<Record<'empty' | 'invalid' | 'readonly' | 'disabled', RichTextValue>>({
  empty: '',
  invalid: '<p>Хорошо</p>',
  readonly: '<p>Доставка по Москве в пределах МКАД — <strong>бесплатно</strong>.</p>',
  disabled: '<p>Текст оферты согласует юрист.</p>',
})

const SIZE_SAMPLE = '<p>Образцы ткани — <strong>к четвергу</strong>.</p>'
const bySize = reactive<Record<typeof SIZES[number], RichTextValue>>({ xs: SIZE_SAMPLE, sm: SIZE_SAMPLE, md: SIZE_SAMPLE, lg: SIZE_SAMPLE })

const note = ref<RichTextValue>('<p>Выделите слово в этой заметке — панель встанет прямо у выделения.</p>')

const letter = ref<RichTextValue>('<p>Анна, добрый день! Счёт <strong>СЧ-1046</strong> оплачен, акт пришлём до пятницы.</p>')
const letterLength = computed(() => (typeof letter.value === 'string' ? letter.value.replace(/<[^>]*>/g, '').length : 0))
const sent = ref('')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3 [--gr-rich-text-min-height:var(--gr-space-12)]">
    <GrRichText v-model="previewText" size="sm" aria-label="Комментарий к заказу" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Поле статьи" note="Тулбар собран из схемы article: начертание, заголовки, цитата, код, списки; одна остановка Tab, внутри — стрелки, активный формат объявлен aria-pressed.">
      <GrFormField label="Описание товара" hint="Покупатель увидит его на карточке товара">
        <GrRichText v-model="description" schema="article" />
      </GrFormField>
    </Specimen>

    <Specimen title="Схема — она же санитайзер" note="В оба поля пришло одно значение: minimal оставляет строчную разметку, article — ещё заголовок и цитату; скрипт и фрейм не переживают разбора нигде.">
      <div class="flex flex-col gap-1.5 [--gr-rich-text-min-height:var(--gr-space-16)]">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">minimal</span>
        <GrRichText v-model="bySchema.minimal" schema="minimal" aria-label="Условия возврата, схема minimal" />
      </div>
      <div class="flex flex-col gap-1.5 [--gr-rich-text-min-height:var(--gr-space-16)]">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">article</span>
        <GrRichText v-model="bySchema.article" schema="article" aria-label="Условия возврата, схема article" />
      </div>
    </Specimen>

    <Specimen title="Состояния" note="Тот же контракт, что у полей ядра: подпись, ошибка, недоступность и только чтение приходят из GrFormField; недоступное поле гасит и кнопки тулбара." wide>
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2 [--gr-rich-text-min-height:var(--gr-space-16)]">
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">пусто</span>
          <GrFormField label="Комментарий к заказу">
            <GrRichText v-model="states.empty" placeholder="Например, позвонить за час до приезда" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">ошибка</span>
          <GrFormField label="Отзыв" error="Нужно хотя бы 20 знаков — что понравилось, что нет" required>
            <GrRichText v-model="states.invalid" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">только чтение</span>
          <GrFormField label="Условия доставки" readonly>
            <GrRichText v-model="states.readonly" />
          </GrFormField>
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">недоступно</span>
          <GrFormField label="Оферта" hint="Правит только юрист" disabled>
            <GrRichText v-model="states.disabled" />
          </GrFormField>
        </div>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Кегль текста и кнопки тулбара — по шкале полей ввода.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3 [--gr-rich-text-min-height:var(--gr-space-10)]">
        <span class="w-6 shrink-0 pt-1 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrRichText v-model="bySize[size]" :size="size" :aria-label="`Заметка, ступень ${size}`" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Панель у выделения" note="toolbar=&quot;bubble&quot; — кнопки самой мелкой ступени над выделенным текстом, пока в поле фокус; Esc закрывает, форматы доступны и горячими клавишами.">
      <GrFormField label="Заметка к сделке">
        <GrRichText v-model="note" toolbar="bubble" />
      </GrFormField>
    </Specimen>

    <Specimen title="Шапка и подвал" note="Зоны внутри рамки поля, отбитые линией изнутри: адресат сверху, счётчик и отправка снизу — связь с полем держит разметка, а не близость.">
      <GrRichText v-model="letter" schema="article" aria-label="Письмо клиенту">
        <template #header>
          <div class="flex items-center justify-between gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            <span>Кому: <strong>anna@len.studio</strong></span>
            <GrBadge tone="warning" size="sm">
              Черновик
            </GrBadge>
          </div>
        </template>
        <template #footer>
          <div class="flex items-center justify-between gap-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            <span role="status">{{ sent || `Знаков: ${letterLength}` }}</span>
            <GrButton size="xs" variant="outline" @click="sent = 'Письмо отправлено'">
              Отправить
            </GrButton>
          </div>
        </template>
      </GrRichText>
    </Specimen>
  </div>
</template>
