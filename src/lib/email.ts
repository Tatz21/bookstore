import { Resend } from "resend";
import { serverEnv } from "./env";
import { formatPrice } from "./utils";

interface OrderEmailItem {
  title: string;
  quantity: number;
  priceAtPurchase: number;
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  items: OrderEmailItem[];
}) {
  const itemLines = params.items
    .map(
      (item) =>
        `<li><strong>${item.title}</strong> &times; ${item.quantity} &mdash; ${formatPrice(
          item.priceAtPurchase * item.quantity
        )}</li>`
    )
    .join("");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
      <h1 style="border-bottom: 1px solid #e7e5e4; padding-bottom: 12px;">${serverEnv.storeName}</h1>
      <p>Hi ${params.customerName},</p>
      <p>Thank you for your order <strong>${params.orderNumber}</strong>. Your payment has been confirmed and we are preparing your books.</p>
      <ul>${itemLines}</ul>
      <p style="font-size: 18px;"><strong>Total Paid: ${formatPrice(params.totalAmount)}</strong></p>
      <p style="color: #57534e; font-size: 13px;">Track your order anytime in your account dashboard.</p>
    </div>
  `;

  if (!serverEnv.resendApiKey) {
    console.info(
      `[Email Preview - Order Confirmation] To: ${params.to} | Order: ${params.orderNumber} | Total: ${formatPrice(
        params.totalAmount
      )}`
    );
    return { sent: false, preview: true };
  }

  const resend = new Resend(serverEnv.resendApiKey);
  await resend.emails.send({
    from: serverEnv.emailFrom,
    to: params.to,
    subject: `Order Confirmed: ${params.orderNumber} — ${serverEnv.storeName}`,
    html,
  });

  return { sent: true, preview: false };
}

export async function sendShippingUpdateEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
}) {
  const trackingSection = params.trackingNumber
    ? `<p>Tracking ID: <strong>${params.trackingNumber}</strong></p>`
    : "";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
      <h1 style="border-bottom: 1px solid #e7e5e4; padding-bottom: 12px;">${serverEnv.storeName}</h1>
      <p>Hi ${params.customerName},</p>
      <p>Your order <strong>${params.orderNumber}</strong> status is now: <strong>${params.status}</strong>.</p>
      ${trackingSection}
    </div>
  `;

  if (!serverEnv.resendApiKey) {
    console.info(
      `[Email Preview - Status Update] To: ${params.to} | Order: ${params.orderNumber} | Status: ${params.status}`
    );
    return { sent: false, preview: true };
  }

  const resend = new Resend(serverEnv.resendApiKey);
  await resend.emails.send({
    from: serverEnv.emailFrom,
    to: params.to,
    subject: `Order ${params.orderNumber} Update: ${params.status}`,
    html,
  });

  return { sent: true, preview: false };
}
