import { prisma } from "@/lib/prisma";
import Dashboard from "@/src/components/Dashboard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dataUser = await prisma.user.findFirst({ where: { id: user.id } });
  if (!dataUser) redirect("/auth-callback?origin=dashboard");

  return <Dashboard />;
}
