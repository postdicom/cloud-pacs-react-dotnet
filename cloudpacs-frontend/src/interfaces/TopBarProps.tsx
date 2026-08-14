export interface TopBarProps {
  activeTool: "WindowLevel" | "Zoom" | "Pan" | "scroll";
  activePreset: "brain" | "bone" | "lung" | "abd";
  inverted: boolean;
  onSelectTool: (tool: "WindowLevel" | "Zoom" | "Pan") => void;
  onSelectPreset: (preset: "brain" | "bone" | "lung" | "abd") => void;
  onToggleInvert: () => void;
  patient: any;
  study: any;
  onNavigateToPatients: () => void;
  onNavigateToStudyList: () => void;
}