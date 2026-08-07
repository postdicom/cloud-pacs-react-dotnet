import { useEffect, useRef, useState } from "react";
import "../stylesheets/dicomViewer.css";
import { RenderingEngine, Enums, type Types } from "@cornerstonejs/core";
import type { PublicViewportInput } from "@cornerstonejs/core/types";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as csToolsInit } from "@cornerstonejs/tools";
import {
  init as dicomImageLoaderInit,
  internal as dicomImageLoaderInternal,
} from "@cornerstonejs/dicom-image-loader";
import api from "../queryClientProvider";
import { useLocation, useNavigate } from "react-router-dom";
import type { Series } from "../interfaces/Series";

type ToolId = "wl" | "zoom" | "pan" | "scroll";
type PresetId = "brain" | "bone" | "lung" | "abd";

interface InstanceMeta {
  sopInstanceUid: string;
  instanceNumber: number;
  downloadUrl: string;
  metadata: Record<string, string>;
}

export default function DicomViewer() {
  const [activeTool, setActiveTool] = useState<ToolId>("wl");
  const [activePreset, setActivePreset] = useState<PresetId>("brain");
  const [inverted, setInverted] = useState(false);
  const [activeSeries, setActiveSeries] = useState<string>("");
  const [usableSeries, setUsableSeriesList] = useState<Series[]>([]);
  const [instances, setInstances] = useState<InstanceMeta[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);

  const location = useLocation();
  const { study, patient } = location.state || {};

  const navigate = useNavigate();
  const studyList = (patient: any) => {
    navigate("/studyList", { state: { patient } });
  };
  const patients = () => {
    navigate("/patientList");
  };

  const elementRef = useRef<HTMLDivElement>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  // Step 1/2: fetch series for the study
  useEffect(() => {
    if (!study?.id) return;
    const callApi = async () => {
      try {
        const { data } = await api.get(`api/v1/viewer/study/${study.id}/series`);
        setUsableSeriesList(data);
        if (data.length > 0) {
          setActiveSeries(data[0].seriesInstanceUid ?? data[0].id);
        }
      } catch (error) {
        console.log("Error " + error);
      }
    };
    callApi();
  }, [study?.id]);

  // Step 2/3: fetch instances for the selected series
  useEffect(() => {
    if (!activeSeries) return;
    const loadInstances = async () => {
      try {
        const { data } = await api.get(
          `api/v1/viewer/series/${activeSeries}/instances`
        );
        setInstances(data);
      } catch (error) {
        console.log("Error fetching instances: " + error);
        setInstances([]);
      }
    };
    loadInstances();
  }, [activeSeries]);

  // Step 3/4/5: build imageIds pointing directly at the backend download route.
  useEffect(() => {
    if (instances.length === 0) {
      setImageIds([]);
      return;
    }
    const API_BASE = "https://localhost:5001";
    const ids = instances.map(
      (inst) => `wadouri:${API_BASE}${inst.downloadUrl}`
    );
    setImageIds(ids);
  }, [instances]);

  useEffect(() => {
    if (!initPromiseRef.current) {
      initPromiseRef.current = (async () => {
        await csRenderInit();
        await csToolsInit();
        dicomImageLoaderInit({ maxWebWorkers: 1, useLegacyMetadataProvider: true });

        dicomImageLoaderInternal.setOptions({
          beforeSend: (xhr: XMLHttpRequest) => {
            const token = localStorage.getItem("token");
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          },
        });
      })();
    }
  }, []);

  // Step 6: build/rebuild the cornerstone stack whenever imageIds changes
  useEffect(() => {
    if (imageIds.length === 0 || !elementRef.current) return;

    let cancelled = false;

    const renderStack = async () => {
      if (initPromiseRef.current) {
        await initPromiseRef.current;
      }
      if (cancelled) return;

      const renderingEngineId = "DicomImageRenderingEngine";
      const renderingEngine =
        renderingEngineRef.current ?? new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      const viewportId = "CT";
      const viewportInput = {
        viewportId,
        type: Enums.ViewportType.STACK,
        element: elementRef.current,
        defaultOptions: {
          orientation: Enums.OrientationAxis.SAGITTAL,
        },
      };

      renderingEngine.enableElement(viewportInput as PublicViewportInput);
      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

      await viewport.setStack(imageIds);

      viewport.setProperties({
        voiRange: { lower: 0, upper: 255 },
      });

      viewport.render();
    };

    renderStack();

    return () => {
      cancelled = true;
      renderingEngineRef.current?.destroy();
      renderingEngineRef.current = null;
    };
  }, [imageIds]);

  useEffect(() => {
    if (!elementRef.current) return;
    const el = elementRef.current;

    const resizeObserver = new ResizeObserver(() => {
      renderingEngineRef.current?.resize(true, false);
    });
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  if (!study || !patient) {
    return <div>Missing study/patient context.</div>;
  }

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
            className={`dv-tool-btn ${activePreset === "brain" ? "dv-tool-btn--preset-active" : ""}`}
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
            {usableSeries.map((s) => {
              const key = s.seriesInstanceUid ?? s.id;
              return (
                <button
                  key={key}
                  className={`dv-series-btn ${activeSeries === key ? "dv-series-btn--active" : ""}`}
                  onClick={() => setActiveSeries(key)}
                >
                  {s.numberOfInstances} img
                </button>
              );
            })}
          </div>
        </aside>
        <main className="dv-viewport">
          <div className="dv-overlay-top-left">
            <span>{patient.name}</span>
            <div>{study.mod}</div>
            <div>{study.date}</div>
            <div>W:400 L:40</div>
          </div>

          <div
            ref={elementRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#000",
              display: imageIds.length > 0 ? "block" : "none",
            }}
          ></div>

          {imageIds.length === 0 && (
            <div className="dv-center-message">
              <div className="dv-placeholder-icon"></div>
              <p className="dv-center-title">DICOM image renders here</p>
              <p className="dv-center-subtitle">
                Cornerstone3D canvas · WebAssembly decoder
              </p>
            </div>
          )}

          <div className="dv-overlay-bottom-right">
            <div>Instance {instances.length > 0 ? `1/${instances.length}` : "–"}</div>
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
                <span className="dv-info-value">{study.imageCount}</span>
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