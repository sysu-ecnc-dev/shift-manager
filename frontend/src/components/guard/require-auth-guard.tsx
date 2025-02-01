import { getMyInfo } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PropsWithChildren } from "react";

export default function RequireAuthGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  const { isError, isPending } = useQuery({
    queryKey: ["my-info"],
    queryFn: () => getMyInfo().then((res) => res.data.data),
  });

  if (isPending) {
    return null;
  }

  if (isError) {
    navigate({ to: "/auth/login", replace: true });
  }

  return children;
}
