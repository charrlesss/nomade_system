import { useEffect, useState } from "react";
import api from "../services/api";

function SalesReportModal({ businessId, onClose }) {
  const [reportType, setReportType] = useState("monthly");

  // Current date: 2026-09-04
  const [selectedDate, setSelectedDate] = useState("2026-09");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD REPORT
  // ============================

  const generateReport = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/sales/${businessId}/report`, {
        params: {
          type: reportType,
          date: selectedDate,
        },
        responseType: "blob",
      });

      console.log("PDF response:", response);

      // Create PDF blob
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create temporary browser URL
      const pdfUrl = window.URL.createObjectURL(blob);

      // Open PDF in new browser tab
      const newTab = window.open(pdfUrl, "_blank");

      if (!newTab) {
        alert(
          "The PDF could not be opened. Please allow pop-ups for this site.",
        );
        return;
      }

      // Close modal
      onClose();

      // Clean up URL later
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } catch (err) {
      console.log(err);
      console.error("REPORT ERROR:", err);

      // Because responseType is blob,
      // backend errors can also arrive as a Blob.
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);

          alert(errorData.message || "Unable to generate sales report.");
        } catch {
          alert("Unable to generate sales report.");
        }
      } else {
        alert(
          err.response?.data?.message || "Unable to generate sales report.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever type/date changes
  //   useEffect(() => {
  //     if (businessId && selectedDate) {
  //       loadReport();
  //     }
  //   }, [
  //     businessId,
  //     reportType,
  //     selectedDate,
  //   ]);

  // ============================
  // FORMAT MONEY
  // ============================

  const formatMoney = (value) => {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ============================
  // FORMAT DATE
  // ============================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================
  // PERIOD LABEL
  // ============================

  const getPeriodLabel = () => {
    if (!report) {
      return "Loading...";
    }

    if (reportType === "monthly") {
      const date = new Date(`${selectedDate}-01T00:00:00`);

      return date.toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      });
    }

    if (reportType === "yearly") {
      return selectedDate;
    }

    if (reportType === "weekly") {
      return `${formatDate(report.start_date)} - ${formatDate(
        report.end_date,
      )}`;
    }

    return "";
  };

  // ============================
  // PERIOD INPUT
  // ============================

  const renderPeriodInput = () => {
    if (reportType === "monthly") {
      return (
        <input
          type="month"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      );
    }

    if (reportType === "yearly") {
      return (
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {Array.from({ length: 10 }, (_, index) => {
            const year = new Date().getFullYear() - index;

            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      );
    }

    if (reportType === "weekly") {
      return (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      );
    }

    return null;
  };

  return (
    <div className="sales-report-overlay" onClick={onClose}>
      <div className="sales-report-modal" onClick={(e) => e.stopPropagation()}>
        {/* ============================
            HEADER
        ============================ */}

        <div className="sales-report-header">
          <div>
            <h2>Sales Report</h2>

            {report && <span>{getPeriodLabel()}</span>}
          </div>

          <button className="sales-report-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* ============================
            BODY
        ============================ */}

        <div className="sales-report-body">
          {/* REPORT TYPE */}

          <div className="report-tabs">
            <button
              className={`  ${reportType === "weekly" ? "active" : ""}`}
              onClick={() => {
                setReportType("weekly");

                // Convert current month
                // to today's date
                setSelectedDate(`${selectedDate}-01`);
              }}
            >
              Weekly
            </button>

            <button
              className={reportType === "monthly" ? "active" : ""}
              onClick={() => setReportType("monthly")}
            >
              Monthly
            </button>

            <button
              className={reportType === "yearly" ? "active" : ""}
              onClick={() => {
                setReportType("yearly");

                setSelectedDate(selectedDate.substring(0, 4));
              }}
            >
              Yearly
            </button>
          </div>

          {/* PERIOD */}

          <div className="report-period">
            <label>Period</label>

            {renderPeriodInput()}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="report-loading">
              <div className="report-spinner"></div>
              <span>Loading report...</span>
            </div>
          )}

          {/* REPORT */}

          {!loading && report && (
            <>
              {/* ============================
                  SUMMARY
              ============================ */}

              <div className="report-summary">
                <div className="summary-row">
                  <span>Total Sales</span>

                  <strong>{formatMoney(report.summary.total_sales)}</strong>
                </div>

                <div className="summary-row">
                  <span>Cash Sales</span>

                  <strong>{formatMoney(report.summary.cash_sales)}</strong>
                </div>

                <div className="summary-row">
                  <span>GCash Sales</span>

                  <strong>{formatMoney(report.summary.gcash_sales)}</strong>
                </div>

                <div className="summary-row">
                  <span>Other Sales</span>

                  <strong>{formatMoney(report.summary.other_sales)}</strong>
                </div>

                <div className="summary-row">
                  <span>Total Cups</span>

                  <strong>
                    {Number(report.summary.total_cups || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* ============================
                  TABLE
              ============================ */}

              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sales</th>
                      <th>Cups</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.details.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="empty-report">
                          No sales found for this period.
                        </td>
                      </tr>
                    ) : (
                      report.details.map((row, index) => (
                        <tr key={index}>
                          <td>{formatDate(row.sales_date)}</td>

                          <td>{formatMoney(row.gross_sales)}</td>

                          <td>{Number(row.cups || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ============================
            FOOTER
        ============================ */}

        <div className="sales-report-footer">
          <button
            className="report-print-btn"
            onClick={generateReport}
            disabled={loading}
          >
            Print
          </button>

          <button className="report-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesReportModal;
