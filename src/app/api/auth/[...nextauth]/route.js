import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { saveGoogleUserFromProfile } from "@/lib/googleSaveUser";
// import { upsertUser } from "@/lib/saveUser";

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

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === "google") {
          // profile.sub = google unique id
          const sub = profile.sub;
          const email = profile.email;
          const fname = profile.given_name || "";
          const lname = profile.family_name || "";

          await saveGoogleUserFromProfile({ sub, email, fname, lname });
        }
        return true;
      } catch (err) {
        console.error("DB Save Error:", err);
        return false;
      }
    }
  },


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
      // upsertUser(payload);
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
