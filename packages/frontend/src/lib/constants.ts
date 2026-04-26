export const BADGE_VALUES = [
  'brain-wave',
  'calmer-of-storms',
  'cool-cucumber',
  'high-five',
  'juggler',
  'out-of-box',
  'rockstar',
] as const

export const PLAN_LIMITS = {
  FREE: { spotsPerMonth: 10 },
  PRO: { spotsPerMonth: Infinity },
  ENTERPRISE: { spotsPerMonth: Infinity },
} as const
