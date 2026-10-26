<script setup lang="ts">
import type { GrTooltipPlacement, GrTooltipSize } from '@feugene/granularity'
import IconBold from '~icons/lucide/bold'
import IconCircleHelp from '~icons/lucide/circle-help'
import IconItalic from '~icons/lucide/italic'
import IconLink from '~icons/lucide/link'
import IconList from '~icons/lucide/list'
import IconQuote from '~icons/lucide/quote'
import IconSave from '~icons/lucide/save'
import IconTrash from '~icons/lucide/trash-2'
import IconUnderline from '~icons/lucide/underline'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const formatting = [
  { key: 'bold', label: 'Жирный', keys: 'mod+b', icon: IconBold },
  { key: 'italic', label: 'Курсив', keys: 'mod+i', icon: IconItalic },
  { key: 'underline', label: 'Подчёркнутый', keys: 'mod+u', icon: IconUnderline },
  { key: 'list', label: 'Список', keys: 'mod+shift+8', icon: IconList },
  { key: 'quote', label: 'Цитата', keys: 'mod+shift+9', icon: IconQuote },
]

const PLACEMENTS: { placement: GrTooltipPlacement, label: string }[] = [
  { placement: 'top', label: 'Сверху' },
  { placement: 'right', label: 'Справа' },
  { placement: 'bottom', label: 'Снизу' },
  { placement: 'left', label: 'Слева' },
]

const SIZES: readonly GrTooltipSize[] = ['xs', 'sm', 'md', 'lg']

// Подсказка нужна только обрезанной строке: остальные не дают лишней остановки Tab.
const attachments = [
  { name: 'Договор.pdf', truncated: false },
  { name: 'Приложение 3 — спецификация оборудования и график поставок на второе полугодие.xlsx', truncated: true },
  { name: 'Счёт № 114.pdf', truncated: false },
  { name: 'Протокол согласования разногласий к договору поставки с комментариями юристов.docx', truncated: true },
]
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-1">
      <GrTooltip text="Скопировать ссылку" :describe-trigger="false">
        <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Скопировать ссылку">
          <IconLink />
        </GrButton>
      </GrTooltip>
      <GrTooltip text="Сохранить · ⌘S">
        <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Сохранить">
          <IconSave />
        </GrButton>
      </GrTooltip>
      <GrTooltip text="Удалить безвозвратно">
        <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Удалить">
          <IconTrash />
        </GrButton>
      </GrTooltip>
    </div>
    <div class="flex items-center gap-1">
      <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">Лимит запросов</span>
      <GrTooltip text="Сколько обращений к API в минуту" placement="right">
        <GrButton variant="ghost" tone="neutral" size="xs" square aria-label="Что такое лимит запросов">
          <IconCircleHelp />
        </GrButton>
      </GrTooltip>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Имя кнопки-иконки" note="Подсказка дополняет aria-label, а не заменяет его; повторяет имя дословно — describe-trigger выключают.">
      <div class="flex flex-wrap items-center gap-1">
        <GrTooltip text="Скопировать ссылку" :describe-trigger="false">
          <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Скопировать ссылку">
            <IconLink />
          </GrButton>
        </GrTooltip>
        <GrTooltip text="Сохранить · ⌘S">
          <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Сохранить">
            <IconSave />
          </GrButton>
        </GrTooltip>
        <GrTooltip text="Удалить безвозвратно">
          <GrButton variant="ghost" tone="neutral" size="sm" square aria-label="Удалить">
            <IconTrash />
          </GrButton>
        </GrTooltip>
      </div>
    </Specimen>

    <Specimen title="Пояснение к термину" note="Появляется и по наведению, и по фокусу, и по тапу; Esc закрывает сразу.">
      <div class="flex items-center gap-1">
        <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">Лимит запросов</span>
        <GrTooltip text="Сколько обращений к API в минуту" placement="right">
          <GrButton variant="ghost" tone="neutral" size="xs" square aria-label="Что такое лимит запросов">
            <IconCircleHelp />
          </GrButton>
        </GrTooltip>
      </div>
    </Specimen>

    <Specimen title="Панель инструментов" note="Задержка показа не даёт подсказкам мигать при проведении курсором вдоль ряда; внутри — разметка со своими клавишами.">
      <div role="group" aria-label="Форматирование" class="flex w-fit flex-wrap items-center gap-0.5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-1">
        <GrTooltip v-for="action in formatting" :key="action.key" :open-delay="400" :describe-trigger="false">
          <GrButton variant="ghost" tone="neutral" size="sm" square :aria-label="action.label">
            <component :is="action.icon" />
          </GrButton>
          <template #content>
            <span class="flex items-center gap-2">
              {{ action.label }}
              <GrKbd :keys="action.keys" size="sm" />
            </span>
          </template>
        </GrTooltip>
      </div>
    </Specimen>

    <Specimen title="Стороны" note="placement — предпочтение: у края экрана подсказка перевернётся и не вылезет за него.">
      <div class="flex flex-wrap items-center gap-2">
        <GrTooltip v-for="item in PLACEMENTS" :key="item.placement" :text="`Подсказка: ${item.label.toLowerCase()}`" :placement="item.placement">
          <GrButton variant="secondary" tone="neutral" size="sm">
            {{ item.label }}
          </GrButton>
        </GrTooltip>
      </div>
    </Specimen>

    <Specimen title="Ступени и иконка по умолчанию" note="Без слота триггер — иконка info, она и остановка Tab; xs · sm · md · lg растят и иконку, и текст подсказки.">
      <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
        <template v-for="size in SIZES" :key="size">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
          <div class="flex items-center gap-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
            Комиссия сервиса
            <GrTooltip :size="size" text="Удерживается с каждой оплаты, возвращается при отмене заказа" />
          </div>
        </template>
      </div>
    </Specimen>

    <Specimen title="Только у обрезанной строки" note="Полный текст — подсказкой там, где строка не поместилась; у остальных disabled снимает и подсказку, и остановку Tab.">
      <ul class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] text-[var(--gr-card-fg)]">
        <li
          v-for="(file, index) in attachments"
          :key="file.name"
          class="px-4 py-2.5"
          :class="index > 0 ? 'border-t border-[var(--gr-brd)]' : ''"
        >
          <GrTooltip :text="file.name" :disabled="!file.truncated" block placement="top-start">
            <span class="min-w-0 truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">{{ file.name }}</span>
          </GrTooltip>
        </li>
      </ul>
    </Specimen>
  </div>
</template>
