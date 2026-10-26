<script setup lang="ts">
import { onUnmounted } from 'vue'

import { useToast } from '@feugene/granularity'
import type { ToastInput } from '@feugene/granularity'

import Specimen from './Specimen.vue'

const props = defineProps<{ preview?: boolean }>()

const { push, promise, clear } = useToast()

const timers = new Set<ReturnType<typeof setTimeout>>()

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      resolve()
    }, ms)
    timers.add(timer)
  })
}

// Очередь тостов — модульная, одна на приложение: без уборки ошибка без автозакрытия
// дожила бы до следующего захода на страницу.
onUnmounted(() => {
  timers.forEach(clearTimeout)
  if (!props.preview)
    clear()
})

function toastSuccess(): void {
  push({
    title: 'Отчёт отправлен',
    message: 'Получатели увидят его в течение минуты',
    tone: 'success',
    timeoutMs: 5000,
    action: {
      label: 'Отменить',
      variant: 'ghost',
      onClick: () => {
        push({ title: 'Отправка отменена', tone: 'neutral', timeoutMs: 5000 })
      },
    },
  })
}

function toastInfo(): void {
  push({
    title: 'Новая версия готова',
    message: 'Обновите страницу, когда будет удобно',
    tone: 'info',
    timeoutMs: 5000,
  })
}

function toastWarning(): void {
  push({
    title: 'Сессия скоро закончится',
    message: 'Через 5 минут понадобится войти снова',
    tone: 'warning',
    timeoutMs: 8000,
    action: {
      label: 'Продлить',
      onClick: () => {
        push({ title: 'Сессия продлена на час', tone: 'success', timeoutMs: 5000 })
      },
    },
  })
}

function toastError(): void {
  push({
    title: 'Не удалось сохранить',
    message: 'Нет связи с сервером — изменения остались у вас',
    tone: 'danger',
    timeoutMs: 0,
    action: {
      label: 'Повторить',
      onClick: () => {
        push({ title: 'Изменения сохранены', tone: 'success', timeoutMs: 5000 })
      },
    },
  })
}

function syncDone(): void {
  void promise(wait(2000).then(() => 14), {
    loading: { title: 'Синхронизируем', message: 'Отправляем изменения…' },
    success: files => ({ title: 'Готово', message: `Отправлено файлов: ${files}` }),
    error: 'Синхронизация не удалась',
  })
}

function syncFailed(): void {
  const upload = wait(2000).then(() => {
    throw new Error('Сервер не ответил за 30 секунд')
  })
  // Отказ промис возвращает как есть: тост его показывает, но не обрабатывает.
  promise(upload, {
    loading: { title: 'Выгружаем в облако', message: 'Архив за октябрь, 48 МБ' },
    success: 'Архив выгружен',
    error: reason => ({ title: 'Выгрузка не удалась', message: reason instanceof Error ? reason.message : String(reason) }),
  }).catch(() => undefined)
}

const BURST: ToastInput[] = [
  { title: 'Иван оставил комментарий', message: 'К макету «Главная, версия 3»', tone: 'info' },
  { title: 'Счёт № 1042 оплачен', tone: 'success' },
  { title: 'Мария добавила вас в проект', message: 'Редизайн личного кабинета', tone: 'info' },
  { title: 'Отчёт за октябрь готов', tone: 'success' },
  { title: 'Хранилище заполнено на 92 %', tone: 'warning' },
]

function toastBurst(): void {
  for (const toast of BURST)
    push({ ...toast, timeoutMs: 8000 })
}

let saves = 0

function toastSaved(): void {
  saves += 1
  push({
    title: 'Черновик сохранён',
    message: `Сохранений за сеанс: ${saves}`,
    tone: 'success',
    timeoutMs: 4000,
    dedupeKey: 'specimen:draft-saved',
  })
}
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrButton size="sm" class="self-start">
      Сохранить
    </GrButton>
    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      После действия в углу экрана — тост «Изменения сохранены»: уходит сам и не сдвигает страницу.
    </p>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Результат действия" note="Тост открывается только по действию и уходит сам. «Отменить» в тосте заменяет диалог подтверждения.">
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastSuccess">
          Отправить отчёт
        </GrButton>
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastInfo">
          Новая версия
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Предупреждение и ошибка" note="warning и danger объявляются сразу. Ошибка не уходит сама — ждёт, пока её закроют или повторят.">
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastWarning">
          Сессия кончается
        </GrButton>
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastError">
          Сохранить без сети
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Запрос одним тостом" note="promise: «загружаем» переписывается в результат, а не закрывается ради нового тоста.">
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" tone="neutral" @click="syncDone">
          Синхронизировать
        </GrButton>
        <GrButton size="sm" variant="outline" tone="neutral" @click="syncFailed">
          Выгрузить с отказом
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Стопка и пауза" note="С трёх видимых тостов стек складывается в стопку. Наведение и фокус разворачивают её и останавливают отсчёт; F6 — к тостам, Delete закрывает.">
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastBurst">
          Прислать пять
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Повтор по ключу" note="dedupeKey заменяет живой тост и перезапускает его отсчёт: сколько ни сохраняй, тост один.">
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="outline" tone="neutral" @click="toastSaved">
          Сохранить черновик
        </GrButton>
      </div>
    </Specimen>

    <GrToaster dismiss-label="Закрыть уведомление" />
  </div>
</template>
