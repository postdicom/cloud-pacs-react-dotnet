import React, { useState } from "react";
import "../stylesheets/dicomViewer.css";

type ToolId = "wl" | "zoom" | "pan" | "scroll";
type PresetId = "brain" | "bone" | "lung" | "abd";

interface SeriesItem {
  id: string;
  imageCount: number;
}

const SERIES: SeriesItem[] = [
  { id: "s1", imageCount: 148 },
  { id: "s2", imageCount: 212 },
  { id: "s3", imageCount: 36 },
];

export default function dicomViewer() {
  const [activeTool, setActiveTool] = useState<ToolId>("wl");
  const [activePreset, setActivePreset] = useState<PresetId>("brain");
  const [inverted, setInverted] = useState(false);
  const [activeSeries, setActiveSeries] = useState<string>("s1");

  return (
    <div className="viewer">
      <header className="topbar">
        <div className="topbar__tools">
          <button
            className={`tool-btn ${activeTool === "wl" ? "tool-btn--active" : ""}`}
            onClick={() => setActiveTool("wl")}
          >
            W/L
          </button>
          <button
            className={`tool-btn ${activeTool === "zoom" ? "tool-btn--active" : ""}`}
            onClick={() => setActiveTool("zoom")}
          >
            Zoom
          </button>
          <button
            className={`tool-btn ${activeTool === "pan" ? "tool-btn--active" : ""}`}
            onClick={() => setActiveTool("pan")}
          >
            Pan
          </button>
          <button
            className={`tool-btn ${activeTool === "scroll" ? "tool-btn--active" : ""}`}
            onClick={() => setActiveTool("scroll")}
          >
            Scroll
          </button>

          <span className="topbar__divider" />

          <button
            className={`tool-btn tool-btn--preset ${
              activePreset === "brain" ? "tool-btn--preset-active" : ""
            }`}
            onClick={() => setActivePreset("brain")}
          >
            Brain
          </button>
          <button
            className={`tool-btn ${activePreset === "bone" ? "tool-btn--preset-active " : ""}`}
            onClick={() => setActivePreset("bone")}
          >
            Bone
          </button>
          <button
            className={`tool-btn ${activePreset === "lung" ? "tool-btn--preset-active " : ""}`}
            onClick={() => setActivePreset("lung")}
          >
            Lung
          </button>
          <button
            className={`tool-btn ${activePreset === "abd" ? "tool-btn--preset-active " : ""}`}
            onClick={() => setActivePreset("abd")}
          >
            Abd
          </button>
          <span className="topbar__divider" />
          <button
            className={`tool-btn tool-btn--invert ${inverted ? "tool-btn--preset-active " : ""}`}
            onClick={() => setInverted((v) => !v)}
          >
            Invert
          </button>
        </div>

        <div className="topbar__meta">
          <div className="topbar__breadcrumb">
            <a className="topbar__link" href="#patients">
              Patients
            </a>
            <span className="topbar__slash">/</span>
            <a className="topbar__link" href="#patient">
              Smith,
              <br />
              Jane A.
            </a>
          </div>
          <div className="topbar__study">
            CT
            <br />
            Chest
            <br />
            — 14
            <br />
            Jul
            <br />
            2026
          </div>
        </div>
      </header>
      </div>
  );
}
