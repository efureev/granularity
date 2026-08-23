<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrCommandPalette, GrKbd, type GrCommandItem } from '@feugene/granularity'

import { useShowcaseSearch } from '../../app/useShowcaseSearch'

/**
 * Общий поиск витрины. Смонтирован ровно один раз — палитра держит глобальный
 * `mod+k`, и второй экземпляр гасил бы открытие вторым слушателем.
 */
const route = useRoute()
const router = useRouter()
const { t } = useFintI18n()
const { isOpen, query, toItems, hrefOf, close } = useShowcaseSearch()

// У сущностей вид пишет сам индекс (`component`, `directive`, …) — он и полезен
// заголовком группы; у страниц и разделов вид один на всех.
const items = computed(() => toItems((kind, entry) => t(
  `showcase.search.kinds.${kind === 'entity' ? entry.kindLabel : kind}`,
)))

watch(() => route.fullPath, close)

function onSelect(item: GrCommandItem): void {
  const href = hrefOf(item.id)
  close()

  if (href)
    void router.push(href)
}
</script>

<template>
  <GrCommandPalette
    v-model="isOpen"
    :items="items"
    :filterable="false"
    :placeholder="$t('showcase.search.placeholder')"
    :aria-label="$t('showcase.header.searchLabel')"
    @search="query = $event"
    @select="onSelect"
  >
    <template #empty>
      <div class="space-y-3">
        <p class="text-sm leading-6">
          {{ $t('showcase.search.noResults') }}
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <RouterLink
            to="/components"
            class="showcase-link-chip inline-flex rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
            @click="close()"
          >
            {{ $t('showcase.search.openComponents') }}
          </RouterLink>
          <RouterLink
            to="/utilities"
            class="showcase-link-chip inline-flex rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
            @click="close()"
          >
            {{ $t('showcase.search.openUtilities') }}
          </RouterLink>
        </div>
      </div>
    </template>

    <!--
      Подсказки, а не описание поиска: что искать, уже сказано плейсхолдером в
      поле, а вот клавиши узнать больше неоткуда — палитра модальна, и мышью в
      ней делают ровно один клик.
    -->
    <template #footer>
      <p class="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span class="inline-flex items-center gap-1.5">
          <GrKbd size="sm">↑</GrKbd>
          <GrKbd size="sm">↓</GrKbd>
          {{ $t('showcase.search.hints.navigate') }}
        </span>

        <span class="inline-flex items-center gap-1.5">
          <GrKbd size="sm">↵</GrKbd>
          {{ $t('showcase.search.hints.select') }}
        </span>

        <span class="inline-flex items-center gap-1.5">
          <GrKbd size="sm">Esc</GrKbd>
          {{ $t('showcase.search.hints.close') }}
        </span>
      </p>
    </template>
  </GrCommandPalette>
</template>
