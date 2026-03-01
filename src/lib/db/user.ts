import "server-only";
import User from "@/src/models/User";

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findUserByEmailInsensitive(email: string) {
  const normalized = email.trim();
  const exact = await User.findOne({ email: normalized });
  if (exact) return exact;

  const regex = new RegExp(`^${escapeRegex(normalized)}$`, "i");
  return User.findOne({ email: { $regex: regex } });
}

export async function getOrCreateUserByEmail(
  email: string,
  fallbackName?: string | null,
  fallbackImage?: string | null
) {
  const normalizedEmail = email.trim().toLowerCase();
  let user = await findUserByEmailInsensitive(normalizedEmail);

  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      name: fallbackName || normalizedEmail.split("@")[0],
      image: fallbackImage || undefined,
    });
  }

  return user;
}
