import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}