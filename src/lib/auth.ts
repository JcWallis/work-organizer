import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const expectedUsername = process.env.APP_USERNAME;
        const passwordHash = process.env.APP_PASSWORD_HASH;

        if (!expectedUsername || !passwordHash) return null;

        if (username !== expectedUsername) return null;

        const valid = await bcrypt.compare(password, passwordHash);
        if (!valid) return null;

        return { id: "1", name: username, email: `${username}@workspace` };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
