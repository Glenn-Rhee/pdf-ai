"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const query = trpc.authCallback.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (query.error?.data?.code === "UNAUTHORIZED") {
      router.push("/api/auth/login");
    }

    if (query.data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [origin, query.error, query.data, router]);

  return query.isLoading ? (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl ">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  ) : null;
}
