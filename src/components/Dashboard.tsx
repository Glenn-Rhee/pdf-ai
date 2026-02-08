"use client";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const filesDummy = [
  {
    userId: "user_001",
    id: "file_001",
    name: "invoice_january.pdf",
    uploadStatus: "SUCCESS",
    url: "https://cdn.example.com/files/invoice_january.pdf",
    key: "files/invoice_january.pdf",
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-01-10T08:30:00Z",
  },
  {
    userId: "user_002",
    id: "file_002",
    name: "profile_photo.png",
    uploadStatus: "UPLOADING",
    url: "https://cdn.example.com/files/profile_photo.png",
    key: "files/profile_photo.png",
    createdAt: "2024-02-05T10:15:00Z",
    updatedAt: "2024-02-05T10:16:00Z",
  },
  {
    userId: "user_003",
    id: "file_003",
    name: "backup_february.zip",
    uploadStatus: "FAILED",
    url: "",
    key: "files/backup_february.zip",
    createdAt: "2024-02-20T14:00:00Z",
    updatedAt: "2024-02-20T14:01:00Z",
  },
  {
    userId: "user_004",
    id: "file_004",
    name: "presentation.pptx",
    uploadStatus: "SUCCESS",
    url: "https://cdn.example.com/files/presentation.pptx",
    key: "files/presentation.pptx",
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-01T09:05:00Z",
  },
  {
    userId: "user_005",
    id: "file_005",
    name: "report_final.docx",
    uploadStatus: "PROCESSING",
    url: "https://cdn.example.com/files/report_final.docx",
    key: "files/report_final.docx",
    createdAt: "2024-03-10T16:45:00Z",
    updatedAt: "2024-03-10T16:46:00Z",
  },
];

export default function Dashboard() {
  const [currDeletingFile, setCurrDeletingFile] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => utils.getUserFiles.invalidate(),
    onMutate: ({ id }) => setCurrDeletingFile(id),
    onSettled: () => setCurrDeletingFile(null),
  });

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>
        <UploadButton />
      </div>

      {/* Display user files */}
      {filesDummy && filesDummy.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {filesDummy
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((file) => (
              <li
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
                key={file.id}
              >
                <Link
                  href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-r from-amber-500 to bg-orange-500" />
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <p className="truncate text-lg font-medium text-zinc-900">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Mocked
                  </div>

                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    variant={"destructive"}
                    size={"sm"}
                    className="w-full text-red-500"
                  >
                    {currDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
}
