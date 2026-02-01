import { NextResponse } from "next/server";
import { requireAuth } from "@/src/lib/auth/requireAuth";
import { connectDB } from "@/src/lib/db/mongo";
import User from "@/src/models/User";

export async function GET() {
  try {
    const session = await requireAuth();

    await connectDB();

    const user = await User.findById(session.user.id).select("-password");

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}