import { redirect } from "@tanstack/react-router";
import { isAuthenticated } from "./auth";

export function requireAuth(): void {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    throw redirect({ to: "/login" });
  }
}
