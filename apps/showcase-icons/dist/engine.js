import { icons } from "@iconify-json/lucide";
//#region src/engine.ts
var icons$1 = icons;
/** Масштаб иконки в `em` — тот же, что стоял у `presetIcons` в конфиге витрины. */
var SCALE = 1.05;
function svgDataUrl(name) {
	const icon = icons$1.icons[name];
	if (!icon) return void 0;
	return `url("data:image/svg+xml;utf8,${`<svg viewBox='0 0 ${icon.width ?? icons$1.width ?? 24} ${icon.height ?? icons$1.height ?? 24}' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg'>${icon.body}</svg>`.replace(/%/g, "%25").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/"/g, "%22")}")`;
}
/**
* `i-lucide-<name>` → иконка маской.
*
* Имя экспорта значимо: granum импортирует модуль из `engine.module` манифеста
* и берёт у него `rules`, `variants` и `preflights` (M-E4). Экспорт под другим
* именем грузится успешно и молча ничего не даёт: отчёт пишет
* `rulesLoaded: true`, а иконки исчезают из CSS.
*
* Имя, которого нет в наборе, правило не обслуживает: `undefined` означает
* «правило не совпало», и класс уезжает в `classes.unmatched` отчёта сборки.
* Это лучше пустой иконки — опечатка в имени видна, а не превращается в
* невидимый квадрат.
*/
var rules = [[/^i-lucide-(.+)$/, (match) => {
	const icon = svgDataUrl(match[1]);
	if (!icon) return void 0;
	return {
		"--un-icon": icon,
		"-webkit-mask": "var(--un-icon) no-repeat",
		"mask": "var(--un-icon) no-repeat",
		"-webkit-mask-size": "100% 100%",
		"mask-size": "100% 100%",
		"background-color": "currentColor",
		"color": "inherit",
		"display": "inline-block",
		"width": `${SCALE}em`,
		"height": `${SCALE}em`
	};
}]];
//#endregion
export { rules };
