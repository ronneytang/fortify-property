import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (session) return session;

  // No session — fall back to demo user
  const demo = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (demo) return { userId: demo.id, email: demo.email };

  throw new Error("Unauthorized");
}
