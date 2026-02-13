"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import { Document, Page } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";

interface PagePdfProps {
  url: string;
  setNumPages: Dispatch<SetStateAction<number | undefined>>;
  rotation: number;
  scale: number;
  currPage: number;
  isLoading: boolean;
  renderedScale: number | null;
  setRenderedScale: Dispatch<SetStateAction<number | null>>;
}

export default function PagePdf(props: PagePdfProps) {
  const {
    url,
    setNumPages,
    rotation,
    scale,
    currPage,
    isLoading,
    renderedScale,
    setRenderedScale,
  } = props;
  const { width, ref } = useResizeDetector();

  return (
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
        {isLoading && renderedScale ? (
          <Page
            rotate={rotation}
            scale={scale}
            width={width || 1}
            pageNumber={currPage}
            key={"@" + renderedScale}
          />
        ) : null}

        <Page
          rotate={rotation}
          scale={scale}
          width={width || 1}
          pageNumber={currPage}
          className={cn(isLoading ? "hidden" : "")}
          key={"@" + scale}
          loading={
            <div className="fllex justify-center">
              <Loader2 className="my-24 h-6 w-6 animate-spin" />
            </div>
          }
          onRenderSuccess={() => setRenderedScale(scale)}
        />
      </Document>
    </div>
  );
}
