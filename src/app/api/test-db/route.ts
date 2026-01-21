
import { connectDB } from "@/src/lib/db/mongo";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "✅ MongoDB Connected" });
}
