import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { saveGoogleUserFromProfile } from "@/lib/googleSaveUser";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
  }


};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
