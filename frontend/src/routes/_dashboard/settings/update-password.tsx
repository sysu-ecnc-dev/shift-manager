import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/update-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/settings/accounts"!</div>;
}
