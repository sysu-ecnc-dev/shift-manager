import { getMyInfo } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PropsWithChildren } from "react";

export default function GuestOnlyGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  const { isSuccess, isPending } = useQuery({
    queryKey: ["my-info"],
    queryFn: () => getMyInfo().then((res) => res.data.data),
  });

  if (isPending) {
    return null;
  }

  if (isSuccess) {
    navigate({ to: "/", replace: true });
  }

  return children;
}
