// Pricing product definitions. Keep in sync with frontend/src/data/plans.js.
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    aiInterviewsPerMonth: 0,
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
    price: 10,
    aiInterviewCredits: 1,
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
    price: 70,
    aiInterviewsPerMonth: 10,
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
    price: 9.99,
    aiInterviewsPerMonth: 10,
    features: ["Legacy paid plan"],
    recommended: false,
    hidden: true,
  },
};
