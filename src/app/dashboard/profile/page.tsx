"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/me", {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);
  return (
    <div>
      <h1 className="text-xl font-bold">Profile</h1>
      {me && <p className="mt-2">Username: {me.username}</p>}
    </div>
  );
}
