
import { connectDB } from "@/src/lib/db/mongo";
import User from "@/src/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const user = await User.create({
    email: "test@nutrigenie.com",
  });

  return NextResponse.json({ user });
}
