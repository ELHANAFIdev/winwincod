// src/lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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

        // التحقق من وجود المستخدم
        if (!user) {
          throw new Error("البريد الإلكتروني أو كلمة المرور خطأ");
        }

        // التحقق من حالة الحساب
        if (!user.isActive) {
          throw new Error("حسابك قيد المراجعة ولم يتم تفعيله بعد من قبل الإدارة.");
        }

        // التحقق مما إذا كان المستخدم مسجلاً عبر Google ولا يملك كلمة مرور
        if (!user.password) {
          throw new Error("يرجى تسجيل الدخول باستخدام حساب Google الخاص بك.");
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
        token.isActive = user.isActive;
      }
      return token;
    },
    // 2. قراءة الدور من التوكن وإضافته للجلسة في المتصفح
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string || "SELLER"; // Default to SELLER for Google users
        session.user.id = token.id as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // إنشاء محفظة برصيد صفر للمستخدم الجديد المضاف عبر Google
      try {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 0.0,
          }
        });
      } catch (error) {
        console.error("Wallet creation error:", error);
      }
    }
  }
};