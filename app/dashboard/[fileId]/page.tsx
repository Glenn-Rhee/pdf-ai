import { prisma } from "@/lib/prisma";
import ChatWrapper from "@/src/components/chat/ChatWrapper";
import WrapperPdf from "@/src/components/WrapperPdf";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import { UTApi } from "uploadthing/server";

interface FileDetailPageProps {
  params: Promise<{ fileId: string }>;
}

const utapi = new UTApi();

export default async function FileDetailPage(props: FileDetailPageProps) {
  const { params } = props;
  const fileId = (await params).fileId;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard/" + fileId);

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: user.id },
    select: { id: true, url: true, key: true },
  });

  const fileFounded = (await utapi.listFiles()).files.find(
    (fi) => fi.key === file?.key,
  );
  if (!file || !fileFounded) notFound();
  const fileName = fileFounded.name;
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100dvh-3.5rem)]">
      <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
        {/* left sidebar */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <WrapperPdf fileName={fileName} url={file.url} />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
  );
}
