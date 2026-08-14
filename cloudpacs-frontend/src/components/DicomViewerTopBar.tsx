import type { TopBarProps } from "../interfaces/TopBarProps.tsx";
export default function DicomViewerTopBar({
  activeTool,
  activePreset,
  inverted,
  onSelectTool,
  onSelectPreset,
  onToggleInvert,
  patient,
  study,
  onNavigateToPatients,
  onNavigateToStudyList,
}: TopBarProps) {
  return (
    <header className="dv-topbar">
      <div className="dv-topbar__tools">
        <button
          className={`dv-tool-btn ${activeTool === "WindowLevel" ? "dv-tool-btn--active" : ""}`}
          onClick={() => onSelectTool("WindowLevel")}
        >
          W/L
        </button>
        <button
          className={`dv-tool-btn ${activeTool === "Zoom" ? "dv-tool-btn--active" : ""}`}
          onClick={() => onSelectTool("Zoom")}
        >
          Zoom
        </button>
        <button
          className={`dv-tool-btn ${activeTool === "Pan" ? "dv-tool-btn--active" : ""}`}
          onClick={() => onSelectTool("Pan")}
        >
          Pan
        </button>

        <span className="dv-topbar__divider" />

        <button
          className={`dv-tool-btn ${activePreset === "brain" ? "dv-tool-btn--preset-active" : ""}`}
          onClick={() => onSelectPreset("brain")}
        >
          Brain
        </button>
        <button
          className={`dv-tool-btn ${activePreset === "bone" ? "dv-tool-btn--preset-active" : ""}`}
          onClick={() => onSelectPreset("bone")}
        >
          Bone
        </button>
        <button
          className={`dv-tool-btn ${activePreset === "lung" ? "dv-tool-btn--preset-active" : ""}`}
          onClick={() => onSelectPreset("lung")}
        >
          Lung
        </button>
        <button
          className={`dv-tool-btn ${activePreset === "abd" ? "dv-tool-btn--preset-active" : ""}`}
          onClick={() => onSelectPreset("abd")}
        >
          Abd
        </button>
        <span className="dv-topbar__divider" />
        <button
          className={`dv-tool-btn ${inverted ? "dv-tool-btn--preset-active" : ""}`}
          onClick={onToggleInvert}
        >
          Invert
        </button>
      </div>

      <div className="dv-topbar__meta">
        <div className="dv-topbar__breadcrumb">
          <div className="dv-topbar__link" onClick={onNavigateToPatients}>
            Patients
          </div>
          <span className="dv-topbar__slash">/</span>
          <div className="dv-topbar__link" onClick={onNavigateToStudyList}>
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
  );
}