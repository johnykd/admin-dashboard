export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(API_BASE + path, { credentials: "include", ...init });
  return res;
}

export async function apiPost(path: string, body: any, init?: RequestInit) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: "include",
    ...init,
  });
  return res;
}

