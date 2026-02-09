import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { MiddlewareConfig, NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default withAuth(async function proxy(_req: NextRequest) {}, {
  publicPaths: ["/"],
});

export const config: MiddlewareConfig = {
  matcher: [
    "/((?!api/uploadthing|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
