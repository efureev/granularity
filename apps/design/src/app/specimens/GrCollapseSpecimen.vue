<script setup lang="ts">
import { ref } from 'vue'
import type { GrCollapseBeforeChange, GrCollapseModelValue } from '@feugene/granularity/components/GrCollapse'
import type { GrDescriptionItem } from '@feugene/granularity/components/GrDescriptionList'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const requisites: GrDescriptionItem[] = [
  { label: 'Получатель', value: 'ООО «Глина»' },
  { label: 'ИНН', value: '7704123456' },
  { label: 'Расчётный счёт', value: '40702810900000012345' },
]

const openSections = ref<GrCollapseModelValue>(['requisites'])

const faq = [
  { name: 'pay', title: 'Как оплатить счёт?', answer: 'Картой, через СБП или переводом по реквизитам из письма — счёт закроется сам, как только придут деньги.' },
  { name: 'refund', title: 'Можно ли вернуть оплату?', answer: 'Да, в течение 14 дней. Деньги вернутся тем же способом, каким пришли, за 10 рабочих дней.' },
  { name: 'docs', title: 'Где закрывающие документы?', answer: 'В разделе «Документы» через день после оплаты; оригиналы уходят почтой раз в месяц.' },
]
const openQuestion = ref<GrCollapseModelValue>('pay')

const openFilters = ref<GrCollapseModelValue>(['status'])
const statuses = ref({ paid: true, waiting: true, overdue: false })

const dirty = ref(true)
const refused = ref(false)
const openDraft = ref<GrCollapseModelValue>(['draft'])

// Сворачивать с несохранённой правкой нельзя; раскрытие пропускается всегда.
const keepDirtyOpen: GrCollapseBeforeChange = (_name, expanding) => {
  refused.value = !expanding && dirty.value
  return !refused.value
}

const textClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]'
const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrCollapse :heading-level="5">
      <GrCollapseItem name="requisites" title="Реквизиты для оплаты">
        <GrDescriptionList :items="requisites" density="compact" size="sm" />
      </GrCollapseItem>
      <GrCollapseItem name="history" title="История изменений">
        <template #extra>
          <GrBadge tone="neutral" size="sm">
            3 правки
          </GrBadge>
        </template>
        <p :class="textClass">
          Сумма исправлена 12 октября.
        </p>
      </GrCollapseItem>
    </GrCollapse>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Раскрытие" note="Секции открываются независимо; счётчик — рядом с заголовком, а не внутри кнопки.">
      <GrCollapse v-model="openSections" :heading-level="5">
        <GrCollapseItem name="requisites" title="Реквизиты для оплаты">
          <GrDescriptionList :items="requisites" density="compact" size="sm" label-width="9rem" />
        </GrCollapseItem>
        <GrCollapseItem name="refund" title="Условия возврата">
          <p :class="textClass">
            Деньги возвращаем в течение 10 рабочих дней на ту же карту или счёт, с которых пришла оплата.
          </p>
        </GrCollapseItem>
        <GrCollapseItem name="history" title="История изменений">
          <template #extra>
            <GrBadge tone="neutral" size="sm">
              3 правки
            </GrBadge>
          </template>
          <p :class="textClass">
            Сумма исправлена 12 октября, срок оплаты перенесён на 28 октября, бухгалтерия добавила комментарий.
          </p>
        </GrCollapseItem>
      </GrCollapse>
    </Specimen>

    <Specimen title="Аккордеон" note="Открыта одна секция за раз; недоступная пропускается и стрелками.">
      <GrCollapse v-model="openQuestion" accordion :heading-level="5">
        <GrCollapseItem v-for="item in faq" :key="item.name" :name="item.name" :title="item.title">
          <p :class="textClass">
            {{ item.answer }}
          </p>
        </GrCollapseItem>
        <GrCollapseItem name="api" title="Есть ли API для бухгалтерии?" disabled>
          <p :class="textClass">
            Появится в следующем квартале.
          </p>
        </GrCollapseItem>
      </GrCollapse>
    </Specimen>

    <Specimen title="Без рамки, шеврон в начале" note="borderless — внутри карточки или панели фильтров, где своя рамка уже есть.">
      <GrCard title="Фильтры" :heading-level="5">
        <GrCollapse v-model="openFilters" borderless expand-icon-position="start" size="sm" :heading-level="6">
          <GrCollapseItem name="status" title="Статус счёта">
            <template #extra>
              <GrBadge tone="primary" size="sm">
                2
              </GrBadge>
            </template>
            <div class="flex flex-col gap-2">
              <GrCheckbox v-model="statuses.paid">
                Оплачен
              </GrCheckbox>
              <GrCheckbox v-model="statuses.waiting">
                Ждёт оплаты
              </GrCheckbox>
              <GrCheckbox v-model="statuses.overdue">
                Просрочен
              </GrCheckbox>
            </div>
          </GrCollapseItem>
          <GrCollapseItem name="period" title="Период">
            <p :class="mutedClass">
              Октябрь 2026
            </p>
          </GrCollapseItem>
          <GrCollapseItem name="manager" title="Ответственный">
            <p :class="mutedClass">
              Все сотрудники
            </p>
          </GrCollapseItem>
        </GrCollapse>
      </GrCard>
    </Specimen>

    <Specimen title="Перехват свёртки" note="beforeChange отменяет переключение: пока в секции несохранённая правка, она не сворачивается.">
      <div class="flex flex-col gap-3">
        <GrCollapse v-model="openDraft" :before-change="keepDirtyOpen" :heading-level="5">
          <GrCollapseItem name="draft" title="Комментарий к счёту">
            <div class="flex flex-col gap-3">
              <p :class="textClass">
                «Просим выставить счёт на юрлицо, реквизиты во вложении».
              </p>
              <GrSwitch v-model="dirty">
                Есть несохранённая правка
              </GrSwitch>
            </div>
          </GrCollapseItem>
        </GrCollapse>
        <p :class="mutedClass" aria-live="polite">
          {{ refused ? 'Свернуть не дали: сначала сохраните или отмените правку.' : 'Снимите переключатель — и секция свернётся.' }}
        </p>
      </div>
    </Specimen>

    <Specimen title="Пусто" note="Ни одной секции — аккордеон сам говорит об этом вместо пустой рамки.">
      <GrCollapse empty-text="Под фильтр «архив» не подошёл ни один раздел" :heading-level="5" />
    </Specimen>
  </div>
</template>
