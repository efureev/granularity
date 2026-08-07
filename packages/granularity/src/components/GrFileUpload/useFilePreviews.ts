export interface UseFilePreviewsOptions {
  /** Включены ли миниатюры. Геттер — проп реактивен. */
  enabled: () => boolean
}

export interface UseFilePreviewsReturn {
  /** Стабильный ключ файла для `v-for`. */
  fileKey: (file: File) => string
  /** `object URL` миниатюры или `undefined`, если файл не картинка. */
  previewUrl: (file: File) => string | undefined
  revokePreview: (file: File) => void
  revokeAllPreviews: () => void
}

/**
 * Ключи списка и миниатюры превью.
 *
 * Ключ считается от самого файла, а не от имени: два одноимённых файла из
 * разных папок делили бы один `<li>`, и кнопка удаления в строке снимала бы
 * не тот файл.
 *
 * `object URL` живёт ровно столько, сколько файл в наборе: без отзыва blob
 * висит в памяти вкладки до перезагрузки — утечка тем заметнее, чем чаще
 * пользователь перевыбирает файлы.
 */
export function useFilePreviews(options: UseFilePreviewsOptions): UseFilePreviewsReturn {
  const keys = new WeakMap<File, string>()
  const urls = new Map<File, string>()
  let counter = 0

  function fileKey(file: File): string {
    const existing = keys.get(file)
    if (existing !== undefined) return existing

    counter += 1
    const key = `gr-file-${counter}`
    keys.set(file, key)
    return key
  }

  function previewUrl(file: File): string | undefined {
    if (!options.enabled() || !file.type.startsWith('image/')) return undefined

    const existing = urls.get(file)
    if (existing) return existing

    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return undefined

    const url = URL.createObjectURL(file)
    urls.set(file, url)
    return url
  }

  function revokePreview(file: File): void {
    const url = urls.get(file)
    if (!url) return

    URL.revokeObjectURL(url)
    urls.delete(file)
  }

  function revokeAllPreviews(): void {
    for (const file of [...urls.keys()]) revokePreview(file)
  }

  return { fileKey, previewUrl, revokePreview, revokeAllPreviews }
}
