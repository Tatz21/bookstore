import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { serverEnv } from "./env";

export interface InvoiceData {
  orderNumber: string;
  createdAt: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    title: string;
    author: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.11, 0.1, 0.09);
  const muted = rgb(0.42, 0.4, 0.38);
  const accent = rgb(0.55, 0.25, 0.12);

  let y = 790;
  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }
  ) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: options?.size ?? 10,
      font: options?.bold ? boldFont : font,
      color: options?.color ?? ink,
    });
  };

  // Header
  drawText(serverEnv.storeName.toUpperCase(), 50, y, {
    size: 18,
    bold: true,
    color: accent,
  });
  drawText("TAX INVOICE / RECEIPT", 400, y, { size: 12, bold: true });
  y -= 24;
  drawText(`Invoice #: ${data.orderNumber}`, 400, y, { size: 10, color: muted });
  drawText(
    `Date: ${data.createdAt.toISOString().slice(0, 10)}`,
    50,
    y,
    { size: 10, color: muted }
  );
  y -= 16;
  drawText(`Status: ${data.status}`, 400, y, { size: 10, bold: true });

  // Divider
  y -= 18;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.85, 0.83, 0.8),
  });

  // Bill To
  y -= 24;
  drawText("SHIPPING TO", 50, y, { size: 9, bold: true, color: muted });
  y -= 15;
  drawText(data.customerName, 50, y, { size: 11, bold: true });
  y -= 14;
  drawText(data.customerEmail, 50, y, { size: 10, color: muted });
  y -= 14;
  drawText(
    `${data.shippingAddress.line1}${
      data.shippingAddress.line2 ? `, ${data.shippingAddress.line2}` : ""
    }`,
    50,
    y,
    { size: 10 }
  );
  y -= 14;
  drawText(
    `${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}, ${data.shippingAddress.country}`,
    50,
    y,
    { size: 10 }
  );

  // Table header
  y -= 32;
  drawText("BOOK TITLE", 50, y, { size: 9, bold: true, color: muted });
  drawText("QTY", 360, y, { size: 9, bold: true, color: muted });
  drawText("PRICE", 420, y, { size: 9, bold: true, color: muted });
  drawText("TOTAL", 490, y, { size: 9, bold: true, color: muted });

  y -= 8;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.75,
    color: rgb(0.85, 0.83, 0.8),
  });

  const fmt = (n: number) => `${data.currency} ${n.toFixed(2)}`;

  for (const item of data.items) {
    y -= 20;
    if (y < 120) break;
    const titleTrunc =
      item.title.length > 46 ? `${item.title.slice(0, 43)}...` : item.title;
    drawText(titleTrunc, 50, y, { size: 10, bold: true });
    drawText(String(item.quantity), 365, y, { size: 10 });
    drawText(fmt(item.priceAtPurchase), 420, y, { size: 10 });
    drawText(fmt(item.priceAtPurchase * item.quantity), 490, y, { size: 10 });
    y -= 13;
    drawText(item.author, 50, y, { size: 8.5, color: muted });
  }

  // Totals
  y -= 26;
  page.drawLine({
    start: { x: 340, y },
    end: { x: 545, y },
    thickness: 0.75,
    color: rgb(0.85, 0.83, 0.8),
  });
  y -= 18;
  drawText("Subtotal", 360, y, { size: 10, color: muted });
  drawText(fmt(data.subtotal), 490, y, { size: 10 });
  if (data.discountAmount > 0) {
    y -= 16;
    drawText("Discount", 360, y, { size: 10, color: muted });
    drawText(`-${fmt(data.discountAmount)}`, 490, y, { size: 10 });
  }
  y -= 16;
  drawText("Shipping", 360, y, { size: 10, color: muted });
  drawText(data.shippingAmount === 0 ? "FREE" : fmt(data.shippingAmount), 490, y, {
    size: 10,
  });
  y -= 20;
  drawText("Total", 360, y, { size: 12, bold: true });
  drawText(fmt(data.totalAmount), 490, y, {
    size: 12,
    bold: true,
    color: accent,
  });

  drawText(
    `Thank you for reading with ${serverEnv.storeName}.`,
    50,
    50,
    { size: 9, color: muted }
  );

  return pdfDoc.save();
}
