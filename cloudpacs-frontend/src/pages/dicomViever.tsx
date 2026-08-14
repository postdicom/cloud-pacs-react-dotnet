import { useEffect, useRef, useState } from "react";
import "../stylesheets/dicomViewer.css";
import { RenderingEngine, Enums, type Types, utilities as csUtils } from "@cornerstonejs/core";
import type { PublicViewportInput } from "@cornerstonejs/core/types";
import { init as coreInit } from '@cornerstonejs/core';
import { init as csToolsInit, ToolGroupManager, WindowLevelTool, ZoomTool, PanTool } from "@cornerstonejs/tools";
import {
  init as dicomImageLoaderInit,
  internal as dicomImageLoaderInternal,
} from "@cornerstonejs/dicom-image-loader";
import api from "../queryClientProvider";
import { useLocation, useNavigate } from "react-router-dom";
import type { Series } from "../interfaces/Series";
import * as cornerstoneTools from '@cornerstonejs/tools';
import { MouseBindings } from "@cornerstonejs/tools/enums";
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';
import { useMutation } from "@tanstack/react-query";
import type { Report } from "../interfaces/Reports.tsx";
import type { InstanceMeta } from "../interfaces/InstanceMeta.tsx";

type ToolId = "WindowLevel" | "Zoom" | "Pan" | "scroll";
type PresetId = "brain" | "bone" | "lung" | "abd";
type TabId = "Details" | "AI Report";

export default function DicomViewer() {
  const [activeTool, setActiveTool] = useState<ToolId>("WindowLevel");
  const [activePreset, setActivePreset] = useState<PresetId>("brain");
  const [inverted, setInverted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("Details");
  const [activeSeries, setActiveSeries] = useState<string>("");
  const [usableSeries, setUsableSeriesList] = useState<Series[]>([]);
  const [usableReports, setUsableReportsList] = useState<Report[]>([]);
  const [instances, setInstances] = useState<InstanceMeta[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportFindings, setReportFindings] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportText, setReportText] = useState("");
  const [reportSaveError, setReportSaveError] = useState<string | null>(null);

  const viewportId = "CT";
  const renderingEngineId = "DicomImageRenderingEngine";
  const toolGroupId = 'STACK_TOOL_GROUP_ID';

  const { PanTool, StackScrollTool, ZoomTool, WindowLevelTool } = cornerstoneTools;
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(StackScrollTool);
  cornerstoneTools.addTool(ZoomTool);

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
  // Fetch previous reports for the study
  useEffect(() => {
    if (!study?.id) return;
    const callApi = async () => {
      try {
        const { data } = await api.get(`api/v1/reports/${study.id}`);
        setUsableReportsList(data);
      } catch (error) {
        console.log("Error fetching reports: " + error);
        setUsableReportsList([]);
      }
    };
    callApi();
  }, [study?.id]);
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
        dicomImageLoaderInit({ maxWebWorkers: 1, useLegacyMetadataProvider: true });

        dicomImageLoaderInternal.setOptions({
          beforeSend: (xhr: XMLHttpRequest) => {
            const token = localStorage.getItem("token");
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          },
        });
        await setToolGroup();
      })();
    }
  }, []);

  // Step 6: build/rebuild the cornerstone stack whenever imageIds changes
  useEffect(() => {
    if (imageIds.length === 0 || !elementRef.current) return;

    let cancelled = false;
    chooseTool("WindowLevel");

    const renderStack = async () => {
      if (initPromiseRef.current) {
        await initPromiseRef.current;
      }
      if (cancelled) return;

      const renderingEngine =
        renderingEngineRef.current ?? new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

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

  async function setToolGroup() {
    await coreInit();
    await cornerstoneToolsInit();

    let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

    if (!toolGroup) {
      toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        throw new Error(`Failed to create tool group: ${toolGroupId}`);
      }
    }

    if (!toolGroup.toolOptions[PanTool.toolName]) { toolGroup.addTool(PanTool.toolName); }
    if (!toolGroup.toolOptions[ZoomTool.toolName]) { toolGroup.addTool(ZoomTool.toolName); }
    if (!toolGroup.toolOptions[StackScrollTool.toolName]) { toolGroup.addTool(StackScrollTool.toolName, { loop: false }); }
    if (!toolGroup.toolOptions[WindowLevelTool.toolName]) { toolGroup.addTool(WindowLevelTool.toolName); }

    chooseTool("WindowLevel");

    toolGroup.addViewport(viewportId, renderingEngineId);

    toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Wheel
        },
      ],
    });
  }

  function chooseTool(chosenTool) {
    const renderingEngine =
      renderingEngineRef.current ?? new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) {
      toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        throw new Error(`Failed to create tool group: ${toolGroupId}`);
      }
    }

    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolPassive(PanTool.toolName);
    toolGroup.setToolPassive(WindowLevelTool.toolName);
    toolGroup.setToolActive((chosenTool), {
      bindings: [
        {
          mouseButton: MouseBindings.Primary
        },
      ],
    });

    toolGroup.addViewport(viewportId, renderingEngineId);
  }

  function invert() {
    const renderingEngine =
      renderingEngineRef.current ?? new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

    const { invert } = viewport.getProperties();
    viewport.setProperties({ invert: !invert });
    viewport.render();
  }

  function setPresetWL(presetName) {
    const renderingEngine =
      renderingEngineRef.current ?? new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

    let { lower, upper } = csUtils.windowLevel.toLowHighRange(70, 30);
    if (presetName === "brain") { ({ lower, upper } = csUtils.windowLevel.toLowHighRange(60, 40)); }
    else if (presetName === "bone") { ({ lower, upper } = csUtils.windowLevel.toLowHighRange(2500, 480)); }
    else if (presetName === "lung") { ({ lower, upper } = csUtils.windowLevel.toLowHighRange(1500, -600)); }
    else if (presetName === "abd") { ({ lower, upper } = csUtils.windowLevel.toLowHighRange(350, 50)); }

    viewport.setProperties({ voiRange: { lower, upper } });
    viewport.render();
  }
  async function generateAiReport() {
    if (!renderingEngineRef.current) {
      setReportError("Viewer is not ready yet.");
      return;
    }

    const viewport = renderingEngineRef.current.getViewport(viewportId);
    if (!viewport) {
      setReportError("Viewer is not ready yet.");
      return;
    }

    const canvas = viewport.getCanvas();
    if (!canvas) {
      setReportError("No image is currently displayed.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1]; // strip "data:image/png;base64," prefix

    setReportLoading(true);
    setReportError(null);
    setReportFindings(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://localhost:5001/api/v1/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studyId: study.id,
          imageBase64: base64Data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body returned.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentFindings = "";
      let isCompleteEvent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event: complete")) {
            isCompleteEvent = true;
          }
          else if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (!dataStr) continue;

            const parsedData = JSON.parse(dataStr);
            if (isCompleteEvent || parsedData.id) {
              setUsableReportsList((prev) => [...prev, parsedData]);
              isCompleteEvent = false;
            }
            else {
              currentFindings += parsedData;
              setReportFindings(currentFindings);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error generating AI report: ", error);
      setReportError("Failed to generate report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  }

  function openReport(r: Report) {
    setSelectedReport(r);
    setReportText(r.findings ?? "");
    setReportModalOpen(true);
    setReportSaveError(null);
  }

  function closeReportModal() {
    setReportModalOpen(false);
    setSelectedReport(null);
    setReportText("");
    setReportSaveError(null);
  }

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReport) throw new Error("No report selected");
      const { data } = await api.put(`api/v1/reports/${selectedReport.id}`, {
        findings: reportText,
      });
      return data as Report;
    },
    onSuccess: (updated) => 
    {
      setUsableReportsList((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedReport(updated);
    },
    onError: () => setReportSaveError("Failed to save report. Please try again."),
  });

  function handlePrintReport() {
    window.print();
  }

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
            className={`dv-tool-btn ${activeTool === "WindowLevel" ? "dv-tool-btn--active" : ""}`}
            onClick={() => { setActiveTool("WindowLevel"); chooseTool("WindowLevel") }}
          >
            W/L
          </button>
          <button
            className={`dv-tool-btn ${activeTool === "Zoom" ? "dv-tool-btn--active" : ""}`}
            onClick={() => { setActiveTool("Zoom"); chooseTool("Zoom") }}
          >
            Zoom
          </button>
          <button
            className={`dv-tool-btn ${activeTool === "Pan" ? "dv-tool-btn--active" : ""}`}
            onClick={() => { setActiveTool("Pan"); chooseTool("Pan") }}
          >
            Pan
          </button>

          <span className="dv-topbar__divider" />

          <button
            className={`dv-tool-btn ${activePreset === "brain" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => { setActivePreset("brain"); setPresetWL("brain") }}
          >
            Brain
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "bone" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => { setActivePreset("bone"); setPresetWL("bone") }}
          >
            Bone
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "lung" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => { setActivePreset("lung"); setPresetWL("lung") }}
          >
            Lung
          </button>
          <button
            className={`dv-tool-btn ${activePreset === "abd" ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => { setActivePreset("abd"); setPresetWL("abd") }}
          >
            Abd
          </button>
          <span className="dv-topbar__divider" />
          <button
            className={`dv-tool-btn ${inverted ? "dv-tool-btn--preset-active" : ""}`}
            onClick={() => { setInverted((v) => !v); invert() }}
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
        <main className="dv-viewport" id="content">
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
          {activeTab === "AI Report" ? (
            <section className="dv-sidebar-section">
              <button
                className="dv-ai-button"
                onClick={() => setActiveTab("Details")}
              >
                Return to Details
              </button>
              <h2 className="dv-section-title">AI Report</h2>

              <button
                className="dv-ai-button"
                onClick={generateAiReport}
                disabled={reportLoading}
              >
                {reportLoading ? "Generating..." : "Generate Report"}
              </button>

              {reportError && <p className="dv-disclaimer">{reportError}</p>}

              {reportFindings && (
                <div className="dv-info-table">
                </div>
              )}

              <h2 className="dv-section-title">Previous Reports</h2>
              <div className="dv-series-list">
                {usableReports.map((r, index) => (
                  <button
                    key={r.id}
                    className={`dv-series-btn ${selectedReport?.id === r.id ? "dv-series-btn--active" : ""}`}
                    onClick={() => openReport(r)}
                  >
                    V{index + 1}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="dv-sidebar-section">
              <button
                className="dv-ai-button"
                onClick={() => setActiveTab("AI Report")}
              >
                AI Report
              </button>
              <p className="dv-disclaimer">
                Local LLM only. No patient data sent externally.
              </p>

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
          )}

          <hr className="dv-sidebar-divider" />
        </aside>
      </div>

      {reportModalOpen && selectedReport && (
        <div className="dv-modal-overlay" onClick={closeReportModal}>
          <div className="dv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dv-modal__header">
              <h3>Report — {selectedReport.createdByUserName ?? "Unknown"}</h3>
              <button className="dv-modal__close" onClick={closeReportModal}>×</button>
            </div>

            <textarea
              className="dv-modal__textarea"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={16}
            />

            {reportSaveError && <p className="dv-disclaimer">{reportSaveError}</p>}
            {saveReportMutation.isSuccess && <p className="dv-save-success">Saved.</p>}

            <div className="dv-modal__actions">
              <button
                className="dv-ai-button"
                onClick={() => saveReportMutation.mutate()}
                disabled={saveReportMutation.isPending || reportText.trim().length === 0}
              >
                {saveReportMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button className="dv-ai-button" onClick={handlePrintReport}>
                Print / Save as PDF
              </button>
            </div>
          </div>

          <div className="dv-print-report">
            <h1>Radiology Report</h1>
            <div className="dv-print-meta">
              <div><strong>Patient:</strong> {patient.name}</div>
              <div><strong>Modality:</strong> {study.mod}</div>
              <div><strong>Study Date:</strong> {study.date}</div>
              <div><strong>Author:</strong> {selectedReport.createdByUserName}</div>
            </div>
            <hr />
            <div className="dv-print-findings">{reportText}</div>
          </div>
        </div>
      )}
    </div>
  );
}