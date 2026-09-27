/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

declare module 'virtual:granum.css' {
  const css: string
  export default css
}

/**
 * Стенд типизируется по **исходникам** пакета (`paths` в `tsconfig.json`), а не
 * по его `dist`, — поэтому имя из сборочного `define` пакета нужно объявить и
 * здесь. В рантайме стенда его нет: код пакета приезжает уже собранным, с
 * подставленным выражением.
 */
declare const __GR_DEV__: boolean
