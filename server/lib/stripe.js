import Stripe from "stripe";

export function createStripeClient(secretKey) {
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}
