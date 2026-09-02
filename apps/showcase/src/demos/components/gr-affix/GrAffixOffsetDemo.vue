<script setup lang="ts">
import { GrAffix, GrChip } from '@feugene/granularity'

const rows = [
  { id: 'r1', name: 'Отчёт по продажам', owner: 'Марина К.', status: 'Готов' },
  { id: 'r2', name: 'Сверка с 1С', owner: 'Дмитрий О.', status: 'В работе' },
  { id: 'r3', name: 'План закупок', owner: 'Алина В.', status: 'Готов' },
  { id: 'r4', name: 'Аудит доступов', owner: 'Пётр С.', status: 'Черновик' },
  { id: 'r5', name: 'Бюджет отдела', owner: 'Марина К.', status: 'В работе' },
  { id: 'r6', name: 'Реестр договоров', owner: 'Ирина Л.', status: 'Готов' },
  { id: 'r7', name: 'Список подписок', owner: 'Дмитрий О.', status: 'Черновик' },
  { id: 'r8', name: 'Карта рисков', owner: 'Алина В.', status: 'В работе' },
]
</script>

<template>
  <!--
    Общий отступ группы задан токеном на контейнере, а не пропом у каждой панели:
    наблюдатель читает вычисленный стиль, поэтому каскад работает наравне с пропом.
    Верхняя панель переопределяет его нулём — она стоит первой.
  -->
  <div
    class="h-[320px] w-full overflow-y-auto rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)]"
    tabindex="0"
    role="group"
    aria-label="Документы отдела"
    style="--gr-affix-offset: 41px"
  >
    <GrAffix :offset="0">
      <div class="flex items-center gap-2 border-b border-[var(--gr-brd)] px-4 py-2">
        <span class="text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] font-600">Документы отдела</span>
        <GrChip size="xs">
          {{ rows.length }}
        </GrChip>
      </div>
    </GrAffix>

    <GrAffix>
      <div class="grid grid-cols-3 gap-2 border-b border-[var(--gr-brd)] px-4 py-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        <span>Документ</span>
        <span>Ответственный</span>
        <span>Статус</span>
      </div>
    </GrAffix>

    <div
      v-for="row in rows"
      :key="row.id"
      class="grid grid-cols-3 gap-2 border-b border-[var(--gr-brd)] px-4 py-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]"
    >
      <span>{{ row.name }}</span>
      <span class="text-[var(--gr-muted-fg)]">{{ row.owner }}</span>
      <span>{{ row.status }}</span>
    </div>
  </div>
</template>
