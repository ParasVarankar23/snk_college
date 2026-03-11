import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import Razorpay from "razorpay";

const FORM_AMOUNT_INR = 200;
const FORM_AMOUNT_PAISE = FORM_AMOUNT_INR * 100;

function getAuthContext(request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const uid = payload.user_id || payload.uid || payload.sub || null;
        const role = String(payload.role || "student").trim().toLowerCase();
        if (!uid) return null;
        return { uid, role };
    } catch {
        return null;
    }
}

function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials are not configured");
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}

export async function POST(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const razorpay = getRazorpayClient();
        const receipt = `admission_${auth.uid}_${Date.now()}`.slice(0, 40);

        const order = await razorpay.orders.create({
            amount: FORM_AMOUNT_PAISE,
            currency: "INR",
            receipt,
            notes: {
                uid: auth.uid,
                purpose: "admission_form_fee",
            },
        });

        return Response.json(
            {
                success: true,
                amount: FORM_AMOUNT_INR,
                amountInPaise: FORM_AMOUNT_PAISE,
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID,
                order,
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { error: error?.message || "Failed to create payment order" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    const auth = getAuthContext(request);
    if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const razorpayOrderId = String(body?.razorpay_order_id || "").trim();
        const razorpayPaymentId = String(body?.razorpay_payment_id || "").trim();
        const razorpaySignature = String(body?.razorpay_signature || "").trim();

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return Response.json({ error: "Missing payment verification fields" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return Response.json({ error: "Payment signature verification failed" }, { status: 400 });
        }

        return Response.json(
            {
                success: true,
                message: "Payment verified successfully",
                payment: {
                    razorpayOrderId,
                    razorpayPaymentId,
                    razorpaySignature,
                    amount: FORM_AMOUNT_INR,
                    currency: "INR",
                    status: "paid",
                    paidAt: new Date().toISOString(),
                    paidBy: auth.uid,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { error: error?.message || "Failed to verify payment" },
            { status: 500 }
        );
    }
}
