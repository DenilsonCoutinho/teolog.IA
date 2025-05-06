import Stripe from 'stripe'

import { handleProcessWebhookUpdatedSubscription, stripe, whenUserCancelSubscription } from '@/lib/stripe'
import { headers } from 'next/headers'
import { db as prisma } from '@/lib/db'

export async function POST(req: Request) {
    const signature = (await headers()).get('Stripe-Signature') as string
    const body = await req.text()
    if (!signature) {
        throw new Error("Missing signature");
    }
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.WEBHOOK_SECRET!,
        )
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`)
        return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const isScheduledToCancel = event.data.object.cancel_at_period_end;
            const dateToCancel = event.data.object.cancel_at;
            const status = event.data.object.status;
            const stripeSubscriptionId = event.data.object.id
            const stripeCustomerId = event.data.object.customer as string

            if (isScheduledToCancel) {
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
                        stripeSubscriptionStatus: status,
                        is_current_period_end: isScheduledToCancel,
                        stripe_current_period_end: dateToCancel ? dateToCancel : null,
                    },
                })
            }
            await handleProcessWebhookUpdatedSubscription(event.data)
            break
        case 'customer.subscription.deleted':
            await whenUserCancelSubscription(event.data)
            break
        default:
            console.log(` ${event.type}`)
    }

    return new Response('{ "received": true }', { status: 200 })
}