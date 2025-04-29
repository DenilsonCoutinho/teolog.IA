export const config = {
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY ,
        plans: { premiumPriceId: 'price_1RIwglHt6s00L0BL6uMZJE6p', }
        // price_1RIvC4Ht6s00L0BLY8TCkLm1
        //   webhookSecret: 'whsec_17a14e2622bead06a4132460bb6ea5a4a9b3a14e8c81f7cb7ebaa73f4cd770e5'
    }
}