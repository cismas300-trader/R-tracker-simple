"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "r-by-instrument-v1";
const INSTRUMENTS = ["DAX", "USTEC", "XAUUSD", "UK100", "EURUSD"];

export default function Page() {
  const [selectedInstrument, setSelectedInstrument] = useState("DAX");
  const [scores, setScores] = useState({
    DAX: 0,
    USTEC: 0,
    XAUUSD: 0,
    UK100: 0,
    EURUSD: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScores((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const currentR = scores[selectedInstrument] ?? 0;

  function addWin() {
    setScores((prev) => ({
      ...prev,
      [selectedInstrument]: (prev[selectedInstrument] ?? 0) + 1,
    }));
  }

  function addLoss() {
    setScores((prev) => ({
      ...prev,
      [selectedInstrument]: (prev[selectedInstrument] ?? 0) - 1,
    }));
  }

  function resetCurrent() {
    setScores((prev) => ({
      ...prev,
      [selectedInstrument]: 0,
    }));
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: 24,
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>
            Instrument
          </div>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 18,
              borderRadius: 14,
              border: "1px solid #334155",
              background: "#111827",
              color: "white",
              outline: "none",
            }}
          >
            {INSTRUMENTS.map((instrument) => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 10 }}>
          R curent - {selectedInstrument}
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 28,
            color: currentR >= 0 ? "#22c55e" : "#ef4444",
            textShadow:
              currentR >= 0
                ? "0 0 20px rgba(34,197,94,0.35)"
                : "0 0 20px rgba(239,68,68,0.35)",
          }}
        >
          {currentR}R
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            onClick={addWin}
            style={{
              padding: 24,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 16,
              border: "none",
              background: "#22c55e",
              color: "white",
              boxShadow: "0 0 20px rgba(34,197,94,0.35)",
              cursor: "pointer",
            }}
          >
            WIN
          </button>

          <button
            onClick={addLoss}
            style={{
              padding: 24,
              fontSize: 22,
              fontWeight: 700,
              borderRadius: 16,
              border: "none",
              background: "#ef4444",
              color: "white",
              boxShadow: "0 0 20px rgba(239,68,68,0.35)",
              cursor: "pointer",
            }}
          >
            LOSS
          </button>

          <button
            onClick={resetCurrent}
            style={{
              padding: 14,
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 14,
              border: "1px solid #334155",
              background: "#111827",
              color: "white",
              cursor: "pointer",
            }}
          >
            Reset {selectedInstrument}
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "left" }}>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
            Scoruri salvate
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {INSTRUMENTS.map((instrument) => (
              <div
                key={instrument}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: instrument === selectedInstrument ? "#1e293b" : "#111827",
                  border: "1px solid #334155",
                  fontSize: 15,
                }}
              >
                <span>{instrument}</span>
                <span
                  style={{
                    color: (scores[instrument] ?? 0) >= 0 ? "#22c55e" : "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {scores[instrument] ?? 0}R
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
