import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

console.log('ENV CHECK:', {
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  DATABASE_URL_PREFIX: process.env.DATABASE_URL?.slice(0, 30),
  DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };