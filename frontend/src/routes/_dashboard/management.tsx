import BlackCoreGuard from '@/components/guard/black-core-guard'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/management')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <BlackCoreGuard>
      <Outlet />
    </BlackCoreGuard>
  )
}
