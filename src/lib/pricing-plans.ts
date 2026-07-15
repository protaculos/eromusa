// Pricing plans configuration - shared between API routes and client
export const PRICING_PLANS = {
  basic: { id: "basic", name: "Basic", price: 9.99, credits: 300 },
  plus: { id: "plus", name: "Plus", price: 29.99, credits: 1500 },
  prime: { id: "prime", name: "Prime", price: 49.99, credits: 3000 },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;