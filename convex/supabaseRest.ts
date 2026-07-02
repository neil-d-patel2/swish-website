/// <reference types="node" />
"use node";

// Shared Supabase REST helpers using the service-role key, so Convex actions
// can read/write tables that RLS otherwise locks down to the client (same
// approach as the private helpers at the bottom of convex/stripe.ts, just
// reusable across the POS and notification actions).

function baseUrl() {
  return process.env.SUPABASE_URL!.replace(/\/$/, "");
}

function authHeaders(extra?: Record<string, string>) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

export async function supabaseGet(
  path: string,
): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Supabase GET failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<Record<string, unknown>[]>;
}

export async function supabasePatch(
  path: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Supabase PATCH failed: ${res.status} ${await res.text()}`,
    );
  }
}

export async function supabaseDelete(path: string) {
  const res = await fetch(`${baseUrl()}/rest/v1/${path}`, {
    method: "DELETE",
    headers: authHeaders({ Prefer: "return=minimal" }),
  });
  if (!res.ok) {
    throw new Error(
      `Supabase DELETE failed: ${res.status} ${await res.text()}`,
    );
  }
}

export async function supabaseInsert(
  table: string,
  rows: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${baseUrl()}/rest/v1/${table}`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(
      `Supabase INSERT failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json() as Promise<Record<string, unknown>[]>;
}

// Upsert on a unique constraint (e.g. "store_id,provider"). Used for POS
// connection/credential rows and for syncing catalog/sales rows without
// duplicating them on repeat syncs.
export async function supabaseUpsert(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
): Promise<Record<string, unknown>[]> {
  const res = await fetch(
    `${baseUrl()}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`,
    {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify(rows),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Supabase UPSERT failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json() as Promise<Record<string, unknown>[]>;
}
