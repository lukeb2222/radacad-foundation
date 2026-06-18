import { Router, raw } from "express";
import { stripe } from "./stripe";
import { updateDonationStatus } from "./db";
import { notifyOwner } from "./_core/notification";
import { sendDonorThankYou } from "./email";

const webhookRouter = Router();

webhookRouter.post(
  "/api/stripe/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const paymentIntentId = session.payment_intent || session.subscription;
          await updateDonationStatus(session.id, "completed", paymentIntentId);

          const donorName = session.metadata?.donor_name || "Anonymous";
          const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "unknown";

          await notifyOwner({
            title: "New Donation Received",
            content: `${donorName} donated $${amount} to the RadAcad Foundation Scholarship Fund.`,
          });

          // Send thank-you email to donor
          const donorEmail = session.customer_email || session.metadata?.customer_email;
          if (donorEmail) {
            await sendDonorThankYou({
              to: donorEmail,
              donorName,
              amount,
            });
          }
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as any;
          // Find by payment intent and mark as failed
          console.log("[Webhook] Payment failed:", paymentIntent.id);
          break;
        }
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error("[Webhook] Error processing event:", err);
    }

    res.json({ received: true });
  }
);

export default webhookRouter;
