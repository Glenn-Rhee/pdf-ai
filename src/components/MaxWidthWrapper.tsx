interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}
export default function MaxWidthWrapper(props: MaxWidthWrapperProps) {
  const { children, className } = props;
  return (
    <div className="mx-auto w-full max-w-dvw px-2.5 md:px-20">{children}</div>
  );
}
