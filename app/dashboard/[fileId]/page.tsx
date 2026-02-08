import { prisma } from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface FileDetailPageProps {
  params: Promise<{ fileId: string }>;
}

export default async function FileDetailPage(props: FileDetailPageProps) {
  const { params } = props;
  const fileId = (await params).fileId;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard/" + fileId);

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
  });

  if (!file) notFound();
  return <h1 className="text-zinc-900">{fileId}</h1>;
}
