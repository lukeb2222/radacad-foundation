import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not set");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2025-04-30.basil" as any })
  : null;

export const DONATION_TIERS = [
  { amount: 50, label: "Supporter", description: "Help cover course material costs for a student" },
  { amount: 100, label: "Advocate", description: "Fund a week of online training access" },
  { amount: 250, label: "Champion", description: "Cover certification exam fees for a student" },
  { amount: 500, label: "Patron", description: "Sponsor a month of full program access" },
  { amount: 1000, label: "Benefactor", description: "Fund a complete course enrollment" },
  { amount: 5000, label: "Legacy Partner", description: "Make a transformative contribution to the fund" },
];
