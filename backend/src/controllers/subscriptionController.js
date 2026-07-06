import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { PLANS } from "../lib/plans.js";
import { sendSubscriptionEmail } from "../lib/email.js";
import { capturePaypalOrder, createPaypalOrder } from "../lib/paypal.js";

// Last day of the month for a given date (end of current billing period
// for the auto-created free plan).
function lastDayOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// Same day next month (used for paid plan periods).
function sameDayNextMonth(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

async function findOrCreateSubscription(userId) {
  let subscription = await Subscription.findOne({ userId });
  if (!subscription) {
    const now = new Date();
    subscription = await Subscription.create({
      userId,
      plan: "free",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: lastDayOfMonth(now),
      aiInterviewsUsedThisMonth: 0,
      aiInterviewsLimit: 0,
      aiInterviewCredits: 0,
    });
  }
  return subscription;
}

async function activatePaidPlan(userId, plan) {
  const now = new Date();
  const newPeriodEnd = sameDayNextMonth(now);
  let subscription;

  if (plan === "singleInterview") {
    subscription = await findOrCreateSubscription(userId);
    subscription.aiInterviewCredits = (subscription.aiInterviewCredits || 0) + 1;
    subscription.status = "active";
    await subscription.save();
  } else {
    const aiInterviewsLimit = PLANS[plan].aiInterviewsPerMonth || 0;

    subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        aiInterviewsLimit,
        aiInterviewsUsedThisMonth: 0,
        cancelledAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // Send a purchase confirmation email (non-blocking; never fails the request).
  try {
    const user = await User.findById(userId).select("name email");
    if (user?.email) {
      await sendSubscriptionEmail(user.email, {
        name: user.name,
        planName: PLANS[plan].name,
        price: PLANS[plan].price,
        billingLabel: plan === "singleInterview" ? "one time" : "month",
        currentPeriodEnd: plan === "singleInterview" ? null : newPeriodEnd,
      });
    }
  } catch (emailError) {
    console.error(
      "Failed to send subscription email:",
      emailError?.message || emailError,
    );
  }

  return subscription;
}

export async function getMySubscription(req, res) {
  try {
    const subscription = await findOrCreateSubscription(req.user._id);
    res.status(200).json({ subscription });
  } catch (error) {
    console.error("Error in getMySubscription Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function createPaypalCheckoutOrder(req, res) {
  try {
    const { plan } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    if (plan === "free") {
      return res.status(400).json({ msg: "Free plan does not require payment" });
    }

    const order = await createPaypalOrder({ planKey: plan, plan: PLANS[plan] });
    res.status(201).json({ id: order.id });
  } catch (error) {
    console.error("Error in createPaypalCheckoutOrder Controller:", error.message);
    res.status(error.status || 500).json({
      msg: error.status ? error.message : "Internal Server Error",
    });
  }
}

export async function capturePaypalCheckoutOrder(req, res) {
  try {
    const { plan, orderId } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    if (!orderId) {
      return res.status(400).json({ msg: "Missing PayPal order id" });
    }

    if (plan === "free") {
      return res.status(400).json({ msg: "Free plan does not require payment" });
    }

    const capture = await capturePaypalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return res.status(402).json({
        message: "PayPal payment was not completed",
        paypalStatus: capture.status,
      });
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const capturedAmount =
      purchaseUnit?.payments?.captures?.[0]?.amount?.value;
    const capturedCurrency =
      purchaseUnit?.payments?.captures?.[0]?.amount?.currency_code;
    const capturedPlan = purchaseUnit?.custom_id || purchaseUnit?.reference_id;
    const expectedAmount = Number(PLANS[plan].price).toFixed(2);

    if (
      capturedPlan !== plan ||
      capturedCurrency !== "USD" ||
      capturedAmount !== expectedAmount
    ) {
      return res.status(400).json({ msg: "PayPal amount did not match plan" });
    }

    const subscription = await activatePaidPlan(req.user._id, plan);

    res.status(200).json({
      subscription,
      paypalOrderId: capture.id,
      message: `Payment successful. Welcome to ${PLANS[plan].name}!`,
    });
  } catch (error) {
    console.error("Error in capturePaypalCheckoutOrder Controller:", error.message);
    res.status(error.status || 500).json({
      msg: error.status ? error.message : "Internal Server Error",
    });
  }
}

export async function simulatePayment(req, res) {
  try {
    const { plan, cardNumber } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ msg: "Invalid plan" });
    }

    const card = String(cardNumber || "").replace(/\s+/g, "");

    // Simulated decline rules.
    if (card.endsWith("0000") || card === "4000000000000002") {
      return res.status(402).json({
        message: "Payment declined. Your card was declined",
        declineCode: "card-declined",
      });
    }

    // Simulated success: Visa (4xxx) or Mastercard (5xxx).
    if (!(card.startsWith("4") || card.startsWith("5"))) {
      return res.status(402).json({
        message: "Payment declined. Your card was declined",
        declineCode: "card-declined",
      });
    }

    if (plan === "free") {
      return res.status(400).json({ msg: "Free plan does not require payment" });
    }

    const subscription = await activatePaidPlan(req.user._id, plan);

    res.status(200).json({
      subscription,
      message: `Payment successful. Welcome to ${PLANS[plan].name}!`,
    });
  } catch (error) {
    console.error("Error in simulatePayment Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const now = new Date();

    // Cancelling reverts the user to the free plan straight away: an active
    // free plan with the free monthly allowance, rather than leaving a
    // "cancelled pro" record around.
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        plan: "free",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: lastDayOfMonth(now),
        aiInterviewsLimit: 0,
        aiInterviewsUsedThisMonth: 0,
        cancelledAt: now,
      },
      { new: true },
    );

    if (!subscription)
      return res.status(404).json({ msg: "No subscription found" });

    res.status(200).json({
      subscription,
      msg: "Subscription cancelled. You are back on the Free plan.",
    });
  } catch (error) {
    console.error("Error in cancelSubscription Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function checkAiInterviewLimit(req, res) {
  try {
    const subscription = await findOrCreateSubscription(req.user._id);

    // Reset monthly usage if the billing period has passed.
    const now = new Date();
    if (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd) {
      subscription.aiInterviewsUsedThisMonth = 0;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = lastDayOfMonth(now);
      await subscription.save();
    }

    const hasMonthlyPlan = subscription.plan === "premium" || subscription.plan === "pro";
    const monthlyLimit = hasMonthlyPlan
      ? subscription.aiInterviewsLimit > 0
        ? subscription.aiInterviewsLimit
        : 10
      : 0;

    if (
      hasMonthlyPlan &&
      subscription.aiInterviewsUsedThisMonth < monthlyLimit
    ) {
      return res.status(200).json({ canProceed: true });
    }

    if ((subscription.aiInterviewCredits || 0) > 0) {
      return res.status(200).json({ canProceed: true });
    }

    return res.status(200).json({
      canProceed: false,
      message: "Buy one AI interview for $10 or upgrade to Premium for 10 interviews per month",
      upgradeRequired: true,
    });
  } catch (error) {
    console.error("Error in checkAiInterviewLimit Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

// Increment monthly AI interview usage for the current user.
// TODO: Connect to AI Interview start endpoint when feature is built
export async function incrementAiInterviewUsage(req, res) {
  try {
    const subscription = await findOrCreateSubscription(req.user._id);
    if (
      (subscription.plan === "premium" || subscription.plan === "pro") &&
      subscription.aiInterviewsUsedThisMonth <
        (subscription.aiInterviewsLimit > 0 ? subscription.aiInterviewsLimit : 10)
    ) {
      subscription.aiInterviewsUsedThisMonth += 1;
    } else if ((subscription.aiInterviewCredits || 0) > 0) {
      subscription.aiInterviewCredits -= 1;
    }
    await subscription.save();
    res.status(200).json({ subscription });
  } catch (error) {
    console.error("Error in incrementAiInterviewUsage Controller:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
