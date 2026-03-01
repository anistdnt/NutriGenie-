import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth/auth-options";
import { connectDB } from "@/src/lib/db/mongo";
import { findUserByEmailInsensitive, getOrCreateUserByEmail } from "@/src/lib/db/user";
import mongoose from "mongoose";
import MealPlan from "@/src/models/MealPlan";
import Chat from "@/src/models/Chat";
import User from "@/src/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userDoc = await getOrCreateUserByEmail(
      session.user.email,
      session.user.name,
      session.user.image
    );
    const user = await userDoc.toObject();
    delete (user as Record<string, unknown>).password;

    return NextResponse.json(
      { user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { name?: string; image?: string };
    const nextName = typeof body.name === "string" ? body.name.trim() : undefined;
    const nextImageRaw = typeof body.image === "string" ? body.image.trim() : undefined;

    const updateOps: Record<string, Record<string, unknown>> = {};
    const setOps: Record<string, unknown> = {};

    if (typeof nextName !== "undefined") {
      if (!nextName) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      setOps.name = nextName;
    }

    if (typeof nextImageRaw !== "undefined") {
      if (nextImageRaw.length > 0) {
        if (nextImageRaw.length > 900_000) {
          return NextResponse.json({ error: "Image payload is too large" }, { status: 400 });
        }
        setOps.image = nextImageRaw;
      } else {
        updateOps.$unset = { image: 1 };
      }
    }

    if (Object.keys(setOps).length > 0) {
      updateOps.$set = setOps;
    }

    if (Object.keys(updateOps).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();
    const existingUser = await findUserByEmailInsensitive(session.user.email);
    if (!existingUser) {
      await getOrCreateUserByEmail(session.user.email, session.user.name, session.user.image);
    }
    const user = await findUserByEmailInsensitive(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user.set(updateOps.$set ?? {});
    if (updateOps.$unset?.image) {
      user.set("image", undefined);
    }
    await user.save();
    const plainUser = user.toObject();
    delete (plainUser as Record<string, unknown>).password;

    return NextResponse.json({ success: true, user: plainUser });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      confirmText?: string;
      confirmEmail?: string;
    };

    const confirmText = (body.confirmText || "").trim();
    const confirmEmail = (body.confirmEmail || "").trim().toLowerCase();
    const sessionEmail = session.user.email.trim().toLowerCase();

    if (confirmText !== "DELETE") {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE"' },
        { status: 400 }
      );
    }

    if (confirmEmail !== sessionEmail) {
      return NextResponse.json(
        { error: "Please enter your account email correctly to continue." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await findUserByEmailInsensitive(session.user.email);

    if (!user) {
      return NextResponse.json({ success: true, message: "Account already removed." });
    }

    const userId = user._id;
    const userIdString = String(user._id);

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
    }

    await Promise.all([
      MealPlan.deleteMany({ userId }),
      Chat.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
      db.collection("accounts").deleteMany({ $or: [{ userId }, { userId: userIdString }] }),
      db.collection("sessions").deleteMany({ $or: [{ userId }, { userId: userIdString }] }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
