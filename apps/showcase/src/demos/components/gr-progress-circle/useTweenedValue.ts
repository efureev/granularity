import { onBeforeUnmount, ref } from 'vue'

/**
 * Значение, которое едет к новой точке за заданное время, а не прыгает.
 *
 * Собственный переход дуги (`--gr-duration-base`) сглаживает только сам скачок:
 * при шаге раз в пять секунд кольцо дёргалось бы за долю секунды и стояло всё
 * остальное время. Здесь движение растягивается на весь интервал — и число в
 * центре едет вместе с дугой.
 */
export function useTweenedValue(initial: number) {
  const value = ref(initial)

  let frame: number | undefined

  function stop(): void {
    if (frame !== undefined)
      cancelAnimationFrame(frame)
    frame = undefined
  }

  /** Уважать «уменьшить движение» обязан тот, кто двигает: CSS-кламп до JS не достаёт. */
  function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
  }

  function tweenTo(target: number, duration: number): void {
    stop()

    const from = value.value
    if (from === target || duration <= 0 || prefersReducedMotion()) {
      value.value = target
      return
    }

    const start = performance.now()

    function step(now: number): void {
      const progress = Math.min(1, (now - start) / duration)
      value.value = from + (target - from) * progress

      if (progress < 1)
        frame = requestAnimationFrame(step)
      else frame = undefined
    }

    frame = requestAnimationFrame(step)
  }

  /** Мгновенно — для разрыва шкалы, где плавный переход выглядел бы перемоткой. */
  function jumpTo(target: number): void {
    stop()
    value.value = target
  }

  onBeforeUnmount(stop)

  return { value, tweenTo, jumpTo }
}
