import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { MiddlewareConfig, NextRequest } from "next/server";

export default withAuth(async function proxy(req: NextRequest) {}, {
  publicPaths: ["/"],
});

export const config: MiddlewareConfig = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
