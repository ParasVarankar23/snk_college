import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";

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
        const idToken = await user.getIdToken();

        return Response.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    uid: user.uid,
                    email: user.email,
                    name: userData?.name || null,
                },
                idToken: idToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);

        // Handle Firebase specific errors
        if (error.code === "auth/user-not-found") {
            return Response.json(
                { error: "User not found" },
                { status: 401 }
            );
        }

        if (error.code === "auth/wrong-password") {
            return Response.json(
                { error: "Wrong password" },
                { status: 401 }
            );
        }

        if (error.code === "auth/invalid-email") {
            return Response.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        if (error.code === "auth/user-disabled") {
            return Response.json(
                { error: "User account is disabled" },
                { status: 403 }
            );
        }

        return Response.json(
            { error: error.message || "Login failed" },
            { status: 500 }
        );
    }
}
