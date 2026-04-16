<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right'
  }>(),
  {
    align: 'center',
  },
)

const alignClass = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
}
</script>

<template>
  <div class="px-3 py-2 flex items-center" :class="alignClass[align]">
    <slot />
  </div>
</template>