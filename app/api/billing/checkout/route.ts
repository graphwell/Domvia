import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27-02-00" as any,
});

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId, mode, metadata } = await req.json();

        if (!priceId || !userId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: mode || "subscription",
            client_reference_id: userId,
            metadata: metadata || {},
            success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${baseUrl}/planos?cancelled=true`,
            allow_promotion_codes: true,
            billing_address_collection: "required",
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Checkout error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
