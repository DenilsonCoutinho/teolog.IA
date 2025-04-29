import Stripe from 'stripe'

import { handleProcessWebhookUpdatedSubscription, stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

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
            console.log(event.data)
            await handleProcessWebhookUpdatedSubscription(event.data)
            break
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    return new Response('{ "received": true }', { status: 200 })
}