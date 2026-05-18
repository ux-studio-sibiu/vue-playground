<script setup lang="ts">
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import { SEATS, bloodTypeSchema } from '../../../../shared/wizard/steps/mars'
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

const TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as const

const form = useStepForm(bloodTypeSchema, () => props.initialValues, () => props.serverErrors)
const [bloodType, bloodAttrs] = form.defineField('bloodType')
const [seat, seatAttrs] = form.defineField('seat')

function pickSeat(id: string) {
  form.setFieldValue('seat' as never, id as never)
}

function onSeatKey(event: KeyboardEvent, id: string) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    pickSeat(id)
  }
}

const onSubmit = form.handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form id="wizard-step-form" class="space-y-6" novalidate @submit="onSubmit">
    <Field name="bloodType" :error="form.errors.value.bloodType">
      <FieldLabel>Blood type</FieldLabel>
      <Select v-model="bloodType" v-bind="bloodAttrs">
        <option value="" disabled>Select…</option>
        <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
      </Select>
      <FieldError />
    </Field>

    <Field name="seat" :error="form.errors.value.seat">
      <FieldLabel>Choose your seat</FieldLabel>
      <p class="text-xs text-muted-foreground">
        {{ seat ? `Selected seat: ${seat}` : 'Tap a seat on the cabin map.' }}
      </p>

      <div class="rounded-lg border bg-muted/30 p-2">
        <svg viewBox="0 0 1077 458" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Cabin seat map" class="cabin-svg block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
          <!-- Ship outline -->
          <path d="M595 456H585L2 292V288.5H92.5V277.5H187V179H92.5V169.5H2V165L585 2H595L727.5 134.5V160H804.5V185L1059 190L1074.5 208V250L1059 266.5L804.5 272.5V298.5H721L727.5 322L595 456Z" class="cabin-hull" stroke-width="4" />
          <!-- Cabin areas -->
          <path d="M203.5 179V277.5H227V263.5H246.5V305H539V283H553.5V175.5H539V154.5H246.5V193.5H227V179H203.5Z" class="cabin-area" stroke-width="4" />
          <path d="M652 263.5H541V196H586H605L616 203V225H625.5V203L633 196H652V184H679.5V196H771.5V263.5H679.5V277.5H652V263.5Z" class="cabin-area" stroke-width="3" />
          <!-- Walkway -->
          <path opacity="0.34" d="M553.5 263.5H231.5V193.5H553.5V263.5Z" stroke="currentColor" stroke-width="2" fill="none" />

          <!-- Seats -->
          <g class="seats">
            <rect v-for="s in SEATS" :key="s.id" :x="s.x" :y="s.y" width="19" height="22" stroke-width="3" stroke-linejoin="bevel" class="seat" :class="{ 'is-selected': seat === s.id }" role="checkbox" tabindex="0" :aria-checked="seat === s.id" :aria-label="`Seat ${s.id}`" @click="pickSeat(s.id)" @keydown="onSeatKey($event, s.id)">
              <title>Seat {{ s.id }}</title>
            </rect>
          </g>
        </svg>
      </div>

      <input type="hidden" v-bind="seatAttrs" :value="seat ?? ''" />
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

<style scoped lang="scss">
.cabin-svg {
  color: hsl(var(--text-color-default));
}

.cabin-hull {
  fill: hsl(var(--surface-muted));
  stroke: hsl(var(--text-color-default));
}

.cabin-area {
  fill: hsl(var(--surface-default));
  stroke: hsl(var(--text-color-default));
}

.seat {
  fill: hsl(var(--surface-default));
  stroke: hsl(var(--text-color-default));
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 150ms ease, fill 150ms ease, stroke 150ms ease, filter 150ms ease;

  &:hover {
    fill: hsl(var(--color-accent));
  }

  &:focus-visible {
    outline: none;
    stroke: hsl(var(--ring));
    stroke-width: 4;
  }

  &.is-selected {
    fill: hsl(var(--color-primary));
    stroke: hsl(var(--color-primary));
    transform: scale(1.18);
    filter: drop-shadow(0 2px 6px hsl(var(--color-primary) / 0.5));
  }
}
</style>
