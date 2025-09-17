"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // try {
    //   const res = await fetch("http://localhost:4000/api/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ username, password }),
    //   });

    //   if (!res.ok) throw new Error("Login failed");

    //   const data = await res.json();
    //   localStorage.setItem("token", data.token);

    //   router.push("/"); // ✅ login สำเร็จ กลับไปหน้า Home
    // } catch (err: any) {
    //   setError(err.message);
    // } finally {
    //   setLoading(false);
    // }
    try {
      if (!username || !password) {
        throw new Error("Please enter username and password");
      }

      // simulate network delay
      await new Promise((res) => setTimeout(res, 500));

      // store a mock token
      const mockToken = "mock-token-1234567890";
      localStorage.setItem("token", mockToken);

      // navigate to home on success
      router.push("/"); // ✅ login สำเร็จ กลับไปหน้า Home
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err ?? "Login failed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  //   };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
