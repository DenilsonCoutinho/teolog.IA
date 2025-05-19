import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { prisma } from "./prisma"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost:true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 60 ,
  },
	...authConfig,
  
})