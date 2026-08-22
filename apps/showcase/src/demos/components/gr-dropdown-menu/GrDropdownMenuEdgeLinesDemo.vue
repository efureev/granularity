<script setup lang="ts">
import {
  GrButton,
  GrDropdownMenu,
  GrDropdownMenuHeader,
  GrDropdownMenuItem,
  GrDropdownMenuList,
} from '@feugene/granularity'

const actions = ['Duplicate', 'Move to archive', 'Copy public URL']
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <!--
      Линии у самого края панели: список — единственный блок, и правило
      приходится на полосу скругления. Рисуется оно псевдоэлементом с инсетом,
      поэтому концы не задевают дугу угла.
    -->
    <GrDropdownMenu
      width="14rem"
      placement="bottom-start"
      border-top
      border-bottom
      data-testid="menu-edge-lines"
    >
      <template #trigger="{ open, triggerProps }">
        <GrButton v-bind="triggerProps" variant="outline">
          {{ open ? 'Скрыть' : 'Линии у края' }}
        </GrButton>
      </template>

      <GrDropdownMenuItem v-for="action in actions" :key="action">
        {{ action }}
      </GrDropdownMenuItem>
    </GrDropdownMenu>

    <!-- Тот же проп по прямому назначению: отбить список от шапки и подвала. -->
    <GrDropdownMenu width="14rem" placement="bottom-start" border-top :close-on-content-click="false">
      <template #trigger="{ open, triggerProps }">
        <GrButton v-bind="triggerProps" variant="outline">
          {{ open ? 'Скрыть' : 'Отбивка от шапки' }}
        </GrButton>
      </template>

      <GrDropdownMenuHeader title="Документ" />

      <GrDropdownMenuList border-top>
        <GrDropdownMenuItem v-for="action in actions" :key="action">
          {{ action }}
        </GrDropdownMenuItem>
      </GrDropdownMenuList>
    </GrDropdownMenu>
  </div>
</template>
