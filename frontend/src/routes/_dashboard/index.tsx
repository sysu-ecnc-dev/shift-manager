import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4 flex flex-col gap-2 mt-8">
      <h1 className="text-2xl font-bold">主页</h1>
      <span className="text-sm text-muted-foreground">
        如果你看到这里一片空白，不用担心，目前主页没有任何内容 :)
      </span>
    </div>
  );
}
