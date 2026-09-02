<script setup lang="ts">
import { ref } from 'vue'

import { GrAffix, GrBadge, GrButton } from '@feugene/granularity'

const log = ref<string[]>([])

function onStickyChange(stuck: boolean): void {
  log.value = [stuck ? 'прилипла' : 'вернулась в поток', ...log.value].slice(0, 4)
}

const paragraphs = [
  'Регламент описывает порядок согласования закупок на сумму свыше пятисот тысяч рублей.',
  'Инициатор готовит заявку и прикладывает не менее трёх коммерческих предложений.',
  'Юрист проверяет контрагента по реестрам и фиксирует результат в карточке заявки.',
  'Финансовая служба сверяет сумму с лимитом статьи бюджета на текущий квартал.',
  'Руководитель направления подтверждает потребность и назначает ответственного.',
  'Согласованная заявка уходит в закупку; срок исполнения считается с этого момента.',
  'Изменение суммы после согласования требует повторного прохождения всей цепочки.',
  'Отказ на любом шаге возвращает заявку инициатору с обязательным комментарием.',
  'Закупки до пятисот тысяч согласовывает только руководитель направления.',
  'Спорные случаи выносятся на закупочную комиссию раз в две недели.',
]
</script>

<template>
  <div class="flex w-full flex-col gap-3">
    <div
      class="h-[280px] overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
      tabindex="0"
      role="group"
      aria-label="Текст регламента"
    >
      <div class="p-4">
        <!--
          Содержимое меняется от состояния: подзаголовок нужен, пока панель стоит
          на своём месте, и только мешает, когда она прижата к краю.
        -->
        <GrAffix @sticky-change="onStickyChange">
          <template #default="{ stuck }">
            <div class="flex items-center justify-between gap-3 py-2">
              <div class="min-w-0">
                <h3 class="truncate text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">
                  Регламент согласования закупок
                </h3>
                <p v-if="!stuck" class="truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                  Редакция от 12 марта, действует до конца года
                </p>
              </div>
              <GrButton :size="stuck ? 'xs' : 'sm'" variant="secondary">
                Скачать
              </GrButton>
            </div>
          </template>
        </GrAffix>

        <p
          v-for="(text, index) in paragraphs"
          :key="index"
          class="mt-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
        >
          {{ text }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">События:</span>
      <GrBadge v-for="(entry, index) in log" :key="index" size="sm" tone="slate">
        {{ entry }}
      </GrBadge>
      <span v-if="log.length === 0" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        прокрутите текст
      </span>
    </div>
  </div>
</template>
