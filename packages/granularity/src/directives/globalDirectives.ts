import type { Directive } from 'vue'

import type { AutofocusBindingValue } from './autofocus'
import type { AutosizeBindingValue } from './autosize'
import type { ClickOutsideBindingValue } from './clickOutside'
import type { DropzoneBindingValue } from './dropzone'
import type { HotkeyBindingValue } from './hotkey'
import type { LoadingBindingValue } from './loading'

declare module 'vue' {
  interface GlobalDirectives {
    vAutofocus: Directive<HTMLElement, AutofocusBindingValue>
    vAutosize: Directive<HTMLElement, AutosizeBindingValue>
    vClickOutside: Directive<HTMLElement, ClickOutsideBindingValue>
    vDropzone: Directive<HTMLElement, DropzoneBindingValue>
    vHotkey: Directive<HTMLElement, HotkeyBindingValue>
    vLoading: Directive<HTMLElement, LoadingBindingValue>
  }
}

export {}