import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!_stripe && ENV.stripeSecretKey) {
    _stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2025-04-30.basil" as any });
  }
  return _stripe;
}

// 상품 정보 (Stripe에서 관리하지 않는 로컬 상품 정보)
export interface CheckoutItem {
  name: string;
  price: number; // 원화 (KRW)
  quantity: number;
  imageUrl?: string;
}

export async function createCheckoutSession(params: {
  items: CheckoutItem[];
  userId: number;
  userEmail?: string;
  userName?: string;
  orderNumber: string;
  origin: string;
  successPath?: string;
  cancelPath?: string;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe가 설정되지 않았습니다.");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map(item => ({
    price_data: {
      currency: "krw",
      product_data: {
        name: item.name,
        ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
      },
      unit_amount: item.price, // KRW는 소수점 없음
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    client_reference_id: params.userId.toString(),
    customer_email: params.userEmail || undefined,
    allow_promotion_codes: true,
    metadata: {
      user_id: params.userId.toString(),
      order_number: params.orderNumber,
      customer_name: params.userName || "",
    },
    success_url: `${params.origin}${params.successPath || "/shop?payment=success"}`,
    cancel_url: `${params.origin}${params.cancelPath || "/cart?payment=cancelled"}`,
  });

  return { sessionId: session.id, url: session.url };
}

export async function handleWebhookEvent(event: Stripe.Event) {
  // 테스트 이벤트 처리
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected");
    return { verified: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.order_number;
      const userId = session.metadata?.user_id;
      console.log(`[Stripe] Checkout completed: order=${orderNumber}, user=${userId}, payment=${session.payment_intent}`);
      // 주문 상태 업데이트는 db에서 처리
      return { orderNumber, userId, paymentIntentId: session.payment_intent, status: "completed" };
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] Payment succeeded: ${pi.id}`);
      return { paymentIntentId: pi.id, status: "succeeded" };
    }
    default:
      console.log(`[Stripe] Unhandled event: ${event.type}`);
      return { status: "unhandled" };
  }
}
