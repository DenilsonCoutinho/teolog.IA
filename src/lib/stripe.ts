import { config } from "@/config";
import Stripe from "stripe";
import { db as prisma } from "./db";

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

  const createdCustomerSubscription = await stripe.subscriptions.create({
    customer: createdCustomer.id,
    items: [{ price: config.stripe.plans.freePriceId }],
  })

  await prisma.user.update({
    where: {
      email: input.email,
    },
    data: {
      stripeCustomerId: createdCustomer.id,
      stripeSubscriptionId: createdCustomerSubscription.id,
      stripeSubscriptionStatus: createdCustomerSubscription.status,
      stripePriceId: config.stripe.plans.premiumPriceId,
    },
  })

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


export const openBillingPortalToUpdatePremiumPlan = async (
  userStripeCustomerId: string,
  userStripeSubscriptionId: string
) => {
  const subscriptionItems = await stripe.subscriptionItems.list({
    subscription: userStripeSubscriptionId,
    limit: 1,
  })

  const session = await stripe.billingPortal.sessions.create({
    customer: userStripeCustomerId,
    return_url: 'http://localhost:3000/bibleIA/billing',
    flow_data: {
      type: 'subscription_update_confirm',
      after_completion: {
        type: 'redirect',
        redirect: {
          return_url: 'http://localhost:3000/bibleIA/billing?success=true',
        },
      },
      subscription_update_confirm: {
        subscription: userStripeSubscriptionId,
        items: [
          {
            id: subscriptionItems.data[0].id,
            price: config.stripe.plans.premiumPriceId,
            quantity: 1,
          },
        ],
      },
    },
  })

  return { url: session.url }
}


export const getDueDate = async (userStripeSubscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(userStripeSubscriptionId);
  console.log(subscription)
  // const billingAnchor = new Date(subscription.billing_cycle_anchor * 1000);
  return subscription

}

export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id as string
  const stripeSubscriptionStatus = event.object.status
  const stripePriceId = event.object.items.data[0].price.id

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId }
      ]
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


export const whenUserCancelSubscription = async (event: {
  object: Stripe.Subscription
}) => {

  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id as string
  const freeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{
      price: config.stripe.plans.freePriceId,
      quantity: 1
    }],
  });

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId }
      ]
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
      stripeSubscriptionId: freeSubscription.id,
      stripeSubscriptionStatus:freeSubscription.status,
      stripePriceId: config.stripe.plans.freePriceId,
    },
  })
}