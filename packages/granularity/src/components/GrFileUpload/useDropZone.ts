import { ref, type Ref } from 'vue'

export interface UseDropZoneOptions {
  /** Зона выключена: ввод не принимается (`disabled` или `readonly`). */
  locked: () => boolean
  /** UI рисует слот — зона перестаёт быть зоной, обработка уезжает к нему. */
  inactive: () => boolean
  onDrop: (files: File[]) => void
}

export interface UseDropZoneReturn {
  /** Файл висит над зоной. */
  isOver: Ref<boolean>
  onDragEnter: (event: DragEvent) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: (event: DragEvent) => void
  onDropFiles: (event: DragEvent) => void
}

/**
 * Drag&drop поверх зоны.
 *
 * Счётчик входов, а не флаг: `dragenter`/`dragleave` приходят и от вложенных
 * элементов, и без счётчика подсветка гасла, стоило курсору пересечь границу
 * подписи внутри зоны.
 */
export function useDropZone(options: UseDropZoneOptions): UseDropZoneReturn {
  const isOver = ref(false)
  let overCounter = 0

  function setOver(next: boolean): void {
    if (isOver.value === next) return
    isOver.value = next
  }

  function ignored(): boolean {
    return options.inactive() || options.locked()
  }

  function onDragEnter(event: DragEvent): void {
    if (ignored()) return

    event.preventDefault()
    overCounter += 1
    setOver(true)
  }

  function onDragOver(event: DragEvent): void {
    if (ignored()) return

    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  function onDragLeave(event: DragEvent): void {
    if (ignored()) return

    event.preventDefault()
    overCounter = Math.max(0, overCounter - 1)
    if (overCounter === 0) setOver(false)
  }

  function onDropFiles(event: DragEvent): void {
    if (ignored()) return

    event.preventDefault()
    overCounter = 0
    setOver(false)

    const files = event.dataTransfer?.files
      ? Array.prototype.slice.call(event.dataTransfer.files) as File[]
      : []

    options.onDrop(files)
  }

  return { isOver, onDragEnter, onDragOver, onDragLeave, onDropFiles }
}
