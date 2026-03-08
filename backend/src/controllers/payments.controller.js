import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "../config/db.js";
import { bookings } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { notify } from "../lib/notify.js";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ─── POST /api/payments/create-order ─────────────────────────────────────────
export async function createOrder(req, res, next) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, req.user.id)
        )
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "completed") {
      return res
        .status(409)
        .json({ error: "Payment is only allowed after the job is completed" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(409).json({ error: "Booking is already paid" });
    }

    const amountPaise = Math.round(
      parseFloat(booking.finalPrice ?? booking.quotedPrice) * 100
    );

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `booking_${bookingId.slice(0, 20)}`,
      notes: { bookingId },
    });

    await db
      .update(bookings)
      .set({ razorpayOrderId: order.id, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/payments/verify ────────────────────────────────────────────────
export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    // Verify HMAC signature — prevents spoofed payment confirmations
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, req.user.id)
        )
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    await db
      .update(bookings)
      .set({
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Notify provider of payment
    if (booking.providerId) {
      const { providerProfiles } = await import("../db/schema.js");
      const [provider] = await db
        .select({ userId: providerProfiles.userId })
        .from(providerProfiles)
        .where(eq(providerProfiles.id, booking.providerId))
        .limit(1);

      if (provider) {
        await notify(provider.userId, {
          title: "Payment received 💸",
          body: "The customer has paid for the completed booking.",
          link: `/provider/bookings/${bookingId}`,
        });
      }
    }

    res.json({ message: "Payment verified and recorded" });
  } catch (err) {
    next(err);
  }
}
