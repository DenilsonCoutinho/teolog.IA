import { config } from "@/config";
import Stripe from "stripe";
import { db as prisma } from "./db";
import { PlanType } from "@prisma/client";

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
      stripeNamePlan:"Free",
      stripePriceId: config.stripe.plans.freePriceId,
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
      success_url: `${process.env.NEXT_PUBLIC_URL}bibleIA`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}`,
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
  userStripeSubscriptionId: string,
  return_url: string
) => {
  const subscriptionItems = await stripe.subscriptionItems.list({
    subscription: userStripeSubscriptionId,
    limit: 1,
  })

  const session = await stripe.billingPortal.sessions.create({
    customer: userStripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}${return_url}`,
    flow_data: {
      type: 'subscription_update_confirm',
      after_completion: {
        type: 'redirect',
        redirect: {
          return_url: `${process.env.NEXT_PUBLIC_URL}obrigado`,
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


export const getDataSubscription = async (userStripeSubscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(userStripeSubscriptionId);
  return subscription
}

const getDataPrice = async (userStripeSubscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(userStripeSubscriptionId);
  const priceId = subscription.items.data[0].price.id;
  const price = await stripe.prices.retrieve(priceId);
  const product = await stripe.products.retrieve(price.product as string);
  return product

}

export const cancelPlan = async (userStripeCustomerId: string) => {

  const session = await stripe.billingPortal.sessions.create({
    customer: userStripeCustomerId, // ID do cliente no Stripe
    return_url: `${process.env.NEXT_PUBLIC_URL}bibleIA/billing`, // para onde o usuário será redirecionado depois
  });

  return { url: session.url }
}

export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription
}) => {
  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id as string
  const stripeSubscriptionStatus = event.object.status
  const stripePriceId = event.object.items.data[0].price.id
  const is_current_period_end = event.object.cancel_at_period_end;

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

  const price = await stripe.prices.retrieve(stripePriceId);
  const stripeNamePlan = (await stripe.products.retrieve(price.product as string)).name as PlanType
  const stripePricePlan = (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].price.unit_amount;
  const stripe_current_period_end = (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].current_period_end;
  const stripe_currency = (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].price.currency;

  await prisma.user.update({
    where: {
      id: userExists.id,
    },
    data: {
      stripeNamePlan,
      stripePricePlan,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
      stripePriceId,
      stripe_current_period_end,
      stripe_currency,
      is_current_period_end
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
      stripeSubscriptionStatus: freeSubscription.status,
      stripePriceId: config.stripe.plans.freePriceId,
      stripe_current_period_end: freeSubscription.cancel_at ? freeSubscription.cancel_at : null,
      is_current_period_end: freeSubscription.cancel_at_period_end ? freeSubscription.cancel_at_period_end : null,
    },
  })
}