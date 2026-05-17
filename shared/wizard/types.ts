import type { ZodTypeAny } from 'zod'

/**
 * Accumulated wizard answers keyed by step id.
 * Each step writes `state[step.id] = validatedValues`.
 */
export type WizardState = Record<string, unknown>

/**
 * A single step definition. Lives in `shared/` so both server and client can import it.
 * The same Zod schema is used by VeeValidate on the client and by the validate-step /
 * finalize endpoints on the server — single source of truth.
 */
export interface WizardStepDef<TSchema extends ZodTypeAny = ZodTypeAny> {
  id: string
  schema: TSchema
  /** Predicate decides whether this step is included given current state. Defaults to always-true. */
  when?: (state: WizardState) => boolean
  title?: string
  description?: string
}

/** Only step-shape data exposed to UI code. Schemas are never serialized. */
export interface WizardStepMeta {
  id: string
  title?: string
  description?: string
}

export interface WizardHistoryEntry {
  stepId: string
  values: Record<string, unknown>
}

/** Field-keyed error messages returned by the server on validation failure. */
export type WizardFieldErrors = Record<string, string>

/** Response from POST /api/wizard/validate-step — per-step server validation. */
export type StepValidationResponse =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: WizardFieldErrors }

/** Response from POST /api/wizard/finalize — whole-history replay + validation. */
export type FinalizeResponse =
  | { ok: true; submittedAt: number; payload: Record<string, unknown> }
  | { ok: false; reason: string; stepId?: string; errors?: WizardFieldErrors }
