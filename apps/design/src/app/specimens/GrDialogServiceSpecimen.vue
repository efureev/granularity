<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import { useDialogService } from '@feugene/granularity'
import IconCopy from '~icons/lucide/copy'
import IconLayers from '~icons/lucide/layers'
import IconListOrdered from '~icons/lucide/list-ordered'
import IconMailX from '~icons/lucide/mail-x'
import IconUnplug from '~icons/lucide/unplug'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const dialog = useDialogService()

// Окна сервиса живут вне дерева компонентов: уход со страницы без этого оставил бы их открытыми.
onBeforeUnmount(() => dialog.closeAll())

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
  })
}

const confirmResult = ref('')

async function revokeInvites(): Promise<void> {
  const confirmed = await dialog.confirm(
    'Ссылки из трёх писем перестанут открываться. Коллеги смогут попросить новое приглашение.',
    {
      title: 'Отозвать приглашения?',
      size: 'sm',
      confirmText: 'Отозвать',
      confirmTone: 'danger',
      cancelText: 'Отмена',
    },
  )
  confirmResult.value = confirmed ? 'Приглашения отозваны' : 'Отменено — приглашения действуют'
}

const promptResult = ref('')

async function duplicateProject(): Promise<void> {
  const name = await dialog.prompt('Копия получит те же документы и доступы.', {
    title: 'Дублировать проект',
    label: 'Название копии',
    value: 'Запуск весной — копия',
    required: true,
    maxlength: 60,
    showCount: true,
    confirmText: 'Создать копию',
    cancelText: 'Отмена',
  })
  promptResult.value = name === null ? 'Копию не создали' : `Создана копия «${name}»`
}

const asyncResult = ref('')

async function disconnectTracker(): Promise<void> {
  let attempts = 0
  const confirmed = await dialog.confirm('Задачи перестанут приходить из трекера. Подключить его снова можно в настройках.', {
    title: 'Отключить трекер?',
    size: 'sm',
    confirmText: 'Отключить',
    confirmTone: 'danger',
    cancelText: 'Отмена',
    async onConfirm(ctx) {
      await wait(700, ctx.signal)
      attempts += 1
      if (attempts === 1) {
        ctx.setError('Трекер не ответил вовремя. Повторите — второй запрос пройдёт.')
        return false
      }
      return true
    },
  })
  asyncResult.value = confirmed ? 'Трекер отключён' : 'Трекер подключён'
}

const nestedResult = ref('')

async function deleteWorkspace(): Promise<void> {
  const confirmed = await dialog.confirm('Удалятся все проекты, документы и доступы пространства «Маркетинг».', {
    title: 'Удалить пространство?',
    size: 'sm',
    confirmText: 'Удалить',
    confirmTone: 'danger',
    cancelText: 'Отмена',
    async onConfirm() {
      return await dialog.confirm('Восстановить будет нечем — даже из резервной копии.', {
        title: 'Точно удалить?',
        size: 'sm',
        confirmText: 'Да, удалить',
        confirmTone: 'danger',
        cancelText: 'Нет',
      })
    },
  })
  nestedResult.value = confirmed ? 'Пространство удалено' : 'Пространство на месте'
}

const IMPORT_STEPS = ['Начали импорт трёх файлов.', 'Файл «Клиенты.csv» загружен.', 'Готово: 1 240 контактов в базе.']
const queueResult = ref('')

async function runImport(): Promise<void> {
  queueResult.value = 'Окна в очереди'
  await Promise.all(IMPORT_STEPS.map((message, index) => dialog.alert(message, {
    title: `Шаг ${index + 1} из ${IMPORT_STEPS.length}`,
    size: 'sm',
    confirmText: index + 1 < IMPORT_STEPS.length ? 'Дальше' : 'Понятно',
  })))
  queueResult.value = 'Все три окна прочитаны'
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div>
      <GrButton variant="secondary" tone="neutral" @click="revokeInvites">
        <template #prefix>
          <IconMailX />
        </template>
        Отозвать приглашения…
      </GrButton>
    </div>
    <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
      {{ confirmResult || 'Окно — вызовом из кода, ответ — промисом' }}
    </p>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <!--
      Без `granularityDialogServicePlugin` хост в шаблоне пуст: окна сервис монтирует
      в портал сам. С плагином каждое окно нарисовалось бы дважды — здесь и в портале.
    -->
    <GrDialogServiceHost />

    <Specimen title="Да или нет из кода" note="confirm без разметки в шаблоне: промис отвечает true или false и никогда не падает — отмена штатный исход.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="revokeInvites">
          <template #prefix>
            <IconMailX />
          </template>
          Отозвать приглашения
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ confirmResult || 'Ответ придёт сюда, когда окно закроется' }}
      </p>
    </Specimen>

    <Specimen title="Значение из кода" note="prompt отвечает строкой или null; поле, проверка и счётчик — те же, что у окна в шаблоне.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="duplicateProject">
          <template #prefix>
            <IconCopy />
          </template>
          Дублировать проект
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ promptResult || 'Название копии придёт сюда' }}
      </p>
    </Specimen>

    <Specimen title="Запрос и ошибка" note="onConfirm держит окно с загрузкой, Esc и подложка на это время выключены; ошибка остаётся в окне до повтора.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="disconnectTracker">
          <template #prefix>
            <IconUnplug />
          </template>
          Отключить трекер
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ asyncResult || 'Первый запрос не пройдёт — повторите' }}
      </p>
    </Specimen>

    <Specimen title="Окно поверх окна" note="Вызов из onConfirm ложится поверх, а не в очередь: иначе внешнее окно ждало бы того, кто ждёт его.">
      <div>
        <GrButton variant="outline" tone="danger" @click="deleteWorkspace">
          <template #prefix>
            <IconLayers />
          </template>
          Удалить пространство
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ nestedResult || 'Спросим дважды' }}
      </p>
    </Specimen>

    <Specimen title="Очередь" note="Три alert подряд не ложатся стопкой: следующее окно — после закрытия предыдущего.">
      <div>
        <GrButton variant="secondary" tone="neutral" @click="runImport">
          <template #prefix>
            <IconListOrdered />
          </template>
          Импорт с отчётом
        </GrButton>
      </div>
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ queueResult || 'Три сообщения по очереди' }}
      </p>
    </Specimen>
  </div>
</template>
