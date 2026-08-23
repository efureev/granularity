<script setup lang="ts">
/**
 * Тридцать сервисов на восемьдесят дней: доля неуспешных ответов.
 *
 * Матрица такого размера — то, ради чего теплокарта и существует. Тот же срез
 * тридцатью линиями превращается в клубок, из которого не читается ничего;
 * здесь сбой виден как **полоса**, и её направление сразу говорит, что
 * случилось: вертикальная — упала инфраструктура и задело всех, горизонтальная —
 * сломался один сервис и его чинили две недели.
 *
 * Данные детерминированные: тот же рисунок при каждой отрисовке, без часов и
 * без случайных чисел.
 */
const SERVICES = [
  'api-gateway',
  'auth',
  'billing',
  'cart',
  'catalog',
  'checkout',
  'cms',
  'delivery',
  'email',
  'events',
  'exports',
  'payments',
  'feed',
  'files',
  'geo',
  'identity',
  'images',
  'imports',
  'inventory',
  'invoices',
  'loyalty',
  'media',
  'notify',
  'orders',
  'pricing',
  'search',
  'sessions',
  'shipping',
  'support',
  'webhooks',
]

const DAYS = 80
const START = new Date(2026, 5, 1)
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** Детерминированный шум 0…1: то же значение при каждом вызове. */
function noise(service: number, day: number): number {
  const value = Math.sin(service * 12.9898 + day * 78.233) * 43758.5453

  return value - Math.floor(value)
}

const values = SERVICES.map((_, service) => {
  // Свой уровень шума у каждого сервиса: одни спокойны годами, другие сыплют
  // ошибками всегда. Без этого поле выходит однородным, а так у матрицы
  // появляется горизонтальная текстура — как у настоящей телеметрии.
  const level = 0.8 + noise(service, 7) * 1.3

  return Array.from({ length: DAYS }, (_, day) => {
    // Выходные тише буднего дня: отсюда недельный ритм, по которому глаз сам
    // находит вертикальные полосы, не считая дней.
    const weekend = day % 7 === 5 || day % 7 === 6 ? 0.5 : 1
    let rate = level * weekend * (0.65 + noise(service, day))

    if (day === 23 || day === 24)
      rate += 1.6 + noise(service, 991) * 1.1
    if (service === 11 && day >= 40 && day <= 53)
      rate += 2.8
    if (service === 25)
      rate += (day / (DAYS - 1)) ** 1.6 * 2.4
    if (service === 7 && day === 62)
      rate += 3

    return Number(rate.toFixed(2))
  })
})

function dayLabel(day: number): string {
  const date = new Date(START.getFullYear(), START.getMonth(), START.getDate() + day)

  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

// Подпись на каждый десятый день: восемьдесят подписей подряд слиплись бы в
// серую полосу. Пустая строка — это отсутствие подписи, а не пустая подпись.
const xLabels = Array.from({ length: DAYS }, (_, day) => (day % 10 === 0 ? dayLabel(day) : ''))
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Доля неуспешных ответов, % · {{ SERVICES.length }} сервисов × {{ DAYS }} дней
    </span>

    <GrChartHeatmap
      :values="values"
      :x-labels="xLabels"
      :y-labels="SERVICES"
      :domain="[0, 5]"
      :cell-gap="1"
      :height="520"
      show-legend
      aria-label="Доля неуспешных ответов по сервисам за восемьдесят дней"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Две тысячи четыреста ячеек читаются как одна картина: <strong>вертикальная полоса</strong> в
      конце июня — сбой инфраструктуры, задело все сервисы разом; <strong>горизонтальная</strong> у
      <code>payments</code> — две недели деградации, пока чинили; <code>search</code> уходит в
      красное <strong>плавно</strong>, и это не инцидент, а регрессия, которую замечают поздно.
      Недельный ритм даёт текстуру: по выходным нагрузки меньше.
    </p>

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Числа в ячейках гаснут сами: при <code>showValues: 'auto'</code> они появляются, только когда
      ячейка достаточно широка, — иначе подпись была бы нечитаемой и мешала бы цвету. Подписи дней
      прорежены до каждого десятого, а скрытая таблица данных здесь полная: строк в ней тридцать по
      числу сервисов, и потолок (<code>dataTableMaxRows</code>) до неё не дотягивается.
    </p>
  </div>
</template>
