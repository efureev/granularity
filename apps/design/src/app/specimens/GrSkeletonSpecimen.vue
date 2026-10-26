<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const CONTACTS = [
  { name: 'Анна Смирнова', role: 'Дизайн' },
  { name: 'Иван Петров', role: 'Разработка' },
  { name: 'Мария Кузнецова', role: 'Маркетинг' },
]

/** Заготовка — состояние на время: «Обновить» показывает её две секунды. */
const reloading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function reload(): void {
  if (reloading.value)
    return
  reloading.value = true
  timer = setTimeout(() => {
    reloading.value = false
  }, 2000)
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3" aria-busy="true">
    <span class="sr-only">Загружаем карточку проекта</span>
    <div class="flex items-center gap-3">
      <GrSkeleton variant="circle" width="40px" />
      <div class="flex flex-1 flex-col gap-2">
        <GrSkeleton width="45%" height="14px" />
        <GrSkeleton width="30%" />
      </div>
    </div>
    <GrSkeleton :count="2" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Заготовка карточки" note="Повторяет будущую раскладку: аватар, заголовок, обложка, текст.">
      <div class="flex flex-col gap-3.5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4" aria-busy="true">
        <span class="sr-only">Загружаем карточку проекта</span>
        <div class="flex items-center gap-3">
          <GrSkeleton variant="circle" width="40px" />
          <div class="flex flex-1 flex-col gap-2">
            <GrSkeleton width="45%" height="14px" />
            <GrSkeleton width="30%" />
          </div>
        </div>
        <GrSkeleton variant="rect" height="120px" />
        <GrSkeleton :count="3" />
      </div>
    </Specimen>

    <Specimen title="Заготовка и данные" note="Заглушка того же размера, что строка: данные встают на её место, и список не прыгает.">
      <div
        class="flex flex-col rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]"
        :aria-busy="reloading ? 'true' : undefined"
      >
        <span class="sr-only" role="status">{{ reloading ? 'Обновляем список команды' : '' }}</span>
        <ul aria-label="Команда проекта">
          <li
            v-for="(contact, index) in CONTACTS"
            :key="contact.name"
            class="flex h-14 items-center gap-3 px-4"
            :class="index > 0 ? 'border-t border-[var(--gr-brd)]' : ''"
          >
            <template v-if="reloading">
              <GrSkeleton variant="circle" width="32px" />
              <div class="flex flex-1 flex-col gap-1.5">
                <GrSkeleton width="50%" height="14px" />
                <GrSkeleton width="30%" />
              </div>
            </template>
            <template v-else>
              <!-- Имя уже в строке рядом: без aria-hidden диктор прочёл бы его дважды. -->
              <GrAvatar size="sm" :name="contact.name" aria-hidden="true" />
              <div class="flex min-w-0 flex-1 flex-col">
                <span class="text-[length:var(--gr-text-sm)] font-500 leading-[var(--gr-leading-sm)]">{{ contact.name }}</span>
                <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ contact.role }}</span>
              </div>
            </template>
          </li>
        </ul>
      </div>
      <GrButton variant="secondary" tone="neutral" size="sm" class="self-start" :loading="reloading" loading-text="Обновляем список" @click="reload">
        Обновить список
      </GrButton>
    </Specimen>

    <Specimen title="Формы" note="variant задаёт форму, размеры — потребитель; rounded перекрывает радиус варианта.">
      <div class="flex flex-wrap items-end gap-6">
        <div class="flex flex-col items-center gap-1.5">
          <GrSkeleton width="80px" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">text</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrSkeleton variant="rect" width="80px" height="44px" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">rect</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrSkeleton variant="circle" width="44px" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">circle</code>
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <GrSkeleton variant="rect" width="80px" height="44px" rounded="var(--gr-radius-xl)" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">rounded</code>
        </div>
      </div>
    </Specimen>

    <Specimen title="Абзац" note="count повторяет строку; у text последняя короче, и блок читается абзацем, а не списком полос.">
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <GrSkeleton :count="3" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">count · 3</code>
        </div>
        <div class="flex flex-col gap-1.5">
          <GrSkeleton variant="circle" width="28px" :count="3" />
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">circle · count · 3</code>
        </div>
      </div>
    </Specimen>
  </div>
</template>
