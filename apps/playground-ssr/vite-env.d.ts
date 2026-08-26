/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

/**
 * Стенд типизируется по **исходникам** пакетов (`paths` в `tsconfig.json`), а
 * не по их `dist`, — поэтому имя из их сборочного `define` нужно объявить и
 * здесь. В рантайме стенда его нет: код пакетов приезжает уже собранным, с
 * подставленным выражением.
 */
declare const __GR_DEV__: boolean
