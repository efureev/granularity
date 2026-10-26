/** Ссылки образцов ведут на «#»: переход по нему бросил бы страницу к началу. */
export function keepOnPage(event: MouseEvent): void {
  if (event.target instanceof Element && event.target.closest('a[href="#"]'))
    event.preventDefault()
}

/*
 * Картинки образцов — SVG прямо в адресе: дизайн-система не ходит в сеть. Цвета
 * здесь пиксели картинки, а не оформление, поэтому токенов темы они не знают.
 */
export function svgUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function portrait(from: string, to: string): string {
  return svgUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">'
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`
    + '<rect width="96" height="96" fill="url(#g)"/>'
    + '<circle cx="48" cy="38" r="17" fill="hsla(0, 0%, 100%, 0.82)"/>'
    + '<path d="M16 96c4-20 17-30 32-30s28 10 32 30z" fill="hsla(0, 0%, 100%, 0.82)"/>'
    + '</svg>',
  )
}

export function landscape(skyTop: string, skyBottom: string, sun: string, far: string, near: string): string {
  return svgUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">'
    + `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient></defs>`
    + '<rect width="1200" height="800" fill="url(#s)"/>'
    + `<circle cx="860" cy="260" r="96" fill="${sun}"/>`
    + `<path d="M0 520 Q260 380 520 500 T1200 440 V800 H0Z" fill="${far}"/>`
    + `<path d="M0 640 Q340 520 700 620 T1200 600 V800 H0Z" fill="${near}"/>`
    + '</svg>',
  )
}

export const photos = [
  {
    src: landscape('hsl(32, 86%, 78%)', 'hsl(14, 72%, 86%)', 'hsl(40, 96%, 92%)', 'hsl(18, 34%, 58%)', 'hsl(12, 30%, 40%)'),
    alt: 'Холмы на закате, солнце над дальним гребнем',
  },
  {
    src: landscape('hsl(204, 64%, 76%)', 'hsl(190, 50%, 90%)', 'hsl(52, 90%, 90%)', 'hsl(160, 26%, 54%)', 'hsl(150, 30%, 34%)'),
    alt: 'Зелёная долина в ясный полдень',
  },
  {
    src: landscape('hsl(250, 34%, 32%)', 'hsl(276, 30%, 54%)', 'hsl(48, 60%, 86%)', 'hsl(256, 22%, 40%)', 'hsl(250, 26%, 22%)'),
    alt: 'Сумеречные горы под полной луной',
  },
  {
    src: landscape('hsl(196, 40%, 88%)', 'hsl(210, 30%, 96%)', 'hsl(0, 0%, 100%)', 'hsl(206, 22%, 70%)', 'hsl(210, 18%, 52%)'),
    alt: 'Заснеженный перевал в пасмурный день',
  },
]
