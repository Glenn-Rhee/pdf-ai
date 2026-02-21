import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/src/config/infinite-query";

interface MessagesProps {
  fileId: string;
}

export default function Messages(props: MessagesProps) {
  const { fileId } = props;
  const {} = trpc.getFileMessages.useInfiniteQuery(
    {
      fileId,
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return <div></div>;
}
