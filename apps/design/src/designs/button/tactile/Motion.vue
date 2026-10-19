<script setup>
import { computed, reactive } from 'vue'

const state = reactive({})

function setState(patch) {
  Object.assign(state, patch)
}

const vals = computed(() => {
  const s = Object.assign({ saving: false, open: false }, state || {})
  const configs = [
    { v: 'primary', t: 'primary', verb: 'Сохранить' },
    { v: 'primary', t: 'neutral', verb: 'Продолжить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'secondary', t: 'primary', verb: 'Дублировать' },
    { v: 'outline', t: 'primary', verb: 'Экспорт' },
    { v: 'ghost', t: 'neutral', verb: 'Пропустить' },
    { v: 'primary', t: 'danger', verb: 'Удалить' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading ov', loading: true },
    { extra: ' is-disabled', ariaDisabled: 'true' },
    { extra: ' is-disabled is-focus', ariaDisabled: 'true' },
  ]
  return {
    rows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(st => ({
        cls: `gb s-md v-${c.v} t-${c.t}${st.extra}`,
        verb: c.verb,
        loading: Boolean(st.loading),
        plain: !st.loading,
        ariaDisabled: st.ariaDisabled,
      })),
    })),
    saveCls: `gb s-md v-primary t-primary${s.saving ? ' is-loading ov' : ''}`,
    saving: s.saving,
    saveBusy: s.saving ? 'true' : undefined,
    onSave: () => {
      if (s.saving)
        return
      setState({ saving: true })
      setTimeout(setState, 2000, { saving: false })
    },
    open: s.open ? 'true' : 'false',
    onMenu: () => setState({ open: !s.open }),
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1900px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">03 · Состояния и движение</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Каждое состояние — своё движение</h2>
<p class="lead">Наведение приподнимает, нажатие вдавливает, фокус защёлкивается, загрузка течёт бликом. Недоступность — штриховка: её видно и без цвета.</p>
</header>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(7, minmax(0, 1fr)); align-items: end; padding: 16px 24px; background: var(--bg)">
<span class="colh">вес · тон</span>
<span class="colh" style="color: var(--fg)">покой</span>
<span class="colh" style="color: var(--fg)">наведение</span>
<span class="colh" style="color: var(--fg)">нажатие</span>
<span class="colh" style="color: var(--fg)">фокус</span>
<span class="colh" style="color: var(--fg)">загрузка</span>
<span class="colh" style="color: var(--fg)">disabled</span>
<span class="colh" style="color: var(--fg)">aria-disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div style="display: grid; grid-template-columns: 160px repeat(7, minmax(0, 1fr)); align-items: center; min-height: 80px; padding: 0 24px; border-top: 1px solid var(--brd)">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div>
<template v-if="c.plain">
<button :class="c.cls" type="button" :aria-disabled="c.ariaDisabled">{{ c.verb }}</button>
</template>
<template v-if="c.loading">
<button :class="c.cls" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">{{ c.verb }}</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button>
</template>
</div>
</template>
</div>
</template>
</div>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: end; padding: 14px 24px; background: var(--bg); gap: 16px">
<span class="colh">событие</span><span class="colh">что движется</span><span class="colh">длит.</span><span class="colh">кривая</span><span class="colh">шкала, 1 с = 250 px</span>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Наведение</span><span class="body">подъём на 1 px, тень раскрывается</span><span class="mono">240 мс</span><span class="mono">spring .34 1.56 .64 1</span><div class="bar" style="width: 60px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Подложка ghost</span><span class="body">scale .88 → 1, прозрачность 0 → 1</span><span class="mono">280 мс</span><span class="mono">spring</span><div class="bar" style="width: 70px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Нажатие</span><span class="body">scale .98, тень уходит внутрь</span><span class="mono">80 мс</span><span class="mono">ease .2 .8 .2 1</span><div class="bar" style="width: 20px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Отпускание</span><span class="body">возврат с лёгким перелётом</span><span class="mono">240 мс</span><span class="mono">spring</span><div class="bar" style="width: 60px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Фокус</span><span class="body">кольцо: отступ 6 → 2 px</span><span class="mono">220 мс</span><span class="mono">spring</span><div class="bar" style="width: 55px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Иконки</span><span class="body">стрелка +3 px, плюс 90°, шеврон 180°</span><span class="mono">260 мс</span><span class="mono">spring</span><div class="bar" style="width: 65px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">Загрузка</span><span class="body">блик пробегает по кнопке, спиннер — 750 мс на оборот</span><span class="mono">1600 мс</span><span class="mono">linear, по кругу</span><div class="bar" style="width: 400px"></div>
</div>
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) 90px 200px 420px; align-items: center; padding: 12px 24px; gap: 16px; border-top: 1px solid var(--brd)">
<span class="h3">reduced-motion</span><span class="body">сдвигов и блика нет, остаётся смена цвета; спиннер замедлен до 2.2 с</span><span class="mono">0 мс</span><span class="mono">—</span><span class="cap">движение не обязательно для смысла</span>
</div>
</div>

<div class="stage" style="padding: 28px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap">
<span class="h3" style="margin-right: 8px">Живьём</span>
<button :class="vals.saveCls" type="button" :aria-busy="vals.saveBusy" :aria-disabled="vals.saveBusy" @click="vals.onSave"><span class="lbl">Сохранить</span><template v-if="vals.saving"><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></template></button>
<button class="gb s-md v-secondary t-neutral suf" type="button" aria-haspopup="menu" :aria-expanded="vals.open" @click="vals.onMenu"><span class="lbl">Экспорт</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
<button class="gb s-md v-outline t-primary suf" type="button"><span class="lbl">Подробнее</span><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button>
<button class="gb s-md v-ghost t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span></button>
<button class="gb s-md v-primary t-danger" type="button">Удалить</button>
<span class="cap">«Сохранить» — 2 с загрузки, «Экспорт» — шеврон поворачивается</span>
</div>

</div>
</template>
