<script setup lang="ts">
import { GrList, GrListItem } from '@feugene/granularity'
</script>

<template>
  <GrList>
    <!--
      Обычная строка и строка с `as` неотличимы — в этом весь смысл: `as`
      меняет разметку, а не поведение. Ни подсветки под курсором, ни кольца
      фокуса неинтерактивный тег не получает и в `Tab` не попадает.
    -->
    <GrListItem title="Профиль" description="Корень строки — div" />

    <GrListItem as="article" title="Оплата" description="Корень строки — article" />

    <!-- Контролом строку делает поведение: href, clickable, компонент роутера. -->
    <GrListItem href="#gr-list-semantic-tag" title="Журнал доступа" description="А это ссылка — её берёт Tab" />
  </GrList>
</template>
