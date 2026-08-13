<script setup lang="ts">
// Сценарий, ради которого спарклайн и существует: он ничего не замеряет и не
// держит слушателей, поэтому сотня штук в ячейках таблицы ничего не стоит.
const rows = [
  { name: 'API', trend: [42, 44, 41, 47, 52, 58, 61] },
  { name: 'Queue', trend: [18, 17, 19, 16, 15, 14, 12] },
  { name: 'Cache', trend: [90, 91, 89, 92, 91, 93, 94] },
  { name: 'Storage', trend: [55, 58, null, 61, 60, 64, 68] },
]
</script>

<template>
  <GrTable>
    <thead>
      <tr>
        <th scope="col">Service</th>
        <th scope="col">7 days</th>
        <th scope="col">Now</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.name">
        <th scope="row">{{ row.name }}</th>
        <td class="w-40">
          <GrSparkline :data="row.trend" />
        </td>
        <td>{{ row.trend.at(-1) }}</td>
      </tr>
    </tbody>
  </GrTable>
</template>
