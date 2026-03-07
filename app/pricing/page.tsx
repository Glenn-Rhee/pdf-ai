import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "@/src/components/MaxWidthWrapper";
import { PLANS } from "@/src/config/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { HelpCircle } from "lucide-react";

const pricingItems = [
  {
    plan: "Free",
    tagline: "For small side projects.",
    quota: 10,
    features: [
      {
        text: "5 pages per PDF",
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: "4MB file size limit",
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
        negative: true,
      },
      {
        text: "Priority support",
        negative: true,
      },
    ],
  },
  {
    plan: "Pro",
    tagline: "For larger projects with higher needs.",
    quota: PLANS.find((p) => p.slug === "pro")!.quota,
    features: [
      {
        text: "25 pages per PDF",
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: "16MB file size limit",
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
      },
      {
        text: "Priority support",
      },
    ],
  },
];

export default async function PricingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;vew got you covered.
          </p>
        </div>
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
                  className={cn("relative rounded-2xl shadow-lg bg-white overflow-hidden", {
                    "border-2 border-orange-600 shadow-blue-200":
                      item.plan === "Pro",
                    "border border-gray-200": item.plan !== "Pro",
                  })}
                >
                  {item.plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-linear-to-r from-orange-600 to-amber-600 px-3 py-2 text-sm font-medium text-white">
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
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
