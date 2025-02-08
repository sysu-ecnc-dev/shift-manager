import { getMyInfo } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { toast } from "sonner";

export default function BlackCoreGuard({ children }: PropsWithChildren) {
  const {
    data: myInfo,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-info"],
    queryFn: () => getMyInfo().then((res) => res.data.data),
  });

  if (isPending) return null;

  if (isError) {
    toast.error(error.message);
    return null;
  }

  if (myInfo.role !== "黑心") {
    return null;
  }

  return <>{children}</>;
}
