import { buttonVariants } from "@/components/ui/button";
import BgDecoration from "@/src/components/BgDecoration";
import Featured from "@/src/components/Featured";
import MaxWidthWrapper from "@/src/components/MaxWidthWrapper";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center">
        <div className="mx-auto mb4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700">
            Quillbot is now public!
          </p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Chat with your <span className="text-orange-600">documents</span> in
          seconds.
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Quill allows you to have conversations with any PDF document. Simply
          upload your file and starrt asking questions right away.
        </p>
        <Link
          href={"/dashboard"}
          target="_blank"
          className={buttonVariants({ size: "lg", className: "mt-5" })}
        >
          Get started <ArrowRight className="ml-2" />
        </Link>
      </MaxWidthWrapper>
      {/* Value proporisiton section */}
      <BgDecoration />
      {/* Featured */}
      <Featured />
    </>
  );
}
