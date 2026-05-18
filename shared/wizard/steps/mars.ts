import { z } from 'zod'
import type { WizardStepDef } from '../types'

/* ------------------------------------------------------------------ *
 *  Step schemas (the source of truth for both client & server)
 * ------------------------------------------------------------------ */

export const identitySchema = z.object({
  // TEMP(dev): relaxed validation so we can skip to step 2 quickly. Restore the
  // strict rules below before merging.
  fullName: z.string().optional(),
  martianAlias: z.string().optional(),
  // fullName: z
  //   .string()
  //   .min(2, 'Earth name must be at least 2 characters')
  //   .max(80),
  // martianAlias: z
  //   .string()
  //   .min(3, 'A proper Martian alias is at least 3 characters')
  //   .regex(/^[A-Z]/, 'Martian aliases must begin with a capital letter (regulation 7.3.2)'),
})

export interface SeatDef {
  /** Seat id, e.g. "3B". */
  id: string
  /** SVG x coordinate of the rect. */
  x: number
  /** SVG y coordinate of the rect. */
  y: number
}

export const SEATS: readonly SeatDef[] = [
  // Row A (top)
  { id: '1A', x: 266, y: 164 },
  { id: '2A', x: 308, y: 164 },
  { id: '3A', x: 350, y: 164 },
  { id: '4A', x: 392, y: 164 },
  { id: '5A', x: 434, y: 164 },
  { id: '6A', x: 474, y: 164 },
  { id: '8A', x: 513, y: 164 },
  // Row B (middle)
  { id: '1B', x: 266, y: 218 },
  { id: '2B', x: 308, y: 218 },
  { id: '3B', x: 350, y: 218 },
  { id: '4B', x: 392, y: 218 },
  { id: '5B', x: 434, y: 218 },
  { id: '7B', x: 474, y: 218 },
  { id: '8B', x: 513, y: 218 },
  // Row C (bottom)
  { id: '1C', x: 266, y: 274 },
  { id: '2C', x: 308, y: 274 },
  { id: '3C', x: 350, y: 274 },
  { id: '4C', x: 392, y: 274 },
  { id: '5C', x: 434, y: 274 },
  { id: '7C', x: 474, y: 274 },
  { id: '8C', x: 513, y: 274 },
] as const

const SEAT_IDS = SEATS.map((s) => s.id)
const seatIdSet = new Set(SEAT_IDS)

export const bloodTypeSchema = z.object({
  bloodType: z
    .enum(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], {
      errorMap: () => ({ message: 'Select a recognized blood type' }),
    })
    .refine((v) => v === 'O-', {
      message: 'Mars only accepts universal donors. O-negative or stay home.',
    }),
  seat: z
    .string({ required_error: 'Pick a seat' })
    .refine((v) => seatIdSet.has(v), { message: 'Pick a seat from the cabin map' }),
})

export const dependentsSchema = z.object({
  hasFamily: z.boolean(),
})

export const familyDetailsSchema = z.object({
  members: z
    .array(
      z.object({
        name: z.string().min(1, 'Required'),
        role: z.enum(['spouse', 'child', 'parent', 'sentient-pet']),
      }),
    )
    .min(1, 'List at least one dependent')
    .max(4, 'The escape pod fits 4 dependents maximum'),
})

const ALLOWED_SKILLS = [
  'vacuum-welding',
  'hydroponic-improvisation',
  'low-g-yoga',
  'martian-poetry',
  'dust-storm-meditation',
  'regolith-baking',
  'cosmic-ray-juggling',
] as const

export const skillsSchema = z.object({
  skills: z
    .array(z.enum(ALLOWED_SKILLS))
    .min(3, 'Mars requires at least 3 exotic skills')
    .max(5),
})

export const escapeVelocitySchema = z.object({
  escapeVelocityKmS: z
    .number({ invalid_type_error: 'Enter a number' })
    .refine((v) => Math.abs(v - 11.2) < 0.001, {
      message: 'Earth escape velocity is exactly 11.2 km/s. Show your work.',
    }),
})

export const reviewSchema = z.object({
  acknowledgesNoReturn: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the one-way ticket clause' }),
  }),
  signature: z.string().min(2, 'Sign your name'),
})

/* ------------------------------------------------------------------ *
 *  Step graph (order + branching predicates)
 * ------------------------------------------------------------------ */

export const marsSteps: WizardStepDef[] = [
  {
    id: 'step-1-identity',
    schema: identitySchema,
    title: 'Identification',
    description: 'Tell the Interplanetary Council who you are.',
  },
  {
    id: 'step-2-blood-type',
    schema: bloodTypeSchema,
    title: 'Pre-flight Screening',
    description: 'Universal-donor verification and seat assignment.',
  },
  {
    id: 'step-3-dependents',
    schema: dependentsSchema,
    title: 'Dependents',
    description: 'Are you dragging anyone else through the stratosphere?',
  },
  {
    id: 'step-4-family-details',
    schema: familyDetailsSchema,
    when: (state) => {
      const dep = state['step-3-dependents'] as { hasFamily?: boolean } | undefined
      return dep?.hasFamily === true
    },
    title: 'Family Manifest',
    description: 'List every dependent. Sentient pets count.',
  },
  {
    id: 'step-5-skills',
    schema: skillsSchema,
    title: 'Exotic Skills',
    description: 'Select your contributions to the colony.',
  },
  {
    id: 'step-6-escape-velocity',
    schema: escapeVelocitySchema,
    title: 'Physics Quiz',
    description: 'A trivial verification of your engineering competence.',
  },
  {
    id: 'step-7-review',
    schema: reviewSchema,
    title: 'Final Acknowledgement',
    description: 'Sign and confirm. There is no return flight.',
  },
]

export const ALLOWED_SKILLS_LIST = ALLOWED_SKILLS
