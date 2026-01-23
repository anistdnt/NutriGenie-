import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "../db/mongo";
import User from "@/src/models/User";
import { loginSchema } from "../validators/auth.schema";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1️⃣ Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2️⃣ DB connect
        await connectDB();

        // 3️⃣ Find user (explicitly select password)
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.password) return null;

        // 4️⃣ Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // 5️⃣ Return safe user object
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
