<script setup lang="ts">
import { computed } from 'vue'
import { ALLOWED_SKILLS_LIST, skillsSchema } from '../../../../shared/wizard/steps/mars'
import type { WizardFieldErrors } from '../../../../shared/wizard/types'
import { useStepForm } from '../../composables/useStepForm'

interface Props {
  initialValues: Record<string, unknown>
  serverErrors?: WizardFieldErrors
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

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
    <p class="text-sm text-muted-foreground">Pick at least three. The Council prefers oddly specific competencies.</p>
    <div class="grid grid-cols-2 gap-2">
      <label v-for="skill in ALLOWED_SKILLS_LIST" :key="skill" class="flex items-center gap-2 rounded border px-3 py-2">
        <input type="checkbox" :checked="selected.includes(skill)" @change="toggle(skill)" />
        <span class="text-sm">{{ skill }}</span>
      </label>
    </div>
    <p v-if="form.errors.value.skills" class="text-sm text-destructive">{{ form.errors.value.skills }}</p>
  </form>
</template>
