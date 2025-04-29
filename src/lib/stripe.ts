import { config } from "@/config";
import Stripe from "stripe";
import { db as prisma } from "./db";
import { auth } from "../../auth";
export const stripe = new Stripe(config.stripe.secretKey ?? "", {
  apiVersion: '2025-03-31.basil',
  httpClient: Stripe.createFetchHttpClient(),
})

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email });
  return customers.data[0];
}

export const createStripeCustomer = async (input: {
  name?: string
  email: string
}) => {
  const customer = await getStripeCustomerByEmail(input.email)
  if (customer) return customer

  const createdCustomer = await stripe.customers.create({
    email: input.email,
    name: input.name,
  })

  // const createdCustomerSubscription = await stripe.subscriptions.create({
  //   customer: createdCustomer.id,
  //   items: [{ price: config.stripe.plans.premiumPriceId }],
  // })

  // await prisma.user.update({
  //   where: {
  //     email: input.email,
  //   },
  //   data: {
  //     stripeCustomerId: createdCustomer.id,
  //     stripeSubscriptionId: createdCustomerSubscription.id,
  //     stripeSubscriptionStatus: createdCustomerSubscription.status,
  //     stripePriceId: config.stripe.plans.premiumPriceId,
  //   },
  // })

  return createdCustomer
}
export const createCheckoutSession = async (userId: string, userEmail: string) => {
  try {

    let customer = await createStripeCustomer({
      email: userEmail
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: userId,
      customer: customer.id,
      success_url: `http://localhost:3000/bibleIA`,
      cancel_url: `http://localhost:3000/`,
      line_items: [{
        price: config.stripe.plans.premiumPriceId,
        quantity: 1
      }],
      metadata: { userId }
    });

    return {
      url: session.url
    }
  } catch (error) {
    console.error(error)
    throw new Error('Error to create checkout session')
  }
}


export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id as string
  const stripeSubscriptionStatus = event.object.status
  const stripePriceId = event.object.items.data[0].price.id

  const userID = await auth()
  const userExists = await prisma.user.findFirst({
    where: {
      id: userID?.user?.id,
    },
    select: {
      id: true,
    },
  })

  if (!userExists) {
    throw new Error('user of stripeCustomerId not found')
  }

  await prisma.user.update({
    where: {
      id: userExists.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
      stripePriceId,
    },
  })
}