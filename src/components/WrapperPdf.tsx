"use client";
import dynamic from "next/dynamic";

export interface PdfRendererProps {
  url: string;
}

const PdfRenderer = dynamic<PdfRendererProps>(() => import("./PdfRenderer"), {
  ssr: false,
});

export default function WrapperPdf(props: PdfRendererProps) {
  const { url } = props;

  return <PdfRenderer url={url} />;
}
