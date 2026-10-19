<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const items = [
    { name: 'Выручка, Q3', status: 'черновик', updated: 'сегодня, 14:20', kind: 'draft' },
    { name: 'Удержание клиентов', status: 'опубликован', updated: 'вчера', kind: 'live', hover: true },
    { name: 'Воронка продаж', status: 'опубликован', updated: '12 окт', kind: 'live' },
    { name: 'Расходы на рекламу', status: 'на проверке', updated: '9 окт', kind: 'review' },
    { name: 'Когорты, сентябрь', status: 'в архиве', updated: '30 сен', kind: 'archived' },
  ]
  return {
    rows: items.map(it => ({
      name: it.name,
      status: it.status,
      updated: it.updated,
      kind: it.kind,
      cls: it.hover ? 'trow is-hover' : 'trow',
      editLabel: `Изменить «${it.name}»`,
      copyLabel: `Дублировать «${it.name}»`,
      moreLabel: `Ещё действия с «${it.name}»`,
    })),
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1400px; padding: 56px 64px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">06 · В продукте</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Один экран — все веса на своих местах</h2>
<p class="lead">Главное действие выпуклое и одно, второстепенные — пластины и контуры, служебные прячутся до наведения. Глаз находит «Новый отчёт» раньше, чем дочитывает заголовок.</p>
</header>

<div style="display: flex; border: 1px solid var(--brd); border-radius: 16px; overflow: hidden; background: var(--card); box-shadow: 0 1px 2px rgba(15, 23, 42, .06), 0 24px 48px -24px rgba(15, 23, 42, .18); min-height: 700px">

<nav aria-label="Разделы" style="width: 220px; flex: none; padding: 20px 12px; border-right: 1px solid var(--brd); background: #fbfcfd; display: flex; flex-direction: column; gap: 4px">
<div style="display: flex; align-items: center; gap: 10px; padding: 4px 12px 16px"><span style="width: 24px; height: 24px; border-radius: 7px; background: #4f46e5"></span><span class="h3">[ПРОДУКТ]</span></div>
<a class="nav-a" href="#"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>Обзор</a>
<a class="nav-a on" href="#" aria-current="page"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path></svg>Отчёты</a>
<a class="nav-a" href="#"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>Метрики</a>
<a class="nav-a" href="#"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Команда</a>
<div style="flex: 1"></div>
<button class="gb s-sm v-ghost t-neutral pre block" type="button" style="justify-content: flex-start"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"></path></svg><span class="lbl">Настройки</span></button>
</nav>

<main style="flex: 1; min-width: 0; padding: 28px 32px; display: flex; flex-direction: column; gap: 20px">

<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap">
<div style="display: flex; flex-direction: column; gap: 4px">
<h3 style="margin: 0; font-size: 24px; line-height: 32px; font-weight: 650; letter-spacing: -.02em">Отчёты</h3>
<span class="cap">24 отчёта · обновлено сегодня в 14:20</span>
</div>
<div style="display: flex; align-items: center; gap: 8px">
<button class="gb s-md v-ghost t-neutral pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg><span class="lbl">Импорт</span></button>
<button class="gb s-md v-secondary t-neutral suf" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Экспорт</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-md v-primary t-primary pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
</div>
</div>

<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
<label style="flex: 1; min-width: 220px; height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--brd-2); border-radius: 8px; color: var(--muted-fg)"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><input type="search" placeholder="Найти отчёт" aria-label="Найти отчёт" style="flex: 1; border: 0; outline: none; background: transparent; font: 400 14px/20px Inter, system-ui, sans-serif; color: var(--fg)"></label>
<button class="gb s-sm v-outline t-neutral suf" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Статус: все</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-sm v-outline t-primary suf" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Автор: я</span><span class="cnt">1</span></button>
<button class="gb s-sm v-ghost t-primary" type="button">Сбросить</button>
</div>

<div style="border: 1px solid var(--brd); border-radius: 12px; overflow: hidden">
<div style="display: grid; grid-template-columns: minmax(0, 1fr) 150px 150px 112px; align-items: center; height: 40px; padding: 0 12px 0 16px; background: var(--bg)">
<span class="colh">название</span><span class="colh">статус</span><span class="colh">обновлён</span><span></span>
</div>
<template v-for="(r, rIndex) in vals.rows" :key="rIndex">
<div :class="r.cls" style="display: grid; grid-template-columns: minmax(0, 1fr) 150px 150px 112px; align-items: center; height: 52px; padding: 0 12px 0 16px; border-top: 1px solid var(--brd)">
<span style="font-weight: 500; color: var(--fg)">{{ r.name }}</span>
<span><span class="chip" :class="r.kind">{{ r.status }}</span></span>
<span class="cap">{{ r.updated }}</span>
<div class="row-actions">
<button class="gb s-sm sq v-ghost t-neutral" type="button" :aria-label="r.editLabel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" :aria-label="r.copyLabel"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" :aria-label="r.moreLabel" aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</template>
</div>

<div style="display: flex; align-items: center; justify-content: space-between">
<span class="cap">1–5 из 24</span>
<div class="grp" role="group" aria-label="Страницы">
<button class="gb s-sm sq v-outline t-neutral is-disabled" type="button" aria-label="Предыдущая страница" aria-disabled="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-sm sq v-secondary t-primary" type="button" aria-current="page">1</button>
<button class="gb s-sm sq v-outline t-neutral" type="button">2</button>
<button class="gb s-sm sq v-outline t-neutral" type="button">3</button>
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Следующая страница"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
</div>

</main>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px">
<div class="stage" style="min-height: 300px; padding: 28px; display: flex; align-items: center; justify-content: center; background-color: #e2e8f0">
<div role="dialog" aria-labelledby="dlg-t" style="width: 420px; padding: 24px; background: var(--card); border-radius: 16px; box-shadow: 0 0 0 1px rgba(15, 23, 42, .06), 0 24px 48px -12px rgba(15, 23, 42, .3); display: flex; flex-direction: column; gap: 8px">
<h4 id="dlg-t" class="h3" style="font-size: 17px">Удалить отчёт «Воронка продаж»?</h4>
<p class="body">Отчёт пропадёт у всех, у кого есть ссылка. Восстановить его не получится.</p>
<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px">
<button class="gb s-md v-secondary t-neutral is-focus" type="button">Оставить</button>
<button class="gb s-md v-primary t-danger" type="button">Удалить отчёт</button>
</div>
</div>
</div>
<div class="gr-dark stage" style="min-height: 300px; padding: 28px; display: flex; align-items: center; justify-content: center">
<div style="width: 420px; padding: 24px; background: var(--card); border-radius: 16px; border: 1px solid var(--brd); display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; flex-direction: column; gap: 4px">
<span class="eyebrow">Тариф «Команда»</span>
<span style="font-size: 28px; line-height: 36px; font-weight: 650; letter-spacing: -.02em">[ЦЕНА] / мес</span>
<span class="body">До 20 человек, общие отчёты, история изменений.</span>
</div>
<button class="gb s-lg v-primary t-primary block suf" type="button"><span class="lbl">Перейти на тариф</span><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button>
<button class="gb s-md v-ghost t-neutral block" type="button">Сравнить тарифы</button>
</div>
</div>
</div>

</div>
</template>
