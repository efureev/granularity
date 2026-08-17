<script setup lang="ts">
import { GrDelta } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-2 text-sm">
    <p>
      Balance change: <GrDelta :value="1284.5" :precision="2" prefix="$" />
    </p>
    <p>
      Margin: <GrDelta :value="-12.5" :precision="2" prefix="$" />
    </p>
    <!-- Ноль нейтрален: «не изменилось» — третье состояние, и двумя цветами
         его не выразить. -->
    <p>
      Unchanged: <GrDelta :value="0" :precision="2" prefix="$" />
    </p>
    <!-- `null` — величины нет вовсе. Это не ноль, поэтому ни тона, ни приписок. -->
    <p>
      Not measured: <GrDelta :value="null" prefix="$" />
    </p>
  </div>
</template>
