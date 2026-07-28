<script setup lang="ts">
import { ref } from 'vue'

// Импорт по subpath — как у настоящего потребителя пакета: и рантайм, и типы
// приезжают из опубликованного `dist`, а не из исходников монорепо.
import { GrBadge } from '@feugene/granularity/components/GrBadge'
import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrConfigProvider, type GrComponentDefaults } from '@feugene/granularity/components/GrConfigProvider'
import { GrInput } from '@feugene/granularity/components/GrInput'

const name = ref('Игорь Петров')
const withDefaults = ref(true)

// Оформление поддерева одним объектом. Тип собран из аугментаций реестра,
// которые объявляют сами компоненты в своих папках.
const brandDefaults: GrComponentDefaults = {
  GrButton: { variant: 'outline', tone: 'azure' },
  GrInput: { clearable: true },
  GrBadge: { tone: 'azure', radius: 'semi' },
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
    <header class="grid gap-2">
      <p class="text-xs font-medium tracking-wide text-[var(--gr-muted-fg)]">
        playground / config defaults
      </p>
      <h1 class="text-2xl font-semibold text-[var(--gr-fg)]">
        componentDefaults через subpath-импорты
      </h1>
      <p class="text-sm leading-6 text-[var(--gr-muted-fg)]">
        Приложение подключает пакет так же, как внешний потребитель: через
        <code>@feugene/granularity/components/*</code>, без алиасов на исходники.
        Контракт <code>componentDefaults</code> собирается из аугментаций, которые
        компоненты объявляют в своих папках — проверяется командой
        <code>yarn typecheck</code>.
      </p>
    </header>

    <GrButton size="sm" variant="ghost" @click="withDefaults = !withDefaults">
      {{ withDefaults ? 'Выключить дефолты' : 'Включить дефолты' }}
    </GrButton>

    <GrConfigProvider :component-defaults="withDefaults ? brandDefaults : undefined">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="name" class="max-w-[16rem]" aria-label="Имя" />
        <GrButton>Пригласить</GrButton>
        <GrButton>Скопировать ссылку</GrButton>
        <GrBadge>Pro</GrBadge>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      У контролов внутри провайдера не задано ни одного из настраиваемых пропов.
      У кнопки-переключателя выше <code>variant="ghost"</code> задан явно — локальный
      проп всегда сильнее конфига, и она не меняется.
    </p>
  </main>
</template>
