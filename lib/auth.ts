import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmailFromSupabase, verifyPasswordAgainstSupabaseUser } from "@/lib/supabase/data";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await getUserByEmailFromSupabase(credentials.email);

        if (!user) return null;
        if (!verifyPasswordAgainstSupabaseUser(user, credentials.password)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ownerProfileId: user.ownerProfileId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "OWNER" | "ADMIN" | "USER" }).role;
        token.ownerProfileId = (user as { ownerProfileId?: string | null }).ownerProfileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "OWNER" | "ADMIN" | "USER" | undefined) ?? "USER";
        session.user.ownerProfileId = (token.ownerProfileId as string | null | undefined) ?? null;
      }
      return session;
    }
  }
};
