import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Loader2Icon,
  SparklesIcon,
  AlertTriangleIcon,
  XIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  GaugeIcon,
  CreditCardIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { subscriptionApi } from "../api/subscription";
import { PLANS } from "../data/plans";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function planBadgeClass(plan) {
  if (plan === "premium") return "badge-secondary";
  if (plan === "pro") return "badge-primary";
  if (plan === "singleInterview") return "badge-accent";
  return "badge-ghost";
}

function SubscriptionPage() {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const [showCancel, setShowCancel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: subscriptionApi.getMySubscription,
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionApi.cancelSubscription,
    onSuccess: () => {
      toast.success(t("subscription.cancelled"));
      queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
      setShowCancel(false);
    },
    onError: (error) =>
      toast.error(error.response?.data?.msg || t("subscription.cancelError")),
  });

  const subscription = data?.subscription;
  const planKey = subscription?.plan || "free";
  const plan = PLANS[planKey];
  const planNameKey = {
    free: "plans.freeName",
    singleInterview: "plans.singleInterviewName",
    premium: "plans.premiumName",
    pro: "plans.proName",
  };
  const planFeatureKey = (feature) => {
    const map = {
      free: {
        "Unlimited coding problems": "plans.free.feature1",
        "Unlimited live sessions": "plans.free.feature2",
        "Basic progress tracking": "plans.free.feature3",
        "AI interviews sold separately": "plans.free.feature4",
      },
      singleInterview: {
        "One CV-aware AI interview": "plans.singleInterview.feature1",
        "Detailed scorecard": "plans.singleInterview.feature2",
        "Role-focused questions": "plans.singleInterview.feature3",
        "Problems and sessions stay free": "plans.singleInterview.feature4",
      },
      premium: {
        "10 AI interviews per month": "plans.premium.feature1",
        "Unlimited CV re-uploads": "plans.premium.feature2",
        "Advanced analytics": "plans.premium.feature3",
        "Early access to new features": "plans.premium.feature4",
        "Priority support": "plans.premium.feature5",
      },
    };
    for (const key of Object.keys(map)) {
      if (map[key][feature]) return map[key][feature];
    }
    return null;
  };
  const isFree = planKey === "free";
  const used = subscription?.aiInterviewsUsedThisMonth || 0;
  const monthlyLimit = plan?.aiInterviewsPerMonth || 0;
  const credits = subscription?.aiInterviewCredits || 0;
  const remainingMonthly = Math.max(monthlyLimit - used, 0);
  const hasMonthlyLimit = monthlyLimit > 0;
  const hasInterviewAccess = hasMonthlyLimit ? remainingMonthly > 0 : credits > 0;
  const isCancelled = subscription?.status === "cancelled";
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const formattedPeriodEnd = periodEnd ? format(periodEnd, "M/d/yyyy") : "";
  const planStatusLine =
    isCancelled && formattedPeriodEnd
      ? `${t(planNameKey[planKey])} ${t("subscription.until")} ${formattedPeriodEnd}`
      : subscription?.status || "active";

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
              {t("subscription.overview")}
            </p>
            <h1 className="mt-2 text-3xl font-black">{t("subscription.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-base-content/60">
              {t("subscription.description")}
            </p>
          </div>
          <Link to="/pricing" className="btn btn-primary gap-2 self-start lg:self-auto rtl:flex-row-reverse">
            <SparklesIcon className="size-4" />
            {t("subscription.viewPricing")}
            <ArrowRightIcon className="size-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-6">
            {isLoading ? (
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body items-center justify-center py-20">
                  <Loader2Icon className="size-10 animate-spin text-primary" />
                </div>
              </div>
            ) : (
              <div className="card overflow-hidden bg-base-100 border border-base-300 shadow-sm">
                <div className="bg-base-200/70 px-6 py-5">
                  <div className="flex items-start justify-between gap-4 rtl:flex-row-reverse">
                    <div>
                      <p className="text-sm text-base-content/60">
                        {t("subscription.currentPlan")}
                      </p>
                      <div className="flex items-center gap-2 mt-1 rtl:flex-row-reverse">
                        <span className="text-2xl font-black">{t(planNameKey[planKey])}</span>
                        <span className={`badge ${planBadgeClass(planKey)}`}>
                          {planStatusLine}
                        </span>
                      </div>
                    </div>
                    {plan && (
                      <div className="text-right rtl:text-left">
                        <p className="text-2xl font-black">${plan.price.toFixed(2)}</p>
                        <p className="text-xs text-base-content/55">
                          {t(plan.billingKey || "pricing.perMonth")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-body space-y-5 p-6">
                  {subscription?.currentPeriodEnd && (
                    <div className="rounded-lg border border-base-300 bg-base-200/60 p-4">
                      <div className="flex items-center gap-3 rtl:flex-row-reverse">
                        <CalendarClockIcon className="size-5 text-primary" />
                        <div>
                          <p className="text-sm text-base-content/60">
                            {isCancelled
                              ? t("subscription.accessUntil")
                              : t("subscription.renews")}
                          </p>
                          <p className="mt-1 font-bold">
                            {format(periodEnd, "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-base-300 bg-base-100 p-4">
                    <div className="flex items-center gap-3 rtl:flex-row-reverse">
                      <GaugeIcon className="size-5 text-secondary" />
                      <div>
                        <p className="font-bold">{t("subscription.interviewLimit")}</p>
                        <p className="text-sm text-base-content/60">
                          {hasMonthlyLimit
                            ? t("subscription.monthlyAllowance")
                            : t("subscription.creditAllowance")}
                        </p>
                      </div>
                    </div>

                    {hasMonthlyLimit ? (
                      <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1 rtl:flex-row-reverse">
                        <span className="text-base-content/60">
                          {t("subscription.usage")}
                        </span>
                        <span className="font-medium">{used} / {monthlyLimit}</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={Math.min(used, monthlyLimit)}
                        max={monthlyLimit}
                      />
                        <p className={`mt-2 text-sm font-semibold ${remainingMonthly ? "text-success" : "text-error"}`}>
                          {remainingMonthly
                            ? `${remainingMonthly} ${t("subscription.interviewsRemaining")}`
                            : t("subscription.limitReached")}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-base-200/70 p-3">
                          <p className="text-xs text-base-content/60">
                            {t("subscription.credits")}
                          </p>
                          <p className="mt-1 text-2xl font-black">{credits}</p>
                        </div>
                        <div className="rounded-lg bg-base-200/70 p-3">
                          <p className="text-xs text-base-content/60">
                            {t("subscription.status")}
                          </p>
                          <p className={`mt-1 text-sm font-bold ${hasInterviewAccess ? "text-success" : "text-error"}`}>
                            {hasInterviewAccess
                              ? t("subscription.ready")
                              : t("subscription.noInterviewAccess")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-base-300 bg-base-200/60 p-4">
                    <div className="flex items-center gap-3 rtl:flex-row-reverse">
                      <CreditCardIcon className="size-5 text-accent" />
                      <div>
                        <p className="text-sm text-base-content/60">
                          {t("subscription.credits")}
                        </p>
                        <p className="mt-1 text-2xl font-black">{credits}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    {planKey !== "premium" || isCancelled ? (
                      <Link to="/pricing" className="btn btn-primary gap-2 rtl:flex-row-reverse">
                        <SparklesIcon className="size-4" />
                        {t("subscription.upgrade")}
                      </Link>
                    ) : null}

                    {!isFree && subscription?.status === "active" && (
                      <button
                        className="btn btn-ghost text-error"
                        onClick={() => setShowCancel(true)}
                      >
                        {t("subscription.cancel")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="space-y-6">
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-6">
                  <h2 className="text-lg font-bold">{t("subscription.planFeatures")}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {plan?.features?.map((feature) => (
                      <div
                        key={feature}
                        className="rounded-lg border border-base-300 bg-base-200/60 p-4 text-sm text-base-content/80"
                      >
                        {t(planFeatureKey(feature) || feature)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body p-6">
                    <h3 className="font-bold">{t("subscription.upgradePath")}</h3>
                    <p className="mt-2 text-sm text-base-content/60">
                      {t("subscription.upgradePathBody")}
                    </p>
                    <Link to="/pricing" className="btn btn-outline btn-sm mt-4 gap-2 rtl:flex-row-reverse">
                      {t("subscription.viewPricing")}
                      <ArrowRightIcon className="size-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body p-6">
                    <h3 className="font-bold">{t("subscription.needReset")}</h3>
                    <p className="mt-2 text-sm text-base-content/60">
                      {t("subscription.needResetBody")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )} 
        </div>
      </div>

      {/* CANCEL CONFIRMATION */}
      {showCancel && (
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
              onClick={() => setShowCancel(false)}
            >
              <XIcon className="size-4" />
            </button>
            <div className="flex items-start gap-3 rtl:flex-row-reverse rtl:text-right">
              <AlertTriangleIcon className="size-6 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg">{t("subscription.cancelConfirm")}</h3>
                <p className="text-sm text-base-content/70 mt-1">
                  {t("subscription.cancelNote")}
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowCancel(false)}
              >
                {t("subscription.keepPlan")}
              </button>
              <button
                className="btn btn-error gap-2 rtl:flex-row-reverse"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && (
                  <Loader2Icon className="size-4 animate-spin" />
                )}
                {t("subscription.cancel")}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" />
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;
