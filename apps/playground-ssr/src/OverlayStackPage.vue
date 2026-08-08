<script setup lang="ts">
import { ref } from 'vue'

import { GrDrawer, GrModal, useTheme } from '@feugene/granularity'

/**
 * Страница-улика для стека слоёв и темы на сервере.
 *
 * Оба оверлея открыты **намеренно**: у закрытых слой не заводится вовсе, и
 * проверять было бы нечего. Открытых именно два — с одним `inert` не появляется
 * даже при регистрации на сервере, потому что единственный слой всегда верхний.
 *
 * Тема читается, но не переключается: чтение на сервере разрешено без плагина,
 * а `setTheme` без него бросает — это проверяет тест, а не страница.
 */
const modalOpen = ref(true)
const drawerOpen = ref(true)

const { isDark } = useTheme()
</script>

<template>
  <main>
    <p data-testid="theme-readout">
      Тема тёмная: {{ isDark ? 'да' : 'нет' }}
    </p>

    <GrModal v-model="modalOpen" aria-label="Нижний слой">
      <p>Нижний слой стека</p>
    </GrModal>

    <GrDrawer v-model="drawerOpen" title="Верхний слой">
      <p>Верхний слой стека</p>
    </GrDrawer>
  </main>
</template>
