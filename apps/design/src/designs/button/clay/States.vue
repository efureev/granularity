<script setup>
import { computed, reactive } from 'vue'

const state = reactive({})

function setState(patch) {
  Object.assign(state, patch)
}

const vals = computed(() => {
  const s = Object.assign({ saving: false }, state || {})
  const configs = [
    { v: 'primary', t: 'neutral', verb: 'Сохранить' },
    { v: 'primary', t: 'primary', verb: 'Отправить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'secondary', t: 'primary', verb: 'Черновик' },
    { v: 'outline', t: 'neutral', verb: 'Экспорт' },
    { v: 'ghost', t: 'neutral', verb: 'Пропустить' },
    { v: 'primary', t: 'danger', verb: 'Удалить' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading', busy: 'true' },
    { extra: ' is-disabled', ariaDisabled: 'true' },
    { extra: ' is-disabled is-focus', ariaDisabled: 'true' },
  ]
  return {
    rows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(st => ({
        cls: `gb s-md v-${c.v} t-${c.t}${st.extra}`,
        verb: c.verb,
        busy: st.busy,
        ariaDisabled: st.busy || st.ariaDisabled,
      })),
    })),
    saveCls: `gb s-md v-primary t-neutral${s.saving ? ' is-loading' : ''}`,
    saveLabel: 'Сохранить',
    saveBusy: s.saving ? 'true' : undefined,
    onSave: () => {
      if (s.saving)
        return
      setState({ saving: true })
      setTimeout(setState, 2000, { saving: false })
    },
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1700px; padding: 64px 72px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">Состояния</span>
<h2 class="title" style="font-size: 34px">Спокойно, без прыжков</h2>
<p class="lead">Кнопка не двигается и не светится. Наведение — оттенок бумаги или шаг заливки прочь от подписи, нажатие — шаг глубже, фокус — синий контур. Загрузка оставляет подпись на месте и проводит по ней свет.</p>
</header>

<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--muted)">
<span class="colh">вес · тон</span>
<span class="colh">покой</span><span class="colh">наведение</span><span class="colh">нажатие</span><span class="colh">фокус</span><span class="colh">загрузка</span><span class="colh">disabled</span><span class="colh">aria-disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(7, minmax(0, 1fr)); align-items: center; min-height: 74px; padding: 0 24px">
<span class="h3" style="font-size: 13px">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button" :aria-busy="c.busy" :aria-disabled="c.ariaDisabled"><span class="lbl">{{ c.verb }}</span></button></div>
</template>
</div>
</template>
</div>

<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; padding: 12px 24px; background: var(--muted)">
<span class="colh">событие</span><span class="colh">что меняется</span><span class="colh">длит.</span><span class="colh">кривая</span><span class="colh">шкала, 1 с = 150 px</span>
</div>
<div class="rule" style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; align-items: center; padding: 12px 24px"><span class="h3" style="font-size: 14px">Наведение</span><span class="body">оттенок бумаги у прозрачных, шаг заливки прочь от подписи у залитых</span><span class="mono">150 мс</span><span class="mono">ease</span><div class="bar" style="width: 22px"></div></div>
<div class="rule" style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; align-items: center; padding: 12px 24px"><span class="h3" style="font-size: 14px">Нажатие</span><span class="body">ещё шаг; кнопка не сжимается и не смещается</span><span class="mono">150 мс</span><span class="mono">ease</span><div class="bar" style="width: 22px"></div></div>
<div class="rule" style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; align-items: center; padding: 12px 24px"><span class="h3" style="font-size: 14px">Фокус</span><span class="body">синий контур 2px с отступом 2px</span><span class="mono">150 мс</span><span class="mono">ease</span><div class="bar" style="width: 22px"></div></div>
<div class="rule" style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; align-items: center; padding: 12px 24px"><span class="h3" style="font-size: 14px">Загрузка</span><span class="body">свет проходит по подписи слева направо, по кругу</span><span class="mono">1800 мс</span><span class="mono">linear</span><div class="bar" style="width: 270px"></div></div>
<div class="rule" style="display: grid; grid-template-columns: 160px minmax(0, 1fr) 90px 150px 300px; gap: 16px; align-items: center; padding: 12px 24px"><span class="h3" style="font-size: 14px">reduced-motion</span><span class="body">мерцания нет: подпись приглушена до 70 %, к имени дописано скрытое «Загрузка…»</span><span class="mono">0 мс</span><span class="mono">—</span><span class="cap">смысл держит текст</span></div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">

<div class="card" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<h3 class="heading" style="font-size: 20px">Загрузка: подпись думает</h3>
<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px 16px; align-items: center">
<span class="cap">графит</span><div><button class="gb s-md v-primary t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Сохраняем отчёт</span></button></div>
<span class="cap">глина</span><div><button class="gb s-md v-primary t-primary is-loading" type="button" aria-busy="true"><span class="lbl">Отправляем</span></button></div>
<span class="cap">светлая</span><div><button class="gb s-md v-secondary t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Готовим экспорт</span></button></div>
<span class="cap">ghost</span><div><button class="gb s-md v-ghost t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Обновляем</span></button></div>
</div>
<p class="body">Подпись та же, поэтому ширина не меняется, а спиннер не нужен. Что именно грузится, скринридеру по-прежнему сообщает скрытый <span class="code">loadingText</span>.</p>
</div>

<div class="card" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<h3 class="heading" style="font-size: 20px">Недоступность: бумага без чернил</h3>
<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px 16px; align-items: center">
<span class="cap">графит</span><div><button class="gb s-md v-primary t-neutral is-disabled" type="button" aria-disabled="true">Опубликовать</button></div>
<span class="cap">outline</span><div><button class="gb s-md v-outline t-neutral is-disabled" type="button" aria-disabled="true">Экспорт</button></div>
<span class="cap">с причиной</span><div style="padding-top: 30px"><span class="anchor"><button class="gb s-md v-primary t-primary is-disabled is-focus" type="button" aria-disabled="true" aria-describedby="why">Отправить</button><span id="why" class="tip" role="tooltip">Сначала добавьте получателя</span></span></div>
</div>
<p class="body">Заливка становится бумагой на тон темнее фона, подпись — тёплым серым (роли `--gr-disabled-*`). Кнопка выглядит пустой, а не сломанной; причину показывает подсказка, если кнопка оставлена в фокусе.</p>
</div>

</div>

<div class="paper" style="padding: 28px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
<span class="h3" style="margin-right: 8px">Живьём</span>
<button :class="vals.saveCls" type="button" :aria-busy="vals.saveBusy" :aria-disabled="vals.saveBusy" @click="vals.onSave"><span class="lbl">{{ vals.saveLabel }}</span></button>
<button class="gb s-md v-secondary t-neutral" type="button">Отмена</button>
<button class="gb s-md v-outline t-neutral" type="button">Предпросмотр</button>
<button class="gb s-md v-ghost t-neutral" type="button">Пропустить</button>
<button class="gb s-md v-primary t-primary" type="button">Отправить</button>
<span class="cap">«Сохранить» — 2 с загрузки</span>
</div>

</div>
</template>
