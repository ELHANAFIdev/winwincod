// src/lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // استخدام JWT للأداء العالي
  },
  pages: {
    signIn: "/login", // صفحة الدخول المخصصة
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البيانات غير مكتملة");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // التحقق من وجود المستخدم وهل حسابه مفعل
        if (!user || !user.isActive) {
          throw new Error("المستخدم غير موجود أو الحساب معطل");
        }

        // التحقق من كلمة المرور
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("كلمة المرور غير صحيحة");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // سنحتاج هذا الحقل لاحقاً
        };
      }
    })
  ],
  callbacks: {
    // 1. إضافة الدور إلى التوكن المشفر
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // 2. قراءة الدور من التوكن وإضافته للجلسة في المتصفح
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  }
};