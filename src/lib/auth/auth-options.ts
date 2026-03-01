import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "../db/mongo";
import User from "@/src/models/User";
import { findUserByEmailInsensitive } from "@/src/lib/db/user";
import { loginSchema } from "../validators/auth.schema";
import clientPromise from "../db/mongoClient";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          image: user.image || null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days 
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // ✅ keep JWT in sync
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image || token.picture;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;

        const fallbackAvatar = "/default-avatar.svg";
        let dbImage: string | undefined;

        if (token.email) {
          await connectDB();
          const dbUser = await findUserByEmailInsensitive(String(token.email));
          dbImage = dbUser?.image;
        }

        session.user.image = dbImage || (token.picture as string | undefined) || fallbackAvatar;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow same-origin URLs EXCEPT auth pages
      if (url.startsWith(baseUrl)) {
        const path = url.replace(baseUrl, "");
        if (path.startsWith("/login") || path.startsWith("/register")) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }

      // Fallback
      return `${baseUrl}/dashboard`;
    }

  },

  secret: process.env.NEXTAUTH_SECRET,
};
