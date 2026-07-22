import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "");
        const password = String(credentials?.password ?? "");
        const expectedUsername = process.env.ADMIN_USERNAME;
        const expectedHash = process.env.ADMIN_PASSWORD_HASH;

        if (!expectedUsername || !expectedHash) return null;
        if (username !== expectedUsername) return null;

        const valid = await bcrypt.compare(password, expectedHash);
        if (!valid) return null;

        return { id: "admin", name: "Admin", email: undefined };
      },
    }),
  ],
});
