import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleStripeEvent } from "@/lib/billing-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27-02-00" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        await handleStripeEvent(event);
        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error(`Error processing webhook: ${error.message}`);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
