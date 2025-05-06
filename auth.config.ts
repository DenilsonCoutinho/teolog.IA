import { createStripeCustomer } from "@/lib/stripe";
import { Typetheology, typetheology, User } from "@prisma/client";
import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google";
import { db as prisma } from "@/lib/db";
export default {
  providers: [Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }),],
  callbacks: {
    async jwt({ token }: { token: any }) {
      const user = await prisma.user.findFirst({
        where: { email: token.email },
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          emailVerified: true,
          hasCompletedQuestionnaire: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripeSubscriptionStatus: true,
          stripePriceId: true,
          stripeNamePlan: true,
          stripe_currency: true,
          stripePricePlan: true,
          is_current_period_end: true,
          stripe_current_period_end: true,
          typetheology: true
        },
      })

      token.id = user?.id
      token.name = user?.name
      token.image = user?.image
      token.email = user?.email
      token.typ = user?.email
      token.emailVerified = user?.emailVerified
      token.hasCompletedQuestionnaire = user?.hasCompletedQuestionnaire
      token.stripeCustomerId = user?.stripeCustomerId
      token.stripeSubscriptionId = user?.stripeSubscriptionId
      token.stripeSubscriptionStatus = user?.stripeSubscriptionStatus
      token.stripePriceId = user?.stripePriceId
      token.stripeNamePlan = user?.stripeNamePlan
      token.stripe_currency = user?.stripe_currency
      token.stripePricePlan = user?.stripePricePlan
      token.is_current_period_end = user?.is_current_period_end
      token.stripe_current_period_end = user?.stripe_current_period_end
      token.typetheology = user?.typetheology

      return token
    },
    session({ session, token }: { session: any, token: any }) {
      // session.user.id = token.id as string

      session.user.id = token.id
      session.user.name = token.name
      session.user.image = token.image
      session.user.email = token.email
      session.user.emailVerified = token.emailVerified
      session.user.hasCompletedQuestionnaire = token.hasCompletedQuestionnaire
      session.user.stripeCustomerId = token.stripeCustomerId
      session.user.stripeSubscriptionId = token.stripeSubscriptionId
      session.user.stripeSubscriptionStatus = token.stripeSubscriptionStatus
      session.user.stripePriceId = token.stripePriceId
      session.user.stripeNamePlan = token.stripeNamePlan
      session.user.stripe_currency = token.stripe_currency
      session.user.stripePricePlan = token.stripePricePlan
      session.user.is_current_period_end = token.is_current_period_end
      session.user.stripe_current_period_end = token.stripe_current_period_end
      session.user.typetheology = token.typetheology
      return session
    }

  },
  events: {
    createUser: async (message) => {
      await createStripeCustomer({
        name: message.user.name as string,
        email: message.user.email as string,
      })
    },
  }
} satisfies NextAuthConfig;