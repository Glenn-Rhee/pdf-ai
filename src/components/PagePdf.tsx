"use client";
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
}

export default function PagePdf(props: PagePdfProps) {
  const { url, setNumPages, rotation, scale, currPage } = props;
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
        <Page
          rotate={rotation}
          scale={scale}
          width={width || 1}
          pageNumber={currPage}
        />
      </Document>
    </div>
  );
}
