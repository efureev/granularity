<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1400px; padding: 64px 72px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">В продукте</span>
<h2 class="title" style="font-size: 34px">Кнопки, которые не мешают читать</h2>
<p class="lead">Редактор документа: текст — главное, кнопки отступают. Графит — для «Опубликовать», глина — для одного действия, ради которого сейчас открыт экран: принять предложенную правку.</p>
</header>

<div style="border: 1px solid var(--hair); border-radius: 16px; overflow: hidden; background: var(--bg)">

<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--hair); flex-wrap: wrap">
<div style="display: flex; align-items: center; gap: 4px">
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Назад к документам"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<span style="font-size: 14px; font-weight: 500">Квартальный отчёт</span>
<span class="chip" style="margin-left: 8px">черновик</span>
</div>
<div style="display: flex; align-items: center; gap: 6px">
<button class="gb s-sm v-ghost t-neutral" type="button">История</button>
<button class="gb s-sm v-ghost t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="m16 6-4-4-4 4"></path><path d="M12 2v13"></path></svg><span class="lbl">Поделиться</span></button>
<button class="gb s-sm v-primary t-neutral" type="button">Опубликовать</button>
</div>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1fr) 320px">

<div style="padding: 40px 56px; display: flex; flex-direction: column; gap: 18px">
<h3 class="title">Выручка за третий квартал</h3>
<p class="serif" style="font-size: 17px; line-height: 1.6; color: var(--fg-2); max-width: 620px">Квартал закрыт с ростом в [ПРОЦЕНТ] к прошлому году. Основной вклад дали годовые подписки, а возвраты удержались на уровне второго квартала.</p>
<div class="card" style="padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; max-width: 620px">
<div style="display: flex; align-items: center; justify-content: space-between">
<span class="h3" style="font-size: 14px">Предложенная правка</span>
<span class="cap">абзац 2</span>
</div>
<p class="serif" style="font-size: 15px; line-height: 1.55; color: var(--fg-2)"><span style="text-decoration: line-through; color: var(--muted-fg)">удержались на уровне</span> <span style="background: color-mix(in srgb, #d27a55 18%, transparent); border-radius: 3px; padding: 0 2px; color: var(--fg)">не превысили уровень</span> второго квартала.</p>
<div style="display: flex; align-items: center; gap: 8px">
<button class="gb s-sm v-primary t-primary" type="button">Принять правку</button>
<button class="gb s-sm v-ghost t-neutral" type="button">Отклонить</button>
<span style="flex: 1"></span>
<button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Скопировать правку"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path></svg></button>
</div>
</div>
<p class="serif" style="font-size: 17px; line-height: 1.6; color: var(--fg-2); max-width: 620px">Расходы на привлечение снизились; детали — в таблице ниже.</p>
</div>

<aside style="padding: 24px; border-left: 1px solid var(--hair); display: flex; flex-direction: column; gap: 16px; background: var(--card)">
<span class="h3" style="font-size: 14px">Публикация</span>
<label class="fld"><span>Адрес</span><input type="text" value="reports/q3-revenue" readonly></label>
<div class="fld"><span>Видимость</span>
<div class="grp" role="group" aria-label="Видимость">
<button class="gb s-sm v-ghost t-neutral is-on" type="button" aria-pressed="true">Команда</button>
<button class="gb s-sm v-ghost t-neutral" type="button" aria-pressed="false">По ссылке</button>
<button class="gb s-sm v-ghost t-neutral" type="button" aria-pressed="false">Все</button>
</div>
</div>
<button class="gb s-sm v-secondary t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить читателя</span></button>
<div style="flex: 1"></div>
<div class="rule" style="padding-top: 14px; display: flex; gap: 8px">
<button class="gb s-sm v-ghost t-neutral" type="button">Сбросить</button>
<span style="flex: 1"></span>
<button class="gb s-sm v-primary t-neutral is-loading" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">Сохраняем</span></button>
</div>
</aside>

</div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<div class="paper" style="min-height: 260px; padding: 28px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #1c1b18 6%, var(--bg))">
<div role="dialog" aria-labelledby="dlg-t" style="width: 420px; padding: 24px; background: var(--card); border: 1px solid var(--hair); border-radius: 16px; display: flex; flex-direction: column; gap: 10px">
<h4 id="dlg-t" class="heading" style="font-size: 20px">Удалить «Квартальный отчёт»?</h4>
<p class="body">Документ пропадёт у всех читателей. Восстановить его не получится.</p>
<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px">
<button class="gb s-md v-ghost t-neutral is-focus" type="button">Оставить</button>
<button class="gb s-md v-primary t-danger" type="button">Удалить документ</button>
</div>
</div>
</div>
<div class="paper" style="min-height: 260px; padding: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center">
<h4 class="heading" style="font-size: 22px">Здесь пока пусто</h4>
<p class="body" style="max-width: 320px">Начните с чистого листа или возьмите один из шаблонов отчёта.</p>
<div style="display: flex; gap: 8px; margin-top: 4px">
<button class="gb s-md v-primary t-neutral" type="button">Новый документ</button>
<button class="gb s-md v-secondary t-neutral" type="button">Шаблоны</button>
</div>
</div>
</div>

</div>
</template>
