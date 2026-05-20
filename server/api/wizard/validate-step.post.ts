import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { findStepById, validateStep } from '~~/shared/wizard/engine'
import { marsSteps } from '~~/shared/wizard/steps/mars'
import type { StepValidationResponse } from '~~/shared/wizard/types'

/**
 * Per-step server-side validation.
 *
 * The client owns wizard state (history, currentStep, accumulated values). On each
 * "Next" the client posts { stepId, values } here and the server returns either the
 * sanitized data (parsed by Zod) or field errors. The server does not store anything;
 * the source of truth for the recorded sequence is the client until finalize, which
 * re-validates the entire history.
 */
export default defineEventHandler(async (event): Promise<StepValidationResponse> => {
  const body = await readBody<{ stepId?: string; values?: unknown }>(event)
  const stepId = body?.stepId
  if (!stepId || typeof stepId !== 'string') {
    setResponseStatus(event, 400)
    return { ok: false, errors: { _: 'Missing stepId' } }
  }
  const found = findStepById(marsSteps, stepId)
  if (!found) {
    setResponseStatus(event, 400)
    return { ok: false, errors: { _: 'Unknown stepId' } }
  }
  const validation = validateStep(found.step, body?.values)
  if (!validation.success) {
    setResponseStatus(event, 422)
    return { ok: false, errors: validation.fieldErrors ?? {} }
  }
  return { ok: true, data: validation.data as Record<string, unknown> }
})
