import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session;
}

function getRoleHome(role: "OWNER" | "ADMIN" | "USER") {
  if (role === "ADMIN") return "/admin";
  if (role === "OWNER") return "/owner";
  return "/account";
}

export async function requireRole(role: "OWNER" | "ADMIN" | "USER") {
  const session = await requireUser();
  if (session.user.role !== role) {
    redirect(getRoleHome(session.user.role));
  }
  return session;
}
