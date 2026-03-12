import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // تعريف شكل الجلسة (Session)
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // تعريف شكل المستخدم (User)
  interface User extends DefaultUser {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  // تعريف شكل التوكن (JWT)
  interface JWT {
    id: string;
    role: string;
  }
}