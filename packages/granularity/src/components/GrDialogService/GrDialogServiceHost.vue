<script setup lang="ts">
/**
 * GrDialogServiceHost — внутренний компонент-оркестратор императивного
 * `useDialogService`. Не предназначен для прямого использования в шаблонах.
 *
 * Держит раскладку очереди и ничего больше: состояние каждой заявки — загрузка,
 * ошибки, введённое значение, мост конфига и i18n — живёт в
 * `GrDialogServiceItem`, потому что окон может быть несколько.
 *
 * Видимы голова очереди и её вложенные окна (`store.visibleDialogRequests`):
 * обычные вызовы по-прежнему показываются по одному, а диалог, открытый из
 * `onConfirm` другого диалога, ложится поверх родителя — иначе он ждал бы в
 * очереди того, кто ждёт его.
 */
import { computed, inject, provide } from 'vue'

import GrDialogServiceItem from './GrDialogServiceItem.vue'
import { visibleDialogRequests } from './store'
import type { DialogRequest, DialogServiceState } from './store'
import { GRANULARITY_DIALOG_SERVICE_STATE } from './useDialogService'

const props = defineProps<{
  /**
   * Состояние инстанса сервиса. Приходит пропом при программном монтировании:
   * хост живёт вне дерева и своим `inject` до app-scoped состояния не дотянулся
   * бы. `inject` остаётся для случая, когда хост поставили в шаблон руками.
   */
  state?: DialogServiceState | null
}>()

const injected = inject(GRANULARITY_DIALOG_SERVICE_STATE, null)

const activeState = computed<DialogServiceState | null>(() => props.state ?? injected)

const visible = computed<DialogRequest[]>(() =>
  activeState.value ? visibleDialogRequests(activeState.value) : [],
)

// Окна берут состояние отсюда, а не пропом: они его мутируют (очередь, список
// заявок в полёте), а мутировать проп — значит писать в чужое владение.
provide(GRANULARITY_DIALOG_SERVICE_STATE, activeState.value!)
</script>

<template>
  <GrDialogServiceItem
    v-for="request in visible"
    :key="request.id"
    :request="request"
  />
</template>
