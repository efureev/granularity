<script setup lang="ts">
import {
  GrButton,
  useTheme,
} from '@feugene/granularity'

import IconMoon from '~icons/lucide/moon'
import IconSun from '~icons/lucide/sun'

const props = withDefaults(
  defineProps<{
    storageKey?: string
  }>(),
  {
    storageKey: undefined,
  },
)

const { isDark, toggleTheme } = useTheme({ storageKey: props.storageKey })
</script>

<template>
  <GrButton
    variant="ghost"
    size="sm"
    square
    :aria-label="$t('showcase.theme.toggle')"
    @click="toggleTheme"
  >
    <IconMoon v-if="isDark" class="h-4 w-4" aria-hidden="true" />
    <IconSun v-else class="h-4 w-4" aria-hidden="true" />
  </GrButton>
</template>