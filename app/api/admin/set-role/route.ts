import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// ── POST /api/admin/set-role ──────────────────────────────────────
// Body: { uid: string, role: "ADMIN" | "ADMIN_MASTER" | "CORRETOR", secret: string }
// This endpoint allows bootstrapping the first admin user.
// Requires a secret key defined in environment variables.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, role, secret } = body;

        // Validate secret
        const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET ?? "domvia-admin-2024";
        if (secret !== expectedSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validate inputs
        if (!uid || typeof uid !== "string") {
            return NextResponse.json({ error: "Missing uid" }, { status: 400 });
        }
        if (!["ADMIN", "ADMIN_MASTER", "CORRETOR"].includes(role)) {
            return NextResponse.json({ error: "Invalid role. Must be ADMIN, ADMIN_MASTER, or CORRETOR" }, { status: 400 });
        }

        // Check if user exists
        const db = getAdminDb();
        const userRef = db.ref(`users/${uid}`);
        const snap = await userRef.get();
        if (!snap.exists()) {
            return NextResponse.json({ error: `User ${uid} not found in RTDB` }, { status: 404 });
        }
 
        // Update role
        await userRef.update({ role });

        const userData = snap.val();
        return NextResponse.json({
            success: true,
            message: `Role updated to ${role} for user ${userData.name ?? uid}`,
            user: { uid, name: userData.name, email: userData.email, role },
        });
    } catch (error) {
        console.error("set-role error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/admin/set-role?uid=XXX — lookup user info
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
        return NextResponse.json({ error: "Missing uid param" }, { status: 400 });
    }

    const db = getAdminDb();
    const snap = await db.ref(`users/${uid}`).get();
    if (!snap.exists()) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const d = snap.val();
    return NextResponse.json({ uid, name: d.name, email: d.email, role: d.role ?? "CORRETOR" });
}
