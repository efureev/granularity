<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

/**
 * Рамка макета: shadow root со своими стилями и масштаб по ширине.
 *
 * Изоляция обязательна, а не косметика: у каждой версии свои `.gb`, `.doc`,
 * `.t-primary` и одноимённые `@keyframes`, и в общем документе они перебили бы
 * друг друга и утилиты приложения. Сброс приложения внутрь тоже не проходит —
 * макеты нарисованы поверх стилей браузера по умолчанию.
 *
 * Содержимое попадает внутрь телепортом, поэтому остаётся частью этого
 * приложения: реактивность, обработчики и состояние песочниц работают как
 * обычно.
 */
const props = defineProps<{
  css: string
  /** Ширина, под которую нарисован макет. */
  width: number
  /** Вписать в ширину колонки; иначе — натуральный размер и прокрутка. */
  fit: boolean
}>()

const viewport = ref<HTMLElement>()
const host = ref<HTMLElement>()
const target = shallowRef<HTMLElement>()
const available = ref(props.width)

let sheet: CSSStyleSheet | undefined
let observer: ResizeObserver | undefined

function blockLinks(event: Event): void {
  // Ссылки в макетах — заглушки: переход увёл бы страницу приложения.
  if (event.target instanceof Element && event.target.closest('a[href]'))
    event.preventDefault()
}

onMounted(() => {
  const root = host.value!.attachShadow({ mode: 'open' })

  sheet = new CSSStyleSheet()
  sheet.replaceSync(props.css)
  root.adoptedStyleSheets = [sheet]
  root.addEventListener('click', blockLinks)

  const mount = document.createElement('div')
  root.append(mount)
  target.value = mount

  observer = new ResizeObserver(([entry]) => {
    if (entry)
      available.value = entry.contentRect.width
  })
  observer.observe(viewport.value!)
})

watch(() => props.css, css => sheet?.replaceSync(css))

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="viewport"
    class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gr-ring)] focus-visible:outline-solid"
    :tabindex="fit ? undefined : 0"
  >
    <div
      ref="host"
      :style="{ width: `${width}px`, zoom: fit ? Math.min(1, available / width) : 1 }"
    />
    <Teleport v-if="target" :to="target">
      <slot />
    </Teleport>
  </div>
</template>
