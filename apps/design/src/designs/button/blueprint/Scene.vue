<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1400px; padding: 56px 64px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">06 · В продукте</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Рабочий инструмент: плотно и без шума</h2>
<p class="lead">Редактор отчёта — экран, где кнопок много и все рабочие. Плоские кнопки не спорят с данными: краска есть только у главного действия, остальное — контур, текст и линия под указателем.</p>
</header>

<div style="border: 1px solid var(--brd-2); border-radius: 4px; overflow: hidden; background: var(--card)">

<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--brd-2); flex-wrap: wrap">
<div style="display: flex; align-items: center; gap: 10px; min-width: 0">
<nav aria-label="Путь" style="display: flex; align-items: center; gap: 6px"><a href="#" style="color: var(--muted-fg); text-decoration: none; font-size: 13px">Отчёты</a><span class="cap">/</span><span style="font-size: 13px; font-weight: 600">Выручка, Q3</span></nav>
<span class="tag">черновик</span>
</div>
<div style="display: flex; align-items: center; gap: 6px">
<button class="gb s-sm v-ghost t-neutral" type="button">История</button>
<button class="gb s-sm v-outline t-neutral" type="button"><span class="lbl">Предпросмотр</span><span class="kbd">⌘P</span></button>
<div class="grp" role="group" aria-label="Публикация">
<button class="gb s-sm v-primary t-primary" type="button">Опубликовать</button>
<button class="gb s-sm sq v-primary t-primary" type="button" aria-label="Другие варианты публикации" aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10h10l-5 6z" class="fill"></path></svg></button>
</div>
</div>
</div>

<div style="display: flex; gap: 0; padding: 0 20px; border-bottom: 1px solid var(--brd-2)">
<div class="grp" role="group" aria-label="Разделы редактора">
<button class="gb s-md v-ghost t-primary is-active" type="button" aria-current="page">Данные</button>
<button class="gb s-md v-ghost t-neutral" type="button">Визуализация</button>
<button class="gb s-md v-ghost t-neutral is-hover" type="button">Доступ</button>
</div>
</div>

<div style="display: grid; grid-template-columns: 300px minmax(0, 1fr)">

<div style="padding: 20px; border-right: 1px solid var(--brd-2); display: flex; flex-direction: column; gap: 14px">
<label class="fld"><span>Источник</span><input type="text" value="billing.invoices" readonly></label>
<label class="fld"><span>Период</span><input type="text" value="01.07 — 30.09" readonly></label>
<label class="fld"><span>Группировка</span><input type="text" value="по месяцам" readonly></label>
<button class="gb s-sm v-outline t-neutral celled" type="button" style="justify-content: flex-start"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Добавить фильтр</span></button>
</div>

<div style="display: flex; flex-direction: column">
<div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 10px 14px; gap: 8px">
<span class="cap">3 строки · сумма по месяцу</span>
<div style="display: flex; align-items: center; gap: 2px">
<button class="gb s-sm v-ghost-border t-neutral" type="button"><span class="lbl">Фильтры</span><span class="cnt">01</span></button>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="Обновить данные"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4v6h-6"></path><path d="M20 10A8 8 0 1 0 18 17"></path></svg></button>
<button class="gb s-sm sq v-ghost-border t-neutral" type="button" aria-label="Скачать CSV"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v6H3v-6"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg></button>
</div>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1fr) 110px 110px 92px; align-items: center; height: 32px; padding: 0 8px 0 14px; background: var(--muted)">
<span class="colh">месяц</span><span class="colh" style="text-align: right">счета</span><span class="colh" style="text-align: right">выручка</span><span></span>
</div>
<div class="cellrow"><span style="font-size: 13px">Июль</span><span class="num">[N]</span><span class="num">[СУММА]</span><div class="row-actions"><button class="gb s-xs sq v-ghost t-neutral" type="button" aria-label="Открыть июль"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M10 14 20 4"></path><path d="M18 14v6H4V6h6"></path></svg></button></div></div>
<div class="cellrow is-hover"><span style="font-size: 13px">Август</span><span class="num">[N]</span><span class="num">[СУММА]</span><div class="row-actions"><button class="gb s-xs sq v-ghost t-neutral is-hover" type="button" aria-label="Открыть август"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M10 14 20 4"></path><path d="M18 14v6H4V6h6"></path></svg></button></div></div>
<div class="cellrow"><span style="font-size: 13px">Сентябрь</span><span class="num">[N]</span><span class="num">[СУММА]</span><div class="row-actions"><button class="gb s-xs sq v-ghost t-neutral" type="button" aria-label="Открыть сентябрь"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M10 14 20 4"></path><path d="M18 14v6H4V6h6"></path></svg></button></div></div>
</div>

</div>

<div style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--brd-2); background: var(--bg)">
<button class="gb s-sm v-ghost t-neutral" type="button">Сбросить изменения</button>
<span style="flex: 1"></span>
<span class="cap">сохранено 2 мин назад</span>
<button class="gb s-sm v-outline t-neutral" type="button">В черновик</button>
<button class="gb s-sm v-primary t-primary is-loading" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">Публикуем</span></button>
</div>

</div>

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<div class="blueprint" style="min-height: 260px; padding: 28px; display: flex; align-items: center; justify-content: center">
<div role="dialog" aria-labelledby="dlg-t" style="width: 420px; background: var(--card); border: 1px solid var(--brd-2); border-radius: 4px">
<div style="padding: 18px 20px; display: flex; flex-direction: column; gap: 6px">
<h4 id="dlg-t" class="h3" style="font-size: 15px">Удалить отчёт «Выручка, Q3»?</h4>
<p class="body">Отчёт пропадёт у всех, у кого есть ссылка. Восстановить его не получится.</p>
</div>
<div style="display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--brd-2); background: var(--bg)">
<button class="gb s-sm v-outline t-neutral is-focus" type="button">Оставить</button>
<button class="gb s-sm v-primary t-danger" type="button">Удалить отчёт</button>
</div>
</div>
</div>
<div class="blueprint" style="min-height: 260px; padding: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center">
<span class="eyebrow">отчётов пока нет</span>
<p class="body" style="max-width: 300px">Соберите первый из шаблона или загрузите таблицу.</p>
<div style="display: flex; gap: 8px">
<button class="gb s-md v-primary t-primary celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Создать отчёт</span></button>
<button class="gb s-md v-ghost t-primary is-hover" type="button">Импорт из CSV</button>
</div>
</div>
</div>

</div>
</template>
