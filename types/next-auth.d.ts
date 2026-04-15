import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "OWNER" | "ADMIN" | "USER";
      ownerProfileId: string | null;
    };
  }

  interface User {
    role?: "OWNER" | "ADMIN" | "USER";
    ownerProfileId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "OWNER" | "ADMIN" | "USER";
    ownerProfileId?: string | null;
  }
}
