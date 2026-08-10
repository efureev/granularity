<script setup lang="ts">
import { GrButton } from '@feugene/granularity'

import { useShowcaseSearch } from '../../app/useShowcaseSearch'
import SearchIcon from '~icons/lucide/search'

/**
 * Только триггер: сама палитра смонтирована один раз в `ShowcaseLayout`.
 * Кнопок две (шапка и мобильный drawer), и вторая палитра означала бы второй
 * слушатель `mod+k`.
 *
 * Подсказку «⌘K» рядом с кнопкой не рисуем: шапка `sticky` и попадает в каждый
 * визуальный эталон, а сама палитра показывает сочетание в поле поиска.
 */
const { toggle } = useShowcaseSearch()
</script>

<template>
  <div class="inline-flex">
    <GrButton
      variant="ghost"
      size="sm"
      square
      :aria-label="$t('showcase.search.open')"
      @click="toggle()"
    >
      <SearchIcon />
    </GrButton>
  </div>
</template>
