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
      history: Array.isArray(item?.history) && item.history.length ? item.history : [0],
      wins: item?.wins || 0,
      losses: item?.losses || 0,
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

  const getX = (i) =>
    padding + (i * (width - padding * 2)) / Math.max(history.length - 1, 1);

  const getY = (v) =>
    height - padding - ((v - min) / range) * (height - padding * 2);

  const zeroY = getY(0);

  const segments = [];
  for (let i = 0; i < history.length - 1; i++) {
    segments.push({
      x1: getX(i),
      y1: getY(history[i]),
      x2: getX(i + 1),
      y2: getY(history[i + 1]),
      positive: history[i + 1] >= history[i],
    });
  }

  return { width, height, padding, zeroY, segments };
}

export default function Page() {
  const [selectedInstrument, setSelectedInstrument] = useState("DAX");
  const [data, setData] = useState(EMPTY_DATA);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(normalizeData(JSON.parse(saved)));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const current = data[selectedInstrument];
  const history = current.history;
  const r = history[history.length - 1];

  const chart = useMemo(() => buildChart(history), [history]);

  function addWin() {
    setData((prev) => {
      const item = prev[selectedInstrument];
      const last = item.history[item.history.length - 1];
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
      const last = item.history[item.history.length - 1];
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

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setData(normalizeData(parsed));
      } catch {
        alert("Fișier invalid");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 20 }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>

        <select value={selectedInstrument} onChange={(e)=>setSelectedInstrument(e.target.value)}>
          {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
        </select>

        <h1 style={{
          fontSize: 60,
          color: r >= 0 ? "#4ade80" : "#f87171"
        }}>
          {r}R
        </h1>

        {chart && (
          <svg viewBox={`0 0 ${chart.width} ${chart.height}`} style={{ width: "100%" }}>
            <line x1={0} x2={chart.width} y1={chart.zeroY} y2={chart.zeroY} stroke="#475569" />
            {chart.segments.map((s, i) => (
              <line key={i}
                x1={s.x1} y1={s.y1}
                x2={s.x2} y2={s.y2}
                stroke={s.positive ? "#4ade80" : "#f87171"}
                strokeWidth="3"
              />
            ))}
          </svg>
        )}

        <button onClick={addWin}>WIN</button>
        <button onClick={addLoss}>LOSS</button>

        <button onClick={exportData}>Export</button>
        <button onClick={()=>fileInputRef.current.click()}>Import</button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={importData}
        />

      </div>
    </div>
  );
}
