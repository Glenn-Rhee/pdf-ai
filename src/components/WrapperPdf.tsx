"use client";
import dynamic from "next/dynamic";

export interface PdfRendererProps {
  url: string;
  fileName: string;
}

const PdfRenderer = dynamic<PdfRendererProps>(() => import("./PdfRenderer"), {
  ssr: false,
});

export default function WrapperPdf(props: PdfRendererProps) {
  const { url, fileName } = props;

  return <PdfRenderer fileName={fileName} url={url} />;
}
