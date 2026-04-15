import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: "OWNER" | "ADMIN") {
  const session = await requireUser();
  if (session.user.role !== role) {
    redirect(role === "ADMIN" ? "/owner" : "/admin");
  }
  return session;
}
