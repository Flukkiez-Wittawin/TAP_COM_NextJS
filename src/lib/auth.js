import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
          "SELECT * FROM Users WHERE email = ? AND password = ?",
          [credentials.email, credentials.password]
        );

        await connection.end();

        if (rows.length > 0) {
          return { id: rows[0].user_id, name: rows[0].fname };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub; // user_id เก็บใน session
      return session;
    },
  },
};

export default NextAuth(authOptions);
