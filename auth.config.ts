import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google";

export default {
  providers: [Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  })],
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
        
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    }
  }
} satisfies NextAuthConfig;