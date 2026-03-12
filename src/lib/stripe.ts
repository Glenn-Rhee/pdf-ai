import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";
import { PLANS } from "../config/stripe";
import { prisma } from "@/lib/prisma";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dataUser = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!dataUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dataUser.stripePriceId &&
    dataUser.stripeCurrentPeriodEnd &&
    dataUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now(),
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dataUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dataUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dataUser.stripeSubscriptionId,
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...plan,
    stripeSubscriptionId: dataUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dataUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dataUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
