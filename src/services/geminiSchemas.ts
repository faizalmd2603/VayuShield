import type {
  CommunityPlaybook,
  IndoorHack,
  RoutineStep,
  VayuShieldPlan,
} from '../types/gemini';

/**
 * Official Google Gemini structured JSON response schema.
 */
export const VAYUSHIELD_PLAN_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summaryAdvisory: {
      type: 'STRING',
      description: 'Overall executive guidance for the day based on live telemetry',
    },
    routines: {
      type: 'ARRAY',
      description: 'Time-blocked daily routines aligned to the live hourly smog curve',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          timeSlot: { type: 'STRING' },
          periodLabel: { type: 'STRING' },
          action: { type: 'STRING' },
          whyNow: { type: 'STRING' },
          lowEmissionAlternative: { type: 'STRING' },
          directImpact: {
            type: 'OBJECT',
            properties: {
              personalPm25ReductionUgm3: { type: 'NUMBER' },
              co2eAvoidedKg: { type: 'NUMBER' },
              healthBenefit: { type: 'STRING' },
            },
            required: ['personalPm25ReductionUgm3', 'co2eAvoidedKg', 'healthBenefit'],
          },
        },
        required: [
          'id',
          'timeSlot',
          'periodLabel',
          'action',
          'whyNow',
          'lowEmissionAlternative',
          'directImpact',
        ],
      },
    },
    indoorHacks: {
      type: 'ARRAY',
      description: 'Practical indoor air quality hacks and sustainable swaps',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          category: {
            type: 'STRING',
            enum: ['Zero-Cost', 'Low-Cost DIY', 'Appliance Optimization', 'Daily Swap'],
          },
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          directHealthImpact: { type: 'STRING' },
          directEmissionImpact: { type: 'STRING' },
          estimatedCost: { type: 'STRING' },
          effortLevel: {
            type: 'STRING',
            enum: ['Low', 'Medium', 'High'],
          },
          achCadrImprovement: { type: 'STRING' },
        },
        required: [
          'id',
          'category',
          'title',
          'description',
          'directHealthImpact',
          'directEmissionImpact',
          'estimatedCost',
          'effortLevel',
          'achCadrImprovement',
        ],
      },
    },
    communityPlaybook: {
      type: 'OBJECT',
      description: 'Collective protocol for RWAs, schools, or commuter groups',
      properties: {
        id: { type: 'STRING' },
        title: { type: 'STRING' },
        targetAudience: { type: 'STRING' },
        currentGrapContext: { type: 'STRING' },
        actionChecklist: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
        directCommunityImpact: { type: 'STRING' },
        advisoryNoticeText: { type: 'STRING' },
      },
      required: [
        'id',
        'title',
        'targetAudience',
        'currentGrapContext',
        'actionChecklist',
        'directCommunityImpact',
        'advisoryNoticeText',
      ],
    },
  },
  required: ['summaryAdvisory', 'routines', 'indoorHacks', 'communityPlaybook'],
} as const;

/**
 * Checks if a candidate is a valid RoutineStep.
 */
function isRoutineStep(item: unknown): item is RoutineStep {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  if (typeof c.id !== 'string' || typeof c.action !== 'string') return false;
  if (typeof c.directImpact !== 'object' || c.directImpact === null) return false;
  const imp = c.directImpact as Record<string, unknown>;
  return (
    typeof imp.personalPm25ReductionUgm3 === 'number' &&
    typeof imp.co2eAvoidedKg === 'number'
  );
}

/**
 * Checks if a candidate is a valid IndoorHack.
 */
function isIndoorHack(item: unknown): item is IndoorHack {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.category === 'string' &&
    typeof c.directHealthImpact === 'string'
  );
}

/**
 * Checks if a candidate is a valid CommunityPlaybook.
 */
function isCommunityPlaybook(item: unknown): item is CommunityPlaybook {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.title === 'string' &&
    typeof c.targetAudience === 'string' &&
    Array.isArray(c.actionChecklist) &&
    typeof c.advisoryNoticeText === 'string'
  );
}

/**
 * Strict runtime type guard verifying that parsed Gemini response conforms to VayuShieldPlan.
 *
 * @param obj Unknown parsed JSON
 * @returns True if payload matches VayuShieldPlan contract
 */
export function isValidVayuShieldPlan(obj: unknown): obj is VayuShieldPlan {
  if (typeof obj !== 'object' || obj === null) return false;
  const c = obj as Record<string, unknown>;

  if (typeof c.summaryAdvisory !== 'string') return false;
  if (!Array.isArray(c.routines) || !Array.isArray(c.indoorHacks)) return false;
  if (!isCommunityPlaybook(c.communityPlaybook)) return false;

  const routinesValid = c.routines.every(isRoutineStep);
  const hacksValid = c.indoorHacks.every(isIndoorHack);

  return routinesValid && hacksValid;
}
