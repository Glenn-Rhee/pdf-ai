"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PdfRendererProps } from "./WrapperPdf";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FileValidation from "../validation/File-Validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfRenderer(props: PdfRendererProps) {
  const { url } = props;
  const { width, ref } = useResizeDetector();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const CustomPageValidator = FileValidation.getCustomPageValidator(numPages!);

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  function handlePageSubmit({ page }: TCustomPageValidator) {
    setCurrPage(Number(page));
    setValue("page", String(page));
  }

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currPage <= 1}
            onClick={() => setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))}
            variant={"ghost"}
            aria-label="previous-page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              className={cn(
                "w-12 h-8 text-center",
                errors.page && "focus-visible:outline-red-500",
              )}
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            disabled={typeof numPages === "undefined" || currPage === numPages}
            onClick={() =>
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1,
              )
            }
            variant={"ghost"}
            aria-label="next-page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <div ref={ref}>
          <Document
            file={url}
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() => {
              toast.error("Error load pdf! Please try again later.");
            }}
            error={
              <div className="flex justify-center">
                <p className="font-bold text-red-500 text-3xl my-20 text-center">
                  Error load pdf! Please try again later.
                </p>
              </div>
            }
            className={"max-h-full"}
          >
            <Page width={width || 1} pageNumber={currPage} />
          </Document>
        </div>
      </div>
    </div>
  );
}
