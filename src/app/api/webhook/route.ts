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
            "whsec_cb0f56aa25f1f4006d79407f453b42813eedecd6dc5e33cec251c805348c6154",
        )
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`)
        return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
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