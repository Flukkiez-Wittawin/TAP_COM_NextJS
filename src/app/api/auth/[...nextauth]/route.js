import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUser } from "@/lib/saveUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user, account }) {
      // ยิงทุกครั้งที่ล็อกอินสำเร็จ (รวมครั้งแรก)
      const payload = {
        id: user?.id || null,
        name: user?.name || null,
        email: user?.email || null,
        image: user?.image || null,
        provider: account?.provider || "google",
      };
      upsertUser(payload);
      console.log("[NextAuth signIn] saved:", payload);
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) session.user.id = token?.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
