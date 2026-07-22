import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor() {}

  createCheckoutSession = async ({
    customer_email,
    metadata,
    line_items,
    discounts,
  }: {
    customer_email: string;
    metadata?: {};
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    discounts?: Stripe.Checkout.SessionCreateParams.Discount[];
  }) => {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email,
      metadata,
      success_url: 'http://localhost:3000/order/success',
      cancel_url: 'http://localhost:3000/order/cancel',
      line_items,
      discounts,
    });

    return session;
  };
  constructEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  createRefundPayment = async (payment_intent: string) => {
    return await this.stripe.refunds.create({
      payment_intent,
      reason: 'requested_by_customer',
    });
  };
}
