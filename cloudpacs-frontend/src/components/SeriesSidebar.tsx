import type { Series } from "../interfaces/Series";
import "../stylesheets/dicomViewer.css";

interface SeriesSidebarProps {
  usableSeries: Series[];
  activeSeries: string;
  onSelectSeries: (key: string) => void;
}

export default function SeriesSidebar({
  usableSeries,
  activeSeries,
  onSelectSeries,
}: SeriesSidebarProps) {
  return (
    <aside className="dv-sidebar-left">
      <h2 className="dv-section-title">Series</h2>
      <div className="dv-series-list">
        {usableSeries.map((s) => {
          const key = s.seriesInstanceUid ?? s.id;
          return (
            <button
              key={key}
              className={`dv-series-btn ${activeSeries === key ? "dv-series-btn--active" : ""}`}
              onClick={() => onSelectSeries(key)}
            >
              {s.numberOfInstances} img
            </button>
          );
        })}
      </div>
    </aside>
  );
}