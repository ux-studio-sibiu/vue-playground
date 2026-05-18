<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldHint } from '@/components/ui/field'
import { ALLOWED_SKILLS_LIST, skillsSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'
import { Button } from '@/components/ui/button'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
  isSubmitting: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>]; back: [] }>()

const form = useStepForm(skillsSchema, () => ({ skills: [], ...props.initialValues }), () => props.serverErrors)

const selected = computed<string[]>(() => ((form.values as Record<string, unknown>).skills as string[] | undefined) ?? [])

function toggle(skill: string) {
  const set = new Set(selected.value)
  if (set.has(skill)) set.delete(skill)
  else set.add(skill)
  form.setFieldValue('skills' as never, Array.from(set) as never)
}

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-3" novalidate @submit="onSubmit">
    <Field name="skills" :error="form.errors.value.skills">
      <FieldHint>Pick at least three. The Council prefers oddly specific competencies.</FieldHint>
      <div class="grid grid-cols-2 gap-2">
        <label v-for="skill in ALLOWED_SKILLS_LIST" :key="skill" class="flex items-center gap-2 rounded border px-3 py-2">
          <Checkbox :model-value="selected.includes(skill)" @update:model-value="toggle(skill)" />
          <span class="text-sm">{{ skill }}</span>
        </label>
      </div>
      <FieldError />
    </Field>
  </form>
  <Teleport to="#wizard-footer-portal" defer>
    <div class="flex gap-2 px-6 py-4">
      <Button variant="btn-default" @click="$emit('back')">Back</Button>
      <Button variant="btn-primary" form="wizard-step-form" type="submit">Next</Button>
    </div>
  </Teleport>
</template>
