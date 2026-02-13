"use client";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PdfRendererProps } from "./WrapperPdf";
import { ChevronDown, ChevronUp, RotateCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FileValidation from "../validation/File-Validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";
import PagePdf from "./PagePdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfRenderer(props: PdfRendererProps) {
  const { url, fileName } = props;
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
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
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
            variant={"ghost"}
            aria-label="previous-page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              maxLength={
                typeof numPages !== "undefined" ? `${numPages}`.length : 1
              }
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
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1,
              );
              setValue("page", String(currPage + 1));
            }}
            variant={"ghost"}
            aria-label="next-page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant={"ghost"}>
                <Search className="h-4 w-4" />
                {scale * 100}%<ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            aria-label="rotate 90 degrees"
            variant={"ghost"}
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <PdfFullscreen fileName={fileName}>
            {new Array(numPages).fill(0).map((_, i) => (
              <PagePdf
                key={i}
                currPage={currPage}
                rotation={rotation}
                scale={scale}
                setNumPages={setNumPages}
                url={url}
              />
            ))}
          </PdfFullscreen>
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100dvh-10rem)]">
          <PagePdf
            currPage={currPage}
            rotation={rotation}
            scale={scale}
            setNumPages={setNumPages}
            url={url}
          />
        </SimpleBar>
      </div>
    </div>
  );
}
