import type { ComputedRef, InjectionKey } from 'vue'

export type GrCollapseValue = string | number

export type GrCollapseModelValue = GrCollapseValue | GrCollapseValue[] | undefined

export type GrCollapseContext = {
  accordion: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  isActive: (name: GrCollapseValue) => boolean
  toggle: (name: GrCollapseValue) => void
}

export const GR_COLLAPSE_CONTEXT: InjectionKey<GrCollapseContext> = Symbol('GR_COLLAPSE_CONTEXT')