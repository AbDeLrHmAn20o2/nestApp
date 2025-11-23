import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrderService } from "../order/order.service";
import { PaymentStatus } from "../order/entities/order.entity";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private orderService: OrderService
  ) {
    const stripeSecretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-11-17.clover",
      });
    }
  }

  async createPaymentIntent(orderId: string): Promise<{ clientSecret: string }> {
    if (!this.stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const order = await this.orderService.findOne(orderId);

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException("Order is already paid");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await this.orderService.findOne(orderId);
    await this.orderService.updatePaymentStatus(orderId, PaymentStatus.PENDING);

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const webhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET"
    );

    if (!webhookSecret) {
      throw new BadRequestException("Stripe webhook secret is not configured");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await this.orderService.updatePaymentStatus(orderId, PaymentStatus.PAID);
      console.log(`Payment succeeded for order: ${orderId}`);
    }
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await this.orderService.updatePaymentStatus(orderId, PaymentStatus.FAILED);
      console.log(`Payment failed for order: ${orderId}`);
    }
  }

  async refund(orderId: string): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const order = await this.orderService.findOne(orderId);

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException("Order is not paid");
    }

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException("No payment intent found for this order");
    }

    await this.stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    await this.orderService.refundOrder(orderId);
  }
}
