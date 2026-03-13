import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import HeaderPricing from "@/src/components/HeaderPricing";
import MaxWidthWrapper from "@/src/components/MaxWidthWrapper";
import UpgradeButton from "@/src/components/UpgradeButton";
import { PLANS } from "@/src/config/stripe";
import { pricingItems } from "@/src/utils/pricing-items";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

export default async function PricingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <HeaderPricing />
        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map((item) => {
              const price =
                PLANS.find(
                  (p) => p.slug.toLowerCase() === item.plan.toLowerCase(),
                )?.price.amount || 0;
              return (
                <div
                  key={item.plan}
                  className={cn("relative rounded-2xl shadow-lg bg-white ", {
                    "border-2 border-orange-600 shadow-blue-200":
                      item.plan === "Pro",
                    "border border-gray-200": item.plan !== "Pro",
                  })}
                >
                  {item.plan === "Pro" && (
                    <div className="absolute -top-5 z-10 left-0 right-0 mx-auto w-32 rounded-full bg-linear-to-r from-orange-600 to-amber-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade Now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="my-3 text-center text-3xl font-bold">
                      {item.plan}
                    </h3>
                    <p className="text-gray-500">{item.tagline}</p>
                    <p className="my-5 text-6xl font-semibold">
                      {price.toFixed(2)}
                    </p>
                    <p className="text-gray-500">per month</p>
                  </div>

                  <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <p>{item.quota.toLocaleString()} PDFs/mo included</p>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                          <HelpCircle className="h-4 w-4 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          How many PDFs you can upload per month
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {item.features.map((feature) => (
                      <li key={feature.text} className="flex space-x-5">
                        <div className="shring-0">
                          {feature.negative ? (
                            <Minus className="h-6 w-6 text-gray-300" />
                          ) : (
                            <Check className="h-6 w-6 text-orange-500" />
                          )}
                        </div>
                        {feature.footnote ? (
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-gray-400", {
                                "text-gray-600": feature.negative,
                              })}
                            >
                              {feature.text}
                            </p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="cursor-default ml-1.5">
                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {feature.footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p
                            className={cn("text-gray-400", {
                              "text-gray-600": feature.negative,
                            })}
                          >
                            {feature.text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                    {item.plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Upgrade Now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href={"/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {user ? "Upgrade Now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
