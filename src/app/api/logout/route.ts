import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    await fetch(apiBase + "/api/logout", { method: "POST", credentials: "include" });
  } catch {}
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "access_token", value: "", httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set({ name: "refresh_token", value: "", httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set({ name: "user_id", value: "", httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

