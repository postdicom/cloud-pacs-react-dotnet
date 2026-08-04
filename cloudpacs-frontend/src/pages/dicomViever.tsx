import { useEffect, useState } from "react";
import "../stylesheets/dicomViewer.css";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../queryClientProvider";
import type { Series } from "../interfaces/Series";

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
  let [series, setSeries] = useState([]);
  let [usableSeries, setUsableSeriesList] = useState<Series[]>([]);

  const location = useLocation();
  const { study, patient } = location.state || {};

  const navigate = useNavigate();
  const studyList = (patient) => {
    navigate("/studyList", {
      state: { patient }
    });
  };

  const patients = () => {
    navigate("/patientList");
  };

  useEffect(() => {
    const callApi = async () => {
      try {
        const data = await api.get(`api/v1/studies/${study.id}/series`); //try with the og studyrep
        series = data.data;
        Array.from(series).forEach(element => {
          const series: Series = element;
          setUsableSeriesList((prev) => [...prev, series]);
        });

      } catch (error) {
        console.log("Error " + error);
      }
    }
    callApi();
  }, []);

  return (
    <div className="dv-reader">
      <header className="dv-topbar">
        <div className="dv-topbar__tools">
          <button
            className={`dv-tool-btn ${activeTool === "wl" ? "dv-tool-btn--active" : ""}`}
            onClick={() => setActiveTool("wl")}
          >
            W/L
          </button>
          <button
            className={`dv-tool-btn ${activeTool === "zoom" ? "dv-tool-btn--active" : ""}`}
            onClick={() => setActiveTool("zoom")}
          >
            Zoom
          </button>
          <button
            className={`dv-tool-btn ${activeTool === "pan" ? "dv-tool-btn--active" : ""}`}
            onClick={() => setActiveTool("pan")}
          >
            Pan
          </button>
          <button
            className={`dv-tool-btn ${activeTool === "scroll" ? "dv-tool-btn--active" : ""}`}
            onClick={() => setActiveTool("scroll")}
          >
            Scroll
          </button>

          <span className="dv-topbar__divider" />

          <button
            className={`dv-tool-btn ${activePreset === "brain" ? "dv-tool-btn--preset-active" : ""
              }`}
            onClick={() => setActivePreset("brain")}
          >
            Brain
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "bone" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => setActivePreset("bone")}
          >
            Bone
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "lung" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => setActivePreset("lung")}
          >
            Lung
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "abd" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => setActivePreset("abd")}
          >
            Abd
          </button>
          <span className="dv-topbar__divider" />
          <button
            className={`dv-tool-btn ${inverted ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => setInverted((v) => !v)}
          >
            Invert
          </button>
        </div>

        <div className="dv-topbar__meta">
          <div className="dv-topbar__breadcrumb">
            <div className="dv-topbar__link" onClick={() => patients()}>
              Patients
            </div>
            <span className="dv-topbar__slash">/</span>
            <div className="dv-topbar__link" onClick={() => studyList(patient)}>
              {patient.name}
              <br />
            </div>
          </div>
          <div className="dv-topbar__study">
            {study.mod}
            <br />
            {study.date}
          </div>
        </div>
      </header>

      <div className="dv-body">
        <aside className="dv-sidebar-left">
          <h2 className="dv-section-title">Series</h2>
          <div className="dv-series-list">
            {usableSeries.map((series: Series) => (
              <button
                key={series.id}
                className={`dv-series-btn ${activeSeries === series.id ? "dv-series-btn--active" : ""
                  }`}
                onClick={() => setActiveSeries(series.id)}
              >
                {series.numberOfInstances} img
              </button>
            ))
            }
          </div>
        </aside>
        <main className="dv-viewport">
          <div className="dv-overlay-top-left">
            <span>{patient.name}</span>
            <div>{study.mod}</div> {/*!! Area isn't shared */}
            <div>{study.date}</div>
            <div>W:400 L:40</div>
          </div>

          <div className="dv-center-message">
            <div className="dv-placeholder-icon"></div>
            <p className="dv-center-title">DICOM image renders here</p>
            <p className="dv-center-subtitle">
              Cornerstone3D canvas · WebAssembly decoder
            </p>
          </div>

          <div className="dv-overlay-bottom-right">
            <div>Instance 14/48</div>
            <div>Slice: 7.5mm</div>
            <div>FOV: 350mm</div>
          </div>
        </main>
        <aside className="dv-sidebar-right">
          <section className="dv-sidebar-section">
            <h2 className="dv-section-title">Study</h2>
            <div className="dv-info-table">
              <div className="dv-info-row">
                <span className="dv-info-label">Patient</span>
                <span className="dv-info-value">{patient.name}</span>
              </div>
              <div className="dv-info-row">
                <span className="dv-info-label">Modality</span>
                <span className="dv-info-value">{study.mod}</span>
              </div>
              <div className="dv-info-row">
                <span className="dv-info-label">Date</span>
                <span className="dv-info-value">{study.date}</span>
              </div>
              <div className="dv-info-row">
                <span className="dv-info-label">Series</span>
                <span className="dv-info-value">{study.series}</span>
              </div>
              <div className="dv-info-row">
                <span className="dv-info-label">Instances</span>
                <span className="dv-info-value">{study.imageCount}</span> {/* Is image and instance used interchangable here? */}
              </div>
            </div>
          </section>

          <hr className="dv-sidebar-divider" />

          <section className="dv-sidebar-section">
            <h2 className="dv-section-title">AI Report</h2>
            <button className="dv-ai-button">Generate AI draft</button>
            <p className="dv-disclaimer">
              Local LLM only. No patient data sent externally.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
