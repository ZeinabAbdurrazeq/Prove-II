import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Loader2Icon,
  LockIcon,
  CheckCircle2Icon,
  XIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { subscriptionApi } from "../api/subscription";
import { PLANS } from "../data/plans";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function loadPaypalScript(clientId) {
  const scriptId = "paypal-js-sdk";
  const existingScript = document.getElementById(scriptId);

  if (window.paypal) return Promise.resolve(window.paypal);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.paypal), {
        once: true,
      });
      existingScript.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// PayPal Sandbox checkout. The backend creates and captures the order, then
// activates the app subscription only after PayPal confirms the capture.
function CheckoutModal({ planKey, onClose }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getTranslator(language);
  const plan = PLANS[planKey];
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalContainerRef = useRef(null);
  const buttonsRef = useRef(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoadingPaypal, setIsLoadingPaypal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderPaypalButtons() {
      if (!paypalClientId) {
        setError(t("checkout.paypalMissing"));
        return;
      }

      if (!paypalContainerRef.current || success) return;

      setIsLoadingPaypal(true);
      setError("");

      try {
        const paypal = await loadPaypalScript(paypalClientId);
        if (cancelled || !paypalContainerRef.current) return;

        paypalContainerRef.current.innerHTML = "";
        buttonsRef.current = paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
          createOrder: async () => {
            const data = await subscriptionApi.createPaypalOrder({ plan: planKey });
            return data.id;
          },
          onApprove: async (data) => {
            setIsCapturing(true);
            setError("");
            try {
              await subscriptionApi.capturePaypalOrder({
                plan: planKey,
                orderId: data.orderID,
              });
              if (!cancelled) setSuccess(true);
            } catch (err) {
              if (!cancelled) {
                setError(
                  err.response?.data?.message ||
                    err.response?.data?.msg ||
                    t("checkout.paypalError"),
                );
              }
            } finally {
              if (!cancelled) setIsCapturing(false);
            }
          },
          onCancel: () => {
            setError(t("checkout.paypalCancelled"));
          },
          onError: (err) => {
            console.error("PayPal checkout error:", err);
            setError(t("checkout.paypalError"));
          },
        });

        await buttonsRef.current.render(paypalContainerRef.current);
      } catch (err) {
        console.error("PayPal SDK load error:", err);
        if (!cancelled) setError(t("checkout.paypalLoadError"));
      } finally {
        if (!cancelled) setIsLoadingPaypal(false);
      }
    }

    renderPaypalButtons();

    return () => {
      cancelled = true;
      if (buttonsRef.current?.close) {
        buttonsRef.current.close().catch(() => {});
      }
    };
  }, [paypalClientId, planKey, success, language]);

  if (success) {
    return (
      <div className="modal modal-open">
        <div className="modal-box text-center">
          <CheckCircle2Icon className="size-20 mx-auto text-success mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            {t("checkout.welcome")} {t(plan.nameKey || plan.name)}!
          </h3>
          <p className="text-base-content/70 mb-6">
            {t("checkout.successMessage")}
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => navigate("/dashboard")}
          >
            {t("checkout.goToDashboard")}
          </button>
        </div>
        <div className="modal-backdrop" />
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 rtl:right-auto rtl:left-3"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </button>

        <div className="flex items-start gap-3 pr-8 rtl:flex-row-reverse rtl:pr-0 rtl:pl-8">
          <div className="rounded-lg bg-warning/15 p-3 text-warning">
            <LockIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-1">
              {t(plan.nameKey || plan.name)} {t("checkout.purchase")}
            </h3>
            <p className="text-sm text-base-content/70">
              {t("checkout.paypalSandbox")}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error my-4 py-2 text-sm">{error}</div>
        )}

        <div className="mt-5 rounded-lg border border-base-300 bg-base-200/70 p-4">
          <div className="flex items-center justify-between gap-4 rtl:flex-row-reverse">
            <div>
              <p className="font-semibold">{t(plan.nameKey || plan.name)}</p>
              <p className="text-sm text-base-content/60">
                {t(plan.billingKey || "pricing.perMonth")}
              </p>
            </div>
            <span className="text-2xl font-black">${plan.price.toFixed(2)}</span>
          </div>
          <div className="divider my-3" />
          <div className="flex items-center justify-between text-sm rtl:flex-row-reverse">
            <span className="text-base-content/70">{t("checkout.totalToday")}</span>
            <span className="font-bold">${plan.price.toFixed(2)} USD</span>
          </div>
        </div>

        <div className="mt-5 min-h-32">
          {(isLoadingPaypal || isCapturing) && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-base-content/70">
              <Loader2Icon className="size-4 animate-spin" />
              {isCapturing ? t("checkout.paypalCapturing") : t("checkout.paypalLoading")}
            </div>
          )}
          <div ref={paypalContainerRef} className={isCapturing ? "pointer-events-none opacity-50" : ""} />
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-base-content/50 mt-3 rtl:flex-row-reverse">
          <ShieldCheckIcon className="size-3" />
          {t("checkout.paypalSecure")}
        </p>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default CheckoutModal;
