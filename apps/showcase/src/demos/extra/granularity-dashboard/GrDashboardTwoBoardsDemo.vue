<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GrDashboardDropEvent, GrDashboardResponsiveLayout, GrDashboardTransfer } from '@feugene/granularity-dashboard'
import { addItem } from '@feugene/granularity-dashboard/layout'

/**
 * Обмен виджетами между двумя дашбордами.
 *
 * Правый намеренно `:transferable="false"` — принимает, но своих не отдаёт: на
 * нём видно, что принимать и отдавать это разные разрешения, а не одно.
 */
const mode = ref<'view' | 'edit'>('edit')

const active = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'revenue', x: 0, y: 0, w: 6, h: 2 },
    { id: 'conversion', x: 0, y: 2, w: 6, h: 2 },
  ],
})

const archive = ref<GrDashboardResponsiveLayout>({
  lg: [{ id: 'sources', x: 0, y: 0, w: 6, h: 2 }],
})

const TITLES: Record<string, string> = {
  revenue: 'Выручка',
  conversion: 'Конверсия',
  sources: 'Источники',
}

const breakpoints = { lg: 300, md: 240, sm: 180, xs: 0 }
const cols = { lg: 6, md: 6, sm: 4, xs: 2 }

const log = ref<string[]>([])

/** Кладёт приложение — сетка только сказала, что и куда бросили. */
function onDrop(target: 'active' | 'archive', event: GrDashboardDropEvent): void {
  const board = target === 'active' ? active : archive
  const current = board.value[event.breakpoint] ?? board.value.lg ?? []

  board.value = {
    ...board.value,
    [event.breakpoint]: addItem(
      current,
      { id: event.transfer.id, x: 0, y: 0, w: event.transfer.size.w, h: event.transfer.size.h },
      event.options,
      event.cell,
    ),
  }

  log.value = [`«${TITLES[event.transfer.id] ?? event.transfer.id}» приехал`, ...log.value].slice(0, 3)
}

function onTransferOut(id: string, payload: GrDashboardTransfer): void {
  log.value = [`«${TITLES[id] ?? id}» уехал из ${payload.from ? 'дашборда' : 'каталога'}`, ...log.value].slice(0, 3)
}

const activeIds = computed(() => (active.value.lg ?? []).map(item => item.id))
const archiveIds = computed(() => (archive.value.lg ?? []).map(item => item.id))
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardToolbar v-model:mode="mode" />

    <div class="grid gap-4 md:grid-cols-2">
      <section class="flex flex-col gap-2">
        <h4 class="text-[length:var(--gr-control-text-sm)] font-600">Рабочий</h4>

        <GrDashboard
          v-model:layout="active"
          :mode="mode"
          :breakpoints="breakpoints"
          :cols="cols"
          :row-height="64"
          aria-label="Рабочий дашборд"
          class="min-h-40 rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-2"
          @item-drop="onDrop('active', $event)"
          @item-transfer-out="onTransferOut"
        >
          <GrDashboardItem v-for="id in activeIds" :key="id" :item-id="id" :title="TITLES[id]">
            <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">Данные за квартал</p>
          </GrDashboardItem>
        </GrDashboard>
      </section>

      <section class="flex flex-col gap-2">
        <h4 class="text-[length:var(--gr-control-text-sm)] font-600">Архив — принимает, но не отдаёт</h4>

        <GrDashboard
          v-model:layout="archive"
          :mode="mode"
          :breakpoints="breakpoints"
          :cols="cols"
          :row-height="64"
          :transferable="false"
          aria-label="Архивный дашборд"
          class="min-h-40 rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-2"
          @item-drop="onDrop('archive', $event)"
        >
          <GrDashboardItem v-for="id in archiveIds" :key="id" :item-id="id" :title="TITLES[id]">
            <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">Отложено</p>
          </GrDashboardItem>
        </GrDashboard>
      </section>
    </div>

    <p v-if="log.length > 0" class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ log.join(' · ') }}
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Включите редактирование и утащите виджет за ручку из рабочего дашборда в архивный. Жест
      начинается как обычный перенос и <strong>перерастает</strong> в межсеточный, когда указатель
      уходит за край своей сетки в чужую: просто выход за край переносом не считается, иначе на
      длинной странице виджет отрывался бы от любой прокрутки. Отпустите между дашбордами или
      нажмите <kbd>Esc</kbd> — виджет вернётся на место.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Из архивного виджет не забрать: у него <code>:transferable="false"</code>. Принимать и отдавать —
      разные разрешения, и архив тем и архив, что складывать в него можно, а разбирать нельзя.
      Виджет из исходной раскладки убирает <strong>сама сетка</strong> и сообщает об этом
      <code>itemTransferOut</code>; кладёт по-прежнему приложение, по <code>itemDrop</code>. Удаление
      однозначно — разметки для него не нужно, в отличие от вставки, — и происходит только после
      успешного приземления.
    </p>
  </div>
</template>
