"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const isMock =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        process.env.NEXT_PUBLIC_MOCK_TOKEN === "1");

    if (isMock) {
      // ensure there's a token in localStorage for dev
      let devToken = token;
      if (!devToken) {
        devToken = "mock-token-123";
        localStorage.setItem("token", devToken);
      }

      // mocked async user fetch
      Promise.resolve({ username: "devuser" }).then((data) => setUser(data));
      return;
    }

    fetch("http://localhost:4000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => router.push("/login"));
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome back, {user.username} 🎉</p>
    </div>
  );
}
