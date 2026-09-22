import { createFileRoute } from "@tanstack/react-router";
import { CrewApp } from "@/components/crew-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CrewApp />;
}
