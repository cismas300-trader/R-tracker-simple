"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [r, setR] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("r");
    if (saved !== null) setR(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("r", r);
  }, [r]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: 40,
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          marginBottom: 40,
          color: r >= 0 ? "#16a34a" : "#dc2626",
        }}
      >
        {r}R
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        <button
          onClick={() => setR(r + 1)}
          style={{
            padding: 24,
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 16,
            border: "none",
            background: "#16a34a",
            color: "white",
          }}
        >
          WIN
        </button>

        <button
          onClick={() => setR(r - 1)}
          style={{
            padding: 24,
            fontSize: 22,
            fontWeight: 700,
            borderRadius: 16,
            border: "none",
            background: "#dc2626",
            color: "white",
          }}
        >
          LOSS
        </button>

      </div>
    </div>
  );
}
