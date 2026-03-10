import { sendForgotPasswordEmail } from "@/lib/emailService";
import { getFirebaseAuth } from "@/lib/firebase";
import { confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return typeof password === "string" && password.length >= 6;
}

function mapFirebaseError(error) {
    if (error.code === "auth/user-not-found") {
        return { error: "User not found", status: 404 };
    }

    if (error.code === "auth/invalid-email") {
        return { error: "Invalid email address", status: 400 };
    }

    if (error.code === "auth/invalid-action-code") {
        return { error: "Invalid or expired OTP/code", status: 400 };
    }

    if (error.code === "auth/expired-action-code") {
        return { error: "OTP/code expired. Please request again.", status: 400 };
    }

    if (error.code === "auth/weak-password") {
        return { error: "Password is too weak", status: 400 };
    }

    return {
        error: error.message || "Failed to process forgot password request",
        status: 500,
    };
}

async function handleSendOtp(body) {
    const auth = getFirebaseAuth();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
        return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
        return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    await sendPasswordResetEmail(auth, email);

    // Best effort: send branded guidance email from SMTP as well.
    try {
        await sendForgotPasswordEmail(email);
    } catch (emailError) {
        console.error("Forgot password guidance email failed:", emailError);
    }

    return Response.json(
        {
            success: true,
            message:
                "Password reset email sent successfully. Please check your inbox/spam and use the reset flow from email.",
        },
        { status: 200 }
    );
}

async function handleResetPassword(body) {
    const auth = getFirebaseAuth();
    const code = String(body?.otp || "").trim();
    const newPassword = String(body?.newPassword || "");
    const confirmPassword = String(body?.confirmPassword || "");

    if (!code || !newPassword || !confirmPassword) {
        return Response.json(
            { error: "OTP code, new password and confirm password are required" },
            { status: 400 }
        );
    }

    if (newPassword !== confirmPassword) {
        return Response.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (!isStrongPassword(newPassword)) {
        return Response.json(
            { error: "Password must be at least 6 characters" },
            { status: 400 }
        );
    }

    await confirmPasswordReset(auth, code, newPassword);

    return Response.json(
        {
            success: true,
            message: "Password reset successful. You can now login.",
        },
        { status: 200 }
    );
}

export async function POST(request) {
    try {
        const body = await request.json();
        const action = String(body?.action || "").trim();

        if (!action) {
            return Response.json(
                { error: "Action is required" },
                { status: 400 }
            );
        }

        if (action === "send-otp") return handleSendOtp(body);
        if (action === "reset-password") return handleResetPassword(body);

        return Response.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        const mapped = mapFirebaseError(error);
        return Response.json({ error: mapped.error }, { status: mapped.status });
    }
}
