import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/management/scheduling/$planId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/management/scheduling/$planId/"!</div>
}
