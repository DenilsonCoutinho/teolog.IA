export const config = {
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        plans: {
            freePriceId: "price_1RLtiaHt6s00L0BLf5Gsl18q",
            premiumPriceId: 'price_1RTANKHt6s00L0BLArCIUQwS',
        }
        // price_1RIvC4Ht6s00L0BLY8TCkLm1
        //   webhookSecret: 'whsec_17a14e2622bead06a4132460bb6ea5a4a9b3a14e8c81f7cb7ebaa73f4cd770e5'
    }
}