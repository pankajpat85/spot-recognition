import { Request, Response, NextFunction } from 'express'
import type { OrgPlan } from '@prisma/client'

const PLAN_ORDER: Record<OrgPlan, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 }

export function planGate(required: OrgPlan) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPlan = req.user?.orgPlan ?? 'FREE'
    if (PLAN_ORDER[userPlan] < PLAN_ORDER[required]) {
      res.status(403).json({
        error: 'Plan upgrade required',
        code: 'PLAN_GATE',
        requiredPlan: required,
        currentPlan: userPlan,
      })
      return
    }
    next()
  }
}
