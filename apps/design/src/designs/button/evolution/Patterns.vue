<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1960px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">07 · В интерфейсе</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Кнопка в контексте и правила, которые её берегут</h2>
<p class="lead">Вес, тон и место кнопки решают вместе. Ниже — пять частых сцен и шесть пар «так / не так».</p>
</header>

<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 340px; gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Подтверждение необратимого</h3>
<div class="stage" style="padding: 24px; display: flex; align-items: center; justify-content: center">
<div role="dialog" aria-labelledby="dlg-title" style="width: 100%; max-width: 380px; padding: 20px; background: var(--card); border: 1px solid var(--brd); border-radius: 12px; box-shadow: var(--sh-2); display: flex; flex-direction: column; gap: 8px">
<h4 id="dlg-title" class="h3" style="margin: 0">Удалить проект «Атлас»?</h4>
<p class="body">Удалятся 24 отчёта и история изменений. Отменить это нельзя.</p>
<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px">
<button class="gb s-md v-secondary t-neutral is-focus" type="button">Отмена</button>
<button class="gb s-md v-primary t-danger" type="button">Удалить проект</button>
</div>
</div>
</div>
<p class="body">Фокус при открытии — на безопасном действии. Опасное названо полностью: «Удалить проект», не «Да».</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Пустое состояние</h3>
<div class="stage" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center">
<span style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #4f46e5 12%, var(--card)); color: #3730a3"><svg class="ico" style="width: 22px; height: 22px" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path><path d="M12 18v-6"></path><path d="M9 15h6"></path></svg></span>
<h4 class="h3" style="margin: 0">Пока нет отчётов</h4>
<p class="body" style="max-width: 260px">Соберите первый из шаблона или загрузите таблицу.</p>
<div style="display: flex; gap: 8px; margin-top: 6px">
<button class="gb s-md v-primary t-primary pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Создать отчёт</span></button>
<button class="gb s-md v-ghost t-primary" type="button">Импорт из CSV</button>
</div>
</div>
<p class="body">Одна primary ведёт вперёд, альтернатива — ghost того же тона, чтобы не спорить.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px; grid-row: span 2">
<h3 class="h3">Мобильный лист</h3>
<div style="flex: 1; min-height: 480px; border-radius: 28px; border: 8px solid #0f172a; overflow: hidden; display: flex; flex-direction: column; background: rgba(15, 23, 42, .45)">
<div style="flex: 1"></div>
<div style="background: var(--card); border-radius: 16px 16px 0 0; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 10px">
<span aria-hidden="true" style="align-self: center; width: 36px; height: 4px; border-radius: 999px; background: var(--brd-2)"></span>
<h4 class="h3" style="margin: 4px 0 0">Сохранить изменения?</h4>
<p class="body">Вы правили описание и обложку. Без сохранения правки пропадут.</p>
<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px">
<button class="gb s-lg v-primary t-primary block" type="button">Сохранить</button>
<button class="gb s-lg v-secondary t-neutral block" type="button">Не сохранять</button>
<button class="gb s-lg v-ghost t-neutral block" type="button">Вернуться к правке</button>
</div>
</div>
</div>
<p class="body">На телефоне — lg и block из <span class="code">GrConfigProvider</span>; главное действие сверху, под большим пальцем.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Действия строки</h3>
<div class="stage" style="padding: 16px; display: flex; flex-direction: column">
<div style="background: var(--card); border: 1px solid var(--brd); border-radius: 10px; overflow: hidden">
<div class="trow" style="display: grid; grid-template-columns: minmax(0, 1fr) 90px 104px; align-items: center; height: 44px; padding: 0 8px 0 14px">
<span class="body" style="color: var(--fg)">Выручка, Q3</span><span class="cap">черновик</span>
<div class="row-actions">
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Изменить «Выручка, Q3»"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Дублировать «Выручка, Q3»"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ещё действия с «Выручка, Q3»" aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
<div class="trow is-hover" style="display: grid; grid-template-columns: minmax(0, 1fr) 90px 104px; align-items: center; height: 44px; padding: 0 8px 0 14px; border-top: 1px solid var(--brd)">
<span class="body" style="color: var(--fg)">Удержание клиентов</span><span class="cap">опубликован</span>
<div class="row-actions">
<button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Изменить «Удержание клиентов»"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Дублировать «Удержание клиентов»"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ещё действия с «Удержание клиентов»" aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
<div class="trow" style="display: grid; grid-template-columns: minmax(0, 1fr) 90px 104px; align-items: center; height: 44px; padding: 0 8px 0 14px; border-top: 1px solid var(--brd)">
<span class="body" style="color: var(--fg)">Воронка продаж</span><span class="cap">опубликован</span>
<div class="row-actions">
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Изменить «Воронка продаж»"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Дублировать «Воронка продаж»"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button>
<button class="gb s-sm sq v-ghost t-neutral" type="button" aria-label="Ещё действия с «Воронка продаж»" aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg></button>
</div>
</div>
</div>
</div>
<p class="body">Ghost и тишина до наведения. С клавиатуры действия проявляются на <span class="code">:focus-within</span>, а имя называет строку.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Подвал формы</h3>
<div class="stage" style="padding: 24px 20px; display: flex; flex-direction: column; justify-content: center; gap: 16px">
<div style="display: flex; align-items: center; gap: 8px; padding: 14px; background: var(--card); border: 1px solid var(--brd); border-radius: 10px">
<button class="gb s-md v-ghost t-neutral" type="button">Сбросить</button>
<span style="flex: 1"></span>
<button class="gb s-md v-secondary t-neutral" type="button">В черновик</button>
<button class="gb s-md v-primary t-primary is-loading ov" type="submit" aria-busy="true" aria-disabled="true"><span class="lbl">Опубликовать</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button>
</div>
</div>
<p class="body">Сброс — отдельно слева и тише всех. Отправка ждёт сервер в loading: повторный клик гасится, фокус на месте.</p>
</div>

</div>

<section style="display: flex; flex-direction: column; gap: 16px">
<h2 class="h2">Так и не так</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-secondary t-neutral" type="button">Отмена</button><button class="gb s-sm v-primary t-primary" type="button">Сохранить</button></div>
<p class="body">Одна primary на область — понятно, что главное.</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-primary t-primary" type="button">Сохранить</button><button class="gb s-sm v-primary t-primary" type="button">Опубликовать</button><button class="gb s-sm v-primary t-primary" type="button">Отправить</button></div>
<p class="body">Три primary подряд: взгляд не знает, куда идти.</p>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-secondary t-neutral" type="button">Оставить</button><button class="gb s-sm v-primary t-danger" type="button">Удалить проект</button></div>
<p class="body">Глагол и объект: ясно, что произойдёт после клика.</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-secondary t-neutral" type="button">Нет</button><button class="gb s-sm v-primary t-primary" type="button">Да</button></div>
<p class="body">«Да» и «Нет» заставляют перечитать вопрос.</p>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-primary t-primary is-loading ov" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">Сохранить</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button></div>
<p class="body">loading на время запроса: кнопка в фокусе, AT слышит «Сохраняем…».</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-primary t-primary is-disabled" type="button" aria-disabled="true">Сохранить</button></div>
<p class="body">disabled на время запроса: фокус падает в body, человек теряет место.</p>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center"><span class="anchor"><button class="gb s-sm sq v-ghost-border t-neutral is-hover" type="button" aria-label="Копировать ссылку"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><span class="tip" role="tooltip" style="bottom: auto; top: 50%; left: calc(100% + 10px); transform: translateY(-50%)">Копировать ссылку</span></span></div>
<p class="body">У кнопки-иконки есть <span class="code">ariaLabel</span>, тултип повторяет его.</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 12px"><button class="gb s-sm sq v-ghost-border t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg></button><span class="mono" style="color: var(--no)">«кнопка»</span></div>
<p class="body">Без имени скринридер скажет только «кнопка».</p>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-ghost t-neutral" type="button">Отмена</button><button class="gb s-sm v-primary t-danger" type="button">Удалить навсегда</button></div>
<p class="body">Красный — только у необратимого действия.</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-outline t-danger" type="button">Отмена</button><button class="gb s-sm v-primary t-primary" type="button">Продолжить</button></div>
<p class="body">Красная «Отмена» пугает там, где ничего не теряется.</p>
</div>
</div>

<div style="display: flex; flex-direction: column; gap: 10px">
<div class="panel dd do" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark do"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>Так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><a class="gb s-sm v-outline t-primary suf" href="#"><span class="lbl">Открыть отчёт</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a></div>
<p class="body">Переход — ссылка: <span class="code">href</span> или <span class="code">as="RouterLink"</span>, работают средний клик и новая вкладка.</p>
</div>
<div class="panel dd dont" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
<span class="mark dont"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Не так</span>
<div class="stage" style="min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px"><button class="gb s-sm v-outline t-primary" type="button">Открыть отчёт</button><span class="mono" style="color: var(--no)">@click="router.push"</span></div>
<p class="body">Кнопка, меняющая адрес, ломает «открыть в новой вкладке» и историю.</p>
</div>
</div>

</div>
</section>

</div>
</template>
