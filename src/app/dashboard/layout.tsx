"use client";
import Link from "next/link";

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-3">
        <Link href="/dashboard" className="hover:bg-gray-700 p-2 rounded">
          Overview
        </Link>
        <Link
          href="/dashboard/profile"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Profile
        </Link>
        <Link
          href="/dashboard/settings"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/logout", { method: "POST" });
            } catch {
              /* ignore errors */
            } finally {
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                window.location.href = "/login";
              }
            }
          }}
          className="hover:bg-gray-700 p-2 rounded text-left"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
