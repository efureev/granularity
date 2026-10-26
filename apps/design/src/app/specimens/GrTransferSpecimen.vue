<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { GrTransferKey, GrTransferSide } from '@feugene/granularity/components/GrTransfer'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewColumns = [
  { id: 'no', label: 'Номер' },
  { id: 'client', label: 'Клиент' },
  { id: 'inn', label: 'ИНН' },
  { id: 'sum', label: 'Сумма' },
  { id: 'status', label: 'Статус' },
]
const previewSelection = ref<GrTransferKey[]>(['sum', 'status'])

const exportColumns = [
  { id: 'no', label: 'Номер счёта' },
  { id: 'client', label: 'Клиент' },
  { id: 'inn', label: 'ИНН клиента' },
  { id: 'status', label: 'Статус' },
  { id: 'sum', label: 'Сумма' },
  { id: 'vat', label: 'НДС' },
  { id: 'due', label: 'Срок оплаты' },
  { id: 'paidAt', label: 'Дата оплаты' },
  { id: 'manager', label: 'Ответственный' },
  { id: 'comment', label: 'Комментарий' },
  { id: 'archive', label: 'Архивный номер', disabled: true },
]
const exportSelection = ref<GrTransferKey[]>(['no', 'client', 'sum', 'status'])

const rights = [
  { id: 'invoices.read', label: 'Видеть счета' },
  { id: 'invoices.write', label: 'Выставлять счета' },
  { id: 'payments.read', label: 'Видеть платежи' },
  { id: 'payments.refund', label: 'Возвращать оплату' },
  { id: 'reports.export', label: 'Выгружать отчёты' },
]
const roleRights = ref<GrTransferKey[]>(['invoices.read', 'payments.read'])

const directory = [
  'Анна Соколова',
  'Илья Орлов',
  'Мария Белова',
  'Олег Смирнов',
  'Вера Кузнецова',
  'Павел Зайцев',
  'Ольга Морозова',
  'Денис Волков',
  'Елена Лебедева',
  'Сергей Козлов',
  'Нина Новикова',
  'Артём Попов',
].map(name => ({ id: name, label: name }))

const recipients = ref<GrTransferKey[]>(['Анна Соколова'])
const found = ref(directory)
const searching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

// Выбранные остаются в каталоге при любом запросе: ключ без элемента правая панель не рисует.
const recipientItems = computed(() => {
  const chosen = directory.filter(person => recipients.value.includes(person.id))
  return [...chosen, ...found.value.filter(person => !recipients.value.includes(person.id))]
})

function searchDirectory(query: string, side: GrTransferSide): void {
  if (side !== 'source')
    return
  clearTimeout(searchTimer)
  searching.value = true
  searchTimer = setTimeout(() => {
    const needle = query.trim().toLocaleLowerCase('ru-RU')
    found.value = directory.filter(person => person.label.toLocaleLowerCase('ru-RU').includes(needle))
    searching.value = false
  }, 700)
}

onBeforeUnmount(() => clearTimeout(searchTimer))

const permissions = Array.from({ length: 2000 }, (_, index) => ({
  id: `perm-${index + 1}`,
  label: `Право ${String(index + 1).padStart(4, '0')} · ${['чтение', 'правка', 'удаление', 'выгрузка'][index % 4]}`,
}))
const grantedPermissions = ref<GrTransferKey[]>(['perm-1', 'perm-2', 'perm-17'])

const states = [
  { id: 'readonly', label: 'Только чтение' },
  { id: 'disabled', label: 'Недоступно' },
  { id: 'invalid', label: 'Ошибка: нужен хотя бы один' },
] as const
const stateItems = rights.slice(0, 3)
const stateSelection = ref<Record<(typeof states)[number]['id'], GrTransferKey[]>>({
  readonly: ['invoices.read'],
  disabled: ['invoices.read'],
  invalid: [],
})

const mutedClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]'
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrTransfer
      v-model="previewSelection"
      :items="previewColumns"
      :searchable="false"
      :sortable="false"
      size="xs"
      aria-label="Колонки выгрузки"
    />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Колонки выгрузки" note="Слева — что можно взять, справа — что попадёт в файл и в каком порядке. Поиск в каждой панели, перенос кнопками, двойным щелчком и перетаскиванием." wide>
      <GrTransfer
        v-model="exportSelection"
        :items="exportColumns"
        source-title="Доступные колонки"
        target-title="В выгрузке"
        aria-label="Колонки выгрузки счетов"
        :max-height="264"
      />
    </Specimen>

    <Specimen title="Без поиска и порядка" note="Набор короткий и порядок не важен: searchable и sortable выключены.">
      <GrTransfer
        v-model="roleRights"
        :items="rights"
        :searchable="false"
        :sortable="false"
        source-title="Права"
        target-title="У роли «Бухгалтер»"
        size="sm"
        aria-label="Права роли «Бухгалтер»"
      />
    </Specimen>

    <Specimen title="Справочник с сервера" note="search отдаёт запрос, items подставляет потребитель; пока ответ в пути — loading, и пустая панель говорит «ищем».">
      <GrTransfer
        v-model="recipients"
        :items="recipientItems"
        :loading="searching"
        source-title="Сотрудники"
        target-title="Получатели"
        size="sm"
        :max-height="300"
        aria-label="Получатели рассылки"
        @search="searchDirectory"
      />
    </Specimen>

    <Specimen title="Две тысячи прав" note="virtual и max-height: в DOM только окно строк, перенос кнопками берёт и то, что за краем." wide>
      <GrTransfer
        v-model="grantedPermissions"
        :items="permissions"
        virtual
        :max-height="320"
        source-title="Все права"
        target-title="У роли"
        aria-label="Права роли «Администратор»"
      />
    </Specimen>

    <Specimen title="Состояния" note="readonly — видно, но не меняется; disabled — гаснет целиком; invalid — рамка ошибки на правой панели." wide>
      <div class="grid gap-6 xl:grid-cols-3">
        <div v-for="state in states" :key="state.id" class="flex min-w-0 flex-col gap-2">
          <span :class="mutedClass">{{ state.label }}</span>
          <GrTransfer
            v-model="stateSelection[state.id]"
            :items="stateItems"
            :searchable="false"
            :sortable="false"
            size="sm"
            :readonly="state.id === 'readonly'"
            :disabled="state.id === 'disabled'"
            :invalid="state.id === 'invalid'"
            :required="state.id === 'invalid'"
            :aria-label="`Права роли: ${state.label}`"
          />
        </div>
      </div>
    </Specimen>
  </div>
</template>
