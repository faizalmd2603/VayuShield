/**
 * Google Gemini GenAI Contract & Schema Types.
 */

export interface RoutineStep {
  readonly id: string;
  readonly timeSlot: string;
  readonly periodLabel: string;
  readonly action: string;
  readonly whyNow: string;
  readonly lowEmissionAlternative: string;
  readonly directImpact: {
    readonly personalPm25ReductionUgm3: number;
    readonly co2eAvoidedKg: number;
    readonly healthBenefit: string;
  };
}

export interface IndoorHack {
  readonly id: string;
  readonly category: 'Zero-Cost' | 'Low-Cost DIY' | 'Appliance Optimization' | 'Daily Swap';
  readonly title: string;
  readonly description: string;
  readonly directHealthImpact: string;
  readonly directEmissionImpact: string;
  readonly estimatedCost: string;
  readonly effortLevel: 'Low' | 'Medium' | 'High';
  readonly achCadrImprovement: string;
}

export interface CommunityPlaybook {
  readonly id: string;
  readonly title: string;
  readonly targetAudience: string;
  readonly currentGrapContext: string;
  readonly actionChecklist: readonly string[];
  readonly directCommunityImpact: string;
  readonly advisoryNoticeText: string;
}

export interface VayuShieldPlan {
  readonly generatedAt: string;
  readonly locationName: string;
  readonly modelUsed: string;
  readonly summaryAdvisory: string;
  readonly routines: readonly RoutineStep[];
  readonly indoorHacks: readonly IndoorHack[];
  readonly communityPlaybook: CommunityPlaybook;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'model';
  readonly content: string;
  readonly timestamp: string;
  readonly impactCallout?: {
    readonly pm25Reduction?: string;
    readonly co2eAvoided?: string;
  };
}

export type GeminiModelName = 'gemini-3.5-flash-lite' | 'gemini-3.8-flash';
