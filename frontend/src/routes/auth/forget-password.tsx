import ForgetPasswordForm from "@/components/form/forget-password-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/forget-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgetPasswordForm />;
}
