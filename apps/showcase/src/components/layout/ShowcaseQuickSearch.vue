<script setup lang="ts">
import { GrKbd } from '@feugene/granularity'

import { useShowcaseSearch } from '../../app/useShowcaseSearch'
import SearchIcon from '~icons/lucide/search'

/**
 * Только триггер: сама палитра смонтирована один раз в `ShowcaseLayout`.
 * Кнопок две (шапка и мобильный drawer), и вторая палитра означала бы второй
 * слушатель `mod+k`.
 *
 * Кнопка одна на оба размера экрана, а не две с переключением видимости: подпись
 * и сочетание прячутся сами, и на узком экране остаётся квадрат с лупой. Две
 * кнопки означали бы два узла с одним и тем же именем в дереве доступности.
 *
 * Размер держится под соседей по строке шапки: высота фиксирована (`h-8`), а
 * ширина — по содержимому. Шапка липкая и перекрывает верх каждой страницы,
 * поэтому лишние десять пикселей здесь стоят дороже, чем кажется; фиксированная
 * ширина пилюли к тому же заставляла соседнюю навигацию переноситься.
 */
const { toggle } = useShowcaseSearch()
</script>

<template>
  <button
    type="button"
    data-showcase-search-trigger
    class="showcase-pill inline-flex h-8 items-center gap-2 rounded-[var(--gr-radius-md)] border px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-tight)] transition-colors md:px-3"
    :aria-label="$t('showcase.search.open')"
    aria-haspopup="dialog"
    aria-keyshortcuts="Control+K Meta+K"
    @click="toggle()"
  >
    <SearchIcon class="h-4 w-4 shrink-0" aria-hidden="true" />

    <!-- Подпись видна с `md`: на узком экране её место занимает сама лупа. -->
    <span class="hidden md:inline">{{ $t('showcase.search.label') }}</span>

    <!--
      Сочетание декоративно: имя кнопке даёт `aria-label`, а диктору сочетание
      сообщает `aria-keyshortcuts` — читать «⌘ K» ещё и текстом незачем.
      Видимость держит обёртка: `hidden` на самом `GrKbd` спорил бы с его
      собственным `inline-flex`, и кто победит, решал бы порядок правил в CSS.
    -->
    <span class="ml-auto hidden md:inline-flex">
      <GrKbd keys="mod+K" size="sm" separator="" aria-hidden="true" />
    </span>
  </button>
</template>
