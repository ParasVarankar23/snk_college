import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import jwt from "jsonwebtoken";

function mapLoginError(error) {
    if (error.code === "auth/user-not-found") {
        return { error: "User not found", status: 401 };
    }

    if (error.code === "auth/wrong-password") {
        return { error: "Wrong password", status: 401 };
    }

    if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials"
    ) {
        return { error: "Invalid email or password", status: 401 };
    }

    if (error.code === "auth/invalid-email") {
        return { error: "Invalid email address", status: 400 };
    }

    if (error.code === "auth/user-disabled") {
        return { error: "User account is disabled", status: 403 };
    }

    return { error: error.message || "Login failed", status: 500 };
}

function normalizeRole(role) {
    return String(role || "").trim().toLowerCase();
}

export async function POST(request) {
    try {
        const auth = getFirebaseAuth();
        const db = getFirebaseDb();

        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return Response.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Fetch user info from Realtime Database
        const userSnapshot = await get(ref(db, `users/${user.uid}`));
        const userData = userSnapshot.exists() ? userSnapshot.val() : null;

        // Get ID token for client-side verification
        await user.getIdToken();

        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpiration = process.env.JWT_EXPIRATION || "7d";

        if (!jwtSecret) {
            return Response.json(
                { error: "Server configuration error: missing JWT_SECRET" },
                { status: 500 }
            );
        }

        // App token with only user_id claim
        const normalizedRole = normalizeRole(userData?.role) || "student";

        const appToken = jwt.sign(
            { user_id: user.uid, role: normalizedRole },
            jwtSecret,
            { expiresIn: jwtExpiration }
        );

        return Response.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    uid: user.uid,
                    email: user.email,
                    name: userData?.name || null,
                    role: normalizedRole,
                },
                authToken: appToken,
            },
            { status: 200 }
        );
    } catch (error) {
        const mapped = mapLoginError(error);
        if (mapped.status >= 500) {
            console.error("Login error:", error);
        }
        return Response.json({ error: mapped.error }, { status: mapped.status });
    }
}
