import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create workspace — Zia" }] }),
  component: SignupRouteComponent,
});

function SignupRouteComponent() {
  return <Auth defaultMode="signup" />;
}
