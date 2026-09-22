import { createFileRoute } from "@tanstack/react-router";
import { DispatchApp } from "@/components/dispatch-app";

export const Route = createFileRoute("/dispatch")({ component: DispatchPage });

function DispatchPage() {
  return <DispatchApp />;
}
