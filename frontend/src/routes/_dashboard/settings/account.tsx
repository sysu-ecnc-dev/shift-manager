import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/settings/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/settings/accounts"!</div>
}
