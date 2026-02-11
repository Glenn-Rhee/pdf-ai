"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PdfRendererProps } from "./WrapperPdf";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfRenderer(props: PdfRendererProps) {
  const { url } = props;
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">top</div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <div>
          <Document
            file={url}
            loading={
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
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
            <Page pageNumber={1} />
          </Document>
        </div>
      </div>
    </div>
  );
}
