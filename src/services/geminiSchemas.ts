import type { CommunityPlaybook, IndoorHack, RoutineStep, VayuShieldPlan } from '../types/gemini';

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
 * Strips markdown code fences, removes trailing commas, and isolates JSON braces.
 */
export function cleanJsonString(raw: string): string {
  const trimmed = raw.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/g, '')
    .trim();
  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  const candidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? withoutFences.slice(firstBrace, lastBrace + 1)
      : withoutFences;
  return candidate.replace(/,\s*([}\]])/g, '$1');
}

/**
 * Attempts parsing with auto-repair of unclosed JSON braces/brackets.
 */
export function safeParseJsonPlan(text: string): unknown {
  const cleaned = cleanJsonString(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    let repaired = cleaned;
    let braces = 0;
    let brackets = 0;
    for (const ch of repaired) {
      if (ch === '{') braces++;
      else if (ch === '}') braces = Math.max(0, braces - 1);
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets = Math.max(0, brackets - 1);
    }
    while (brackets > 0) {
      repaired += ']';
      brackets--;
    }
    while (braces > 0) {
      repaired += '}';
      braces--;
    }
    return JSON.parse(repaired);
  }
}

function safeString(val: unknown, alt: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  if (typeof alt === 'string' && alt.trim().length > 0) return alt.trim();
  return fallback;
}

function parseImpactNumber(val: unknown, fallback: number): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const match = /[-+]?[0-9]*\.?[0-9]+/.exec(val);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return fallback;
}

function coerceCategory(cat: unknown): IndoorHack['category'] {
  if (typeof cat !== 'string') return 'Zero-Cost';
  const lower = cat.toLowerCase();
  if (lower.includes('diy') || lower.includes('low')) return 'Low-Cost DIY';
  if (lower.includes('appliance')) return 'Appliance Optimization';
  if (lower.includes('swap') || lower.includes('daily')) return 'Daily Swap';
  return 'Zero-Cost';
}

function coerceEffort(eff: unknown): IndoorHack['effortLevel'] {
  if (typeof eff !== 'string') return 'Low';
  const lower = eff.toLowerCase();
  if (lower.includes('high')) return 'High';
  if (lower.includes('med')) return 'Medium';
  return 'Low';
}

function coerceRoutineStep(r: Record<string, unknown>, i: number): RoutineStep {
  const imp =
    typeof r.directImpact === 'object' && r.directImpact !== null
      ? (r.directImpact as Record<string, unknown>)
      : {};
  return {
    id: safeString(r.id, undefined, `routine-${i + 1}`),
    timeSlot: safeString(r.timeSlot, r.time, '07:00 - 09:00'),
    periodLabel: safeString(r.periodLabel, r.label, 'Peak Inversion Window'),
    action: safeString(r.action, r.activity, 'Indoor air protection and filtration lock'),
    whyNow: safeString(r.whyNow, r.reason, 'High ground-level particulate concentration'),
    lowEmissionAlternative: safeString(
      r.lowEmissionAlternative,
      r.alternative,
      'Electric or mass transit commute'
    ),
    directImpact: {
      personalPm25ReductionUgm3: parseImpactNumber(
        imp.personalPm25ReductionUgm3 ?? r.personalImpactUgm3,
        35
      ),
      co2eAvoidedKg: parseImpactNumber(imp.co2eAvoidedKg ?? r.carbonImpactKg, 1.5),
      healthBenefit: safeString(imp.healthBenefit, r.healthBenefit, 'Reduced airway irritation'),
    },
  };
}

function coerceIndoorHack(h: unknown, i: number): IndoorHack {
  if (typeof h === 'string') {
    return {
      id: `hack-${i + 1}`,
      category: 'Zero-Cost',
      title: h.length > 35 ? `${h.slice(0, 35)}...` : h,
      description: h,
      directHealthImpact: 'Reduces particulate inhalation and household aerosol exposure',
      directEmissionImpact: 'Zero energy draw',
      estimatedCost: '₹0 / Free',
      effortLevel: 'Low',
      achCadrImprovement: '+1.2 ACH Infiltration Barrier',
    };
  }
  const obj = typeof h === 'object' && h !== null ? (h as Record<string, unknown>) : {};
  return {
    id: safeString(obj.id, undefined, `hack-${i + 1}`),
    category: coerceCategory(obj.category),
    title: safeString(obj.title, undefined, 'Door Draught Seal'),
    description: safeString(
      obj.description,
      obj.action,
      'Install silicone seals on entrance frames to curb ingress'
    ),
    directHealthImpact: safeString(
      obj.directHealthImpact,
      obj.healthImpact,
      'Reduces indoor PM2.5 infiltration by 35%'
    ),
    directEmissionImpact: safeString(
      obj.directEmissionImpact,
      obj.emissionImpact,
      'Zero added energy draw'
    ),
    estimatedCost: safeString(obj.estimatedCost, obj.cost, '₹0 / Free'),
    effortLevel: coerceEffort(obj.effortLevel),
    achCadrImprovement: safeString(
      obj.achCadrImprovement,
      obj.achImprovement,
      '+1.2 ACH Infiltration Barrier'
    ),
  };
}

function resolvePlaybookTarget(target: unknown): Record<string, unknown> {
  if (Array.isArray(target) && target.length > 0) {
    const first: unknown = target[0];
    return typeof first === 'object' && first !== null ? (first as Record<string, unknown>) : {};
  }
  return typeof target === 'object' && target !== null ? (target as Record<string, unknown>) : {};
}

function coerceCommunityPlaybook(target: unknown): CommunityPlaybook {
  if (Array.isArray(target) && target.length > 0) {
    const stringItems = target.filter((item): item is string => typeof item === 'string');
    if (stringItems.length > 0) {
      return {
        id: 'playbook-rwa',
        title: 'Community & RWA Anti-Smog Directive',
        targetAudience: 'Apartment residents, RWAs, schools',
        currentGrapContext: 'GRAP Mitigation Protocols Active',
        actionChecklist: stringItems,
        directCommunityImpact: 'Prevents 4+ kg particulate emissions across 500+ residents',
        advisoryNoticeText:
          'Official Winter Smog Advisory: Inversion conditions active. Please halt non-essential combustion and carpool.',
      };
    }
  }

  const obj = resolvePlaybookTarget(target);
  const list = Array.isArray(obj.actionChecklist) ? obj.actionChecklist : [];
  const checklist =
    list.length > 0
      ? list.filter((item): item is string => typeof item === 'string')
      : [
          'Halt diesel generators for non-essential common areas',
          'Implement mechanized wet-mop sweeping on society roads',
          'Establish clean air respite rooms in common areas',
        ];

  return {
    id: safeString(obj.id, undefined, 'playbook-rwa'),
    title: safeString(obj.title, undefined, 'Community & RWA Anti-Smog Directive'),
    targetAudience: safeString(
      obj.targetAudience,
      obj.audience,
      'Apartment residents, RWAs, schools'
    ),
    currentGrapContext: safeString(
      obj.currentGrapContext,
      obj.grapStage,
      'GRAP Mitigation Protocols Active'
    ),
    actionChecklist: checklist,
    directCommunityImpact: safeString(
      obj.directCommunityImpact,
      obj.communityImpact,
      'Prevents 4+ kg particulate emissions across 500+ residents'
    ),
    advisoryNoticeText: safeString(
      obj.advisoryNoticeText,
      obj.notice,
      'Official Winter Smog Advisory: Inversion conditions active. Please halt non-essential combustion and carpool.'
    ),
  };
}

function appendTimelineSteps(timeline: unknown[], list: Record<string, unknown>[]): void {
  for (const sub of timeline) {
    if (typeof sub === 'object' && sub !== null) {
      list.push(sub as Record<string, unknown>);
    }
  }
}

function extractRawRoutines(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  const list: Record<string, unknown>[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const o = item as Record<string, unknown>;
    if (Array.isArray(o.timeline) && o.timeline.length > 0) {
      appendTimelineSteps(o.timeline, list);
    } else {
      list.push(o);
    }
  }
  return list;
}

/**
 * Coerces and normalizes any raw parsed JSON into a strictly conforming VayuShieldPlan.
 */
export function coerceAndNormalizePlan(
  raw: unknown,
  locationName: string,
  modelUsed: string
): VayuShieldPlan {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid JSON input for plan');
  }
  const o = raw as Record<string, unknown>;
  const summary = safeString(
    o.summaryAdvisory,
    o.summary,
    'Action plan synchronized with live air quality telemetry.'
  );

  const rawRoutines = extractRawRoutines(o.routines);
  const routines =
    rawRoutines.length > 0 ? rawRoutines.map(coerceRoutineStep) : [coerceRoutineStep({}, 0)];

  const rawHacks = Array.isArray(o.indoorHacks) ? (o.indoorHacks as unknown[]) : [];
  const indoorHacks =
    rawHacks.length > 0 ? rawHacks.map(coerceIndoorHack) : [coerceIndoorHack({}, 0)];

  const communityPlaybook = coerceCommunityPlaybook(o.communityPlaybook);

  return {
    generatedAt: new Date().toISOString(),
    locationName,
    modelUsed,
    summaryAdvisory: summary,
    routines,
    indoorHacks,
    communityPlaybook,
  };
}

/**
 * Checks if a candidate is a valid RoutineStep.
 */
function isRoutineStep(item: unknown): item is RoutineStep {
  if (typeof item !== 'object' || item === null) return false;
  const c = item as Record<string, unknown>;
  if (typeof c.id !== 'string' || typeof c.action !== 'string') return false;
  if (typeof c.directImpact !== 'object' || c.directImpact === null) return false;
  const imp = c.directImpact as Record<string, unknown>;
  return typeof imp.personalPm25ReductionUgm3 === 'number' && typeof imp.co2eAvoidedKg === 'number';
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
