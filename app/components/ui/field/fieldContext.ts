import type { ComputedRef, InjectionKey } from 'vue'

export interface FieldContext {
  /** Stable id for the underlying control; bound by Field root. */
  id: string
  /** Optional human field name (for `name` attribute / error keys). */
  name?: string
  /** Reactive error message (empty/undefined when valid). */
  error: ComputedRef<string | undefined>
  /** Reactive `aria-describedby` value (joined hint+error ids). */
  describedBy: ComputedRef<string | undefined>
  /** Id of the hint element (registered by FieldHint). */
  hintId: string
  /** Id of the error element (registered by FieldError). */
  errorId: string
  /** Marks the hint slot as present (for aria-describedby). */
  registerHint: () => void
  /** Marks the error slot as present (for aria-describedby). */
  registerError: () => void
}

export const FIELD_CONTEXT_KEY: InjectionKey<FieldContext> = Symbol('FieldContext')
