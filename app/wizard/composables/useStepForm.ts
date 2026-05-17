import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import type { ZodTypeAny } from 'zod'
import type { WizardFieldErrors } from '../../../shared/wizard/types'

/**
 * Per-step VeeValidate wrapper.
 * - Validates locally with the same Zod schema the server uses (shared/).
 * - Reactively mirrors server-returned field errors into the form via setErrors.
 *
 * Note: vee-validate's deep-typed generics don't play well with the dynamic,
 * untyped `Record<string, unknown>` we ferry between client and server, so we
 * intentionally cast at the wrapper boundary and let each step component
 * recover types via its imported Zod schema.
 */
export function useStepForm<S extends ZodTypeAny>(
  schema: S,
  initialValues: () => Record<string, unknown>,
  serverErrors: () => WizardFieldErrors | undefined,
) {
  const form = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: initialValues() as never,
  })

  // When prefill changes (e.g. after Back), reset the form.
  watch(initialValues, (next) => {
    form.resetForm({ values: next as never })
  })

  // Surface server-side errors inline.
  watch(serverErrors, (errs) => {
    if (errs) form.setErrors(errs as never)
  })

  return form
}
