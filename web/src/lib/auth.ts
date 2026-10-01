import { PrivyClient } from "@privy-io/node";
import { NextResponse } from "next/server";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
const appSecret = process.env.PRIVY_APP_SECRET ?? "";

export const authConfigured = Boolean(appId && appSecret);

let client: PrivyClient | null = null;
function getPrivy(): PrivyClient {
  if (!client) client = new PrivyClient({ appId, appSecret });
  return client;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 | 503
  ) {
    super(message);
  }
}

// Wallets per user change rarely; cache to avoid a Privy API call per request.
const WALLET_TTL_MS = 60_000;
const walletCache = new Map<string, { wallets: string[]; expires: number }>();

async function walletsOf(userId: string): Promise<string[]> {
  const hit = walletCache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.wallets;

  const user = await getPrivy().users()._get(userId);
  const wallets = user.linked_accounts
    .filter((a) => a.type === "wallet")
    .map((a) => (a as { address: string }).address.toLowerCase());
  walletCache.set(userId, { wallets, expires: Date.now() + WALLET_TTL_MS });
  return wallets;
}

/**
 * Verifies the caller's Privy access token (`Authorization: Bearer <token>`)
 * and returns the wallet addresses linked to that user (lowercase).
 * Fails closed: throws AuthError if the token is missing/invalid or the
 * server is not configured with PRIVY_APP_SECRET.
 */
export async function authenticate(req: Request): Promise<string[]> {
  if (!authConfigured) {
    throw new AuthError("Server auth not configured — set PRIVY_APP_SECRET", 503);
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new AuthError("Sign in required", 401);

  let userId: string;
  try {
    const claims = await getPrivy().utils().auth().verifyAccessToken(token);
    userId = claims.user_id;
  } catch {
    throw new AuthError("Invalid or expired session", 401);
  }

  try {
    return await walletsOf(userId);
  } catch {
    throw new AuthError("Could not verify wallet ownership", 503);
  }
}

/** Authenticates and asserts that `wallet` belongs to the caller. */
export async function requireWallet(req: Request, wallet: string): Promise<string> {
  const wallets = await authenticate(req);
  const w = wallet.toLowerCase();
  if (!wallets.includes(w)) {
    throw new AuthError("Wallet does not belong to the signed-in user", 403);
  }
  return w;
}

/** Maps an AuthError to a JSON response; returns null for other errors. */
export function authErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return null;
}
