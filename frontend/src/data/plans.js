// Frontend copy of the plan definitions (the browser cannot import the
// backend lib/plans.js). Keep in sync with backend/src/lib/plans.js.
export const PLANS = {
  free: {
    name: "Free",
    nameKey: "plans.freeName",
    price: 0,
    aiInterviewsPerMonth: 0,
    billingKey: "pricing.freeForever",
    features: [
      "Unlimited coding problems",
      "Unlimited live sessions",
      "Basic progress tracking",
      "AI interviews sold separately",
    ],
    recommended: false,
  },
  singleInterview: {
    name: "AI Interview",
    nameKey: "plans.singleInterviewName",
    price: 10,
    aiInterviewCredits: 1,
    billingKey: "pricing.perInterview",
    features: [
      "One CV-aware AI interview",
      "Detailed scorecard",
      "Role-focused questions",
      "Problems and sessions stay free",
    ],
    recommended: true,
  },
  premium: {
    name: "Premium",
    nameKey: "plans.premiumName",
    price: 70,
    aiInterviewsPerMonth: 10,
    billingKey: "pricing.perMonth",
    features: [
      "10 AI interviews per month",
      "Unlimited CV re-uploads",
      "Advanced analytics",
      "Early access to new features",
      "Priority support",
    ],
    recommended: false,
  },
  pro: {
    name: "Legacy Pro",
    nameKey: "plans.proName",
    price: 9.99,
    aiInterviewsPerMonth: 10,
    billingKey: "pricing.perMonth",
    features: ["Legacy paid plan"],
    recommended: false,
    hidden: true,
  },
};
