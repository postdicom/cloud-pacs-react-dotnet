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
import type { InstanceMeta } from "../interfaces/InstanceMeta.tsx";
import DicomViewerTopBar from "../components/DicomViewerTopBar";
import SeriesSidebar from "../components/SeriesSidebar.tsx";
import AiReportPanel from "../components/AiReportPanel";

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
  const [instances, setInstances] = useState<InstanceMeta[]>([]);
  const [imageIds, setImageIds] = useState<string[]>([]);

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

  function handleSelectTool(tool: ToolId) {
    setActiveTool(tool);
    chooseTool(tool);
  }

  function handleSelectPreset(preset: PresetId) {
    setActivePreset(preset);
    setPresetWL(preset);
  }

  function handleToggleInvert() {
    setInverted((v) => !v);
    invert();
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
      <DicomViewerTopBar
        activeTool={activeTool}
        activePreset={activePreset}
        inverted={inverted}
        onSelectTool={handleSelectTool}
        onSelectPreset={handleSelectPreset}
        onToggleInvert={handleToggleInvert}
        patient={patient}
        study={study}
        onNavigateToPatients={patients}
        onNavigateToStudyList={() => studyList(patient)}
      />

      <div className="dv-body">
        <SeriesSidebar
          usableSeries={usableSeries}
          activeSeries={activeSeries}
          onSelectSeries={setActiveSeries}
        />

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
            <AiReportPanel
              study={study}
              patient={patient}
              renderingEngineRef={renderingEngineRef}
              viewportId={viewportId}
              onReturnToDetails={() => setActiveTab("Details")}
            />
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
    </div>
  );
}