"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "r-by-instrument-history-v3";
const INSTRUMENTS = ["DAX", "USTEC", "XAUUSD", "UK100", "EURUSD"];

const EMPTY_DATA = {
  DAX: { history: [0], wins: 0, losses: 0 },
  USTEC: { history: [0], wins: 0, losses: 0 },
  XAUUSD: { history: [0], wins: 0, losses: 0 },
  UK100: { history: [0], wins: 0, losses: 0 },
  EURUSD: { history: [0], wins: 0, losses: 0 },
};

function normalizeData(parsed) {
  const result = {};

  for (const instrument of INSTRUMENTS) {
    const item = parsed?.[instrument];
    result[instrument] = {
      history:
        Array.isArray(item?.history) && item.history.length > 0
          ? item.history.map((v) => Number(v) || 0)
          : [0],
      wins: Number.isFinite(item?.wins) ? item.wins : 0,
      losses: Number.isFinite(item?.losses) ? item.losses : 0,
    };
  }

  return result;
}

function buildChart(history) {
  if (!history || history.length === 0) return null;

  const width = 700;
  const height = 240;
  const padding = 24;

  const min = Math.min(...history, 0);
  const max = Math.max(...history, 0);
  const range = max - min || 1;

  function getX(i) {
    return padding + (i * (width - padding * 2)) / Math.max(history.length - 1, 1);
  }

  function getY(value) {
    return height - padding - ((value - min) / range) * (height - padding * 2);
  }

  const zeroY = getY(0);

  const segments = [];
  for (let i = 0; i < history.length - 1; i++) {
    const x1 = getX(i);
    const y1 = getY(history[i]);
    const x2 = getX(i + 1);
    const y2 = getY(history[i + 1]);

    segments.push({
      x1,
      y1,
      x2,
      y2,
      positive: history[i + 1] >= history[i],
    });
  }

  const dots = history.map((value, i) => ({
    x: getX(i),
    y: getY(value),
    value,
  }));

  return { width, height, padding, zeroY, segments, dots };
}

export default function Page() {
  const [selectedInstrument, setSelectedInstrument] = useState("DAX");
  const [data, setData] = useState(EMPTY_DATA);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setData(normalizeData(parsed));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const current = data[selectedInstrument] ?? EMPTY_DATA[selectedInstrument];
  const currentHistory = current.history ?? [0];
  const currentR = currentHistory[currentHistory.length - 1] ?? 0;
  const currentWins = current.wins ?? 0;
  const currentLosses = current.losses ?? 0;

  const chart = useMemo(() => buildChart(currentHistory), [currentHistory]);

  function addWin() {
    setData((prev) => {
      const item = prev[selectedInstrument];
      const last = item.history[item.history.length - 1] ?? 0;

      return {
        ...prev,
        [selectedInstrument]: {
          ...item,
          history: [...item.history, last + 1],
          wins: item.wins + 1,
        },
      };
    });
  }

  function addLoss() {
    setData((prev) => {
      const item = prev[selectedInstrument];
      const last = item.history[item.history.length - 1] ?? 0;

      return {
        ...prev,
        [selectedInstrument]: {
          ...item,
          history: [...item.history, last - 1],
          losses: item.losses + 1,
        },
      };
    });
  }

  function undoLast() {
    setData((prev) => {
      const item = prev[selectedInstrument];
      if (item.history.length <= 1) return prev;

      const last = item.history[item.history.length - 1];
      const beforeLast = item.history[item.history.length - 2];

      return {
        ...prev,
        [selectedInstrument]: {
          ...item,
          history: item.history.slice(0, -1),
          wins: last > beforeLast ? Math.max(0, item.wins - 1) : item.wins,
          losses: last < beforeLast ? Math.max(0, item.losses - 1) : item.losses,
        },
      };
    });
  }

  function resetCurrent() {
    setData((prev) => ({
      ...prev,
      [selectedInstrument]: {
        history: [0],
        wins: 0,
        losses: 0,
      },
    }));
  }

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "r-tracker-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function openImportDialog() {
    fileInputRef.current?.click();
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const imported = parsed?.data ? parsed.data : parsed;
        const normalized = normalizeData(imported);
        setData(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        alert("Date importate cu succes.");
      } catch {
        alert("Fișier invalid. Verifică JSON-ul importat.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: 20,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          margin: "0 auto",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 24,
          padding: 22,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>R</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: currentR >= 0 ? "#22c55e" : "#ef4444",
              }}
            >
              {currentR}R
            </div>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Wins</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#22c55e" }}>
              {currentWins}
            </div>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Losses</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#ef4444" }}>
              {currentLosses}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 18,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
            Curba evoluției
          </div>

          {chart ? (
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} style={{ width: "100%", height: 220 }}>
              <line
                x1={chart.padding}
                x2={chart.width - chart.padding}
                y1={chart.zeroY}
                y2={chart.zeroY}
                stroke="#475569"
                opacity="0.35"
                strokeDasharray="5 5"
              />

              {chart.segments.map((segment, index) => (
                <line
                  key={index}
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  stroke={segment.positive ? "#22c55e" : "#ef4444"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    filter: segment.positive
                      ? "drop-shadow(0 0 6px rgba(34,197,94,0.35))"
                      : "drop-shadow(0 0 6px rgba(239,68,68,0.35))",
                  }}
                />
              ))}

              {chart.dots.map((dot, index) => (
                <circle
                  key={index}
                  cx={dot.x}
                  cy={dot.y}
                  r="3.5"
                  fill={dot.value >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </svg>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            onClick={addWin}
            style={{
              width: "100%",
              padding: 22,
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
              width: "100%",
              padding: 22,
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              onClick={undoLast}
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
              Undo
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
              Reset
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              onClick={exportData}
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
              Export JSON
            </button>

            <button
              onClick={openImportDialog}
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
              Import JSON
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10 }}>
            Scoruri salvate
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {INSTRUMENTS.map((instrument) => {
              const item = data[instrument];
              const value = item.history[item.history.length - 1] ?? 0;

              return (
                <div
                  key={instrument}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: instrument === selectedInstrument ? "#1e293b" : "#111827",
                    border: "1px solid #334155",
                    fontSize: 15,
                  }}
                >
                  <span>{instrument}</span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>W {item.wins}</span>
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>L {item.losses}</span>
                  <span
                    style={{
                      color: value >= 0 ? "#22c55e" : "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    {value}R
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
