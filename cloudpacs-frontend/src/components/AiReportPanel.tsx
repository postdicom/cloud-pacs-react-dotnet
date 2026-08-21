import { useEffect, useState } from "react";
import type { RenderingEngine } from "@cornerstonejs/core";
import { useMutation } from "@tanstack/react-query";
import api from "../queryClientProvider";
import { API_BASE_URL } from "../config";
import type { Report } from "../interfaces/Reports.tsx";

interface AiReportPanelProps {
  study: any;
  patient: any;
  renderingEngineRef: React.RefObject<RenderingEngine | null>;
  viewportId: string;
  onReturnToDetails: () => void;
}

export default function AiReportPanel({
  study,
  patient,
  renderingEngineRef,
  viewportId,
  onReturnToDetails,
}: AiReportPanelProps) {
  const [usableReports, setUsableReportsList] = useState<Report[]>([]);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportText, setReportText] = useState("");
  const [reportSaveError, setReportSaveError] = useState<string | null>(null);

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
    const base64Data = dataUrl.split(",")[1];

    setReportLoading(true);
    setReportError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/generate`, {
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
    onSuccess: (updated) => {
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

  return (
    <>
      <section className="dv-sidebar-section">
        <button className="dv-ai-button" onClick={onReturnToDetails}>
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
    </>
  );
}