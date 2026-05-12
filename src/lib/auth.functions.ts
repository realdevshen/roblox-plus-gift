import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const EXPIRY_OPTIONS = ["day", "week", "month", "year", "lifetime"] as const;
type Expiry = (typeof EXPIRY_OPTIONS)[number];

function admin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD not configured");
  if (password !== expected) throw new Error("Invalid admin password");
}

function expiryToDate(e: Expiry): string | null {
  const now = Date.now();
  const day = 86400000;
  switch (e) {
    case "day": return new Date(now + day).toISOString();
    case "week": return new Date(now + 7 * day).toISOString();
    case "month": return new Date(now + 30 * day).toISOString();
    case "year": return new Date(now + 365 * day).toISOString();
    case "lifetime": return null;
  }
}

function genToken() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const loginWithToken = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; deviceId: string }) => d)
  .handler(async ({ data }) => {
    const token = data.token.trim();
    const deviceId = data.deviceId.trim();
    if (!token || !deviceId) return { ok: false as const, error: "Missing token or device id" };

    const sb = admin();
    const { data: row, error } = await sb
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    if (error) return { ok: false as const, error: "Lookup failed" };
    if (!row) return { ok: false as const, error: "Invalid token" };
    if (row.revoked) return { ok: false as const, error: "Token has been revoked" };
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now())
      return { ok: false as const, error: "Token has expired" };

    if (row.device_id && row.device_id !== deviceId)
      return { ok: false as const, error: "Token is bound to another device" };

    const updates: Record<string, unknown> = { last_used_at: new Date().toISOString() };
    if (!row.device_id) updates.device_id = deviceId;
    await sb.from("access_tokens").update(updates).eq("id", row.id);

    return { ok: true as const };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    try {
      checkPassword(data.password);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Invalid password" };
    }
  });

export const adminListTokens = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { data: rows, error } = await admin()
      .from("access_tokens")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tokens: rows ?? [] };
  });

export const adminCreateToken = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; expiry: Expiry }) => {
    if (!EXPIRY_OPTIONS.includes(d.expiry)) throw new Error("Invalid expiry");
    return d;
  })
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const token = genToken();
    const expires_at = expiryToDate(data.expiry);
    const { data: row, error } = await admin()
      .from("access_tokens")
      .insert({ token, expires_at })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { token: row };
  });

export const adminRevokeToken = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { error } = await admin()
      .from("access_tokens")
      .update({ revoked: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminUnbindDevice = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { error } = await admin()
      .from("access_tokens")
      .update({ device_id: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteToken = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { error } = await admin().from("access_tokens").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
