import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db/mongo";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "DB Connected" });
}

