import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

// PrismaAdapter runs createUser BEFORE the signIn callback fires.
// The schema default isActive:true would let new Google users bypass approval,
// so we override createUser to always start OAuth-created users as inactive.
const baseAdapter = PrismaAdapter(prisma);
const customAdapter: Adapter = {
  ...baseAdapter,
  createUser: async (data) => {
    return prisma.user.create({
      data: {
        name: data.name ?? "مستخدم Google",
        email: data.email,
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? null,
        role: "SELLER",
        isActive: false,
      },
    }) as any;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
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
        if (!credentials?.email || !credentials?.password) {
          console.log("[auth] authorize: missing credentials");
          throw new Error("البيانات غير مكتملة");
        }

        console.log("[auth] authorize: attempt for", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("[auth] authorize: user not found —", credentials.email);
          throw new Error("البريد أو كلمة المرور خاطئة");
        }

        if (!user.isActive) {
          console.log("[auth] authorize: account inactive —", credentials.email);
          throw new Error("حسابك قيد المراجعة");
        }

        if (!user.password) {
          console.log("[auth] authorize: no password (Google account) —", credentials.email);
          throw new Error("هذا الحساب مرتبط بـ Google، يرجى تسجيل الدخول بـ Google");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log("[auth] authorize: wrong password —", credentials.email);
          throw new Error("البريد أو كلمة المرور خاطئة");
        }

        console.log("[auth] authorize: success —", credentials.email, user.role);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        // By this point the adapter has already created/found the user in the DB.
        // Check isActive: new users were created with false (via customAdapter.createUser);
        // existing pending users are still false.
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isActive: true },
        });

        if (dbUser && !dbUser.isActive) {
          return "/login?error=PendingApproval";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, id: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
