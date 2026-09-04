import { useEffect, useState } from "react";
import api from "../services/api";

function ExpenseReportModal({ show, onClose, businessId }) {
  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getCurrentMonth = () => {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  };

  const emptyForm = {
    report_type: "monthly",
    report_date: getCurrentMonth(),
    category: "",
  };

  const [form, setForm] = useState({
    report_type: "monthly",
    report_date: getCurrentMonth(),
    category: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        report_type: "monthly",
        report_date: getCurrentMonth(),
        category: "",
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ================================
    // REPORT TYPE
    // ================================

    if (name === "report_type") {
      let reportDate = form.report_date;

      // ================================
      // DAILY
      // ================================

      if (value === "daily") {
        // 2026-08 -> 2026-08-01
        if (reportDate.length === 7) {
          reportDate = `${reportDate}-01`;
        }

        // 2026 -> 2026-01-01
        if (reportDate.length === 4) {
          reportDate = `${reportDate}-01-01`;
        }
      }

      // ================================
      // MONTHLY
      // ================================

      if (value === "monthly" || value === "monthly_summary") {
        // 2026-08-07 -> 2026-08
        if (reportDate.length === 10) {
          reportDate = reportDate.substring(0, 7);
        }

        // 2026 -> 2026-01
        if (reportDate.length === 4) {
          reportDate = `${reportDate}-01`;
        }
      }

      // ================================
      // YEARLY
      // ================================

      if (value === "yearly") {
        // 2026-08-07 -> 2026
        // 2026-08    -> 2026
        // 2026       -> 2026

        if (reportDate.length >= 4) {
          reportDate = reportDate.substring(0, 4);
        }
      }

      // ================================
      // UPDATE FORM
      // ================================

      setForm({
        ...form,

        report_type: value,

        report_date: reportDate,
      });

      return;
    }

    // ================================
    // OTHER FIELDS
    // ================================

    setForm({
      ...form,
      [name]: value,
    });
  };
  const generateReport = async () => {
    try {
      setLoading(true);

      const response = await api.get("/expenses/report", {
        params: {
          business_id: businessId,
          report_type: form.report_type,
          report_date: form.report_date,
          category: form.category,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = window.URL.createObjectURL(blob);

      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 10000);

      onClose();
    } catch (err) {
      console.log(err);

      alert("Unable to generate expense report.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show stock-modal-main"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          {/* HEADER */}

          <div className="modal-header">
            <h5 className="modal-title">Create Expense Report</h5>

            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}

          <div className="modal-body">
            {/* REPORT TYPE */}

            <div className="mb-1">
              <label className="form-label">Report Type</label>

              <select
                className="form-select stock-modal-field"
                name="report_type"
                value={form.report_type}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>

                <option value="daily">Daily</option>

                <option value="yearly">Yearly</option>
                <option value="monthly_summary">Monthly Summary</option>
              </select>
            </div>

            {/* DATE */}

            {/* DATE */}

            <div className="mb-1">
              <label className="form-label">Date</label>

              {form.report_type === "daily" && (
                <input
                  type="date"
                  className="form-control stock-modal-field"
                  name="report_date"
                  value={form.report_date}
                  onChange={handleChange}
                />
              )}

              {(form.report_type === "monthly" ||
                form.report_type === "monthly_summary") && (
                <input
                  type="month"
                  className="form-control stock-modal-field"
                  name="report_date"
                  value={form.report_date}
                  onChange={handleChange}
                />
              )}

              {form.report_type === "yearly" && (
                <select
                  className="form-select stock-modal-field"
                  name="report_date"
                  value={form.report_date}
                  onChange={handleChange}
                >
                  {Array.from({ length: 6 }, (_, index) => {
                    const year = new Date().getFullYear() - index;

                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* CATEGORY */}

            <div className="mb-1">
              <label className="form-label">Category</label>

              <select
                className="form-select stock-modal-field"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">All Categories</option>
                <option value={"Electricity"}>Electricity</option>
                <option value={"Water"}>Water</option>
                <option value={"Business Improvement"}>
                  Business Improvement
                </option>
                <option value={"Internet"}>Internet</option>
                <option value={"Food"}>Food</option>
                <option value={"Transportation"}>Transportation</option>
                <option value={"Motorcycle Maintenance"}>
                  Motorcycle Maintenance
                </option>
                <option value={"Fuel"}>Fuel</option>
                <option value={"Rent"}>Rent</option>
                <option value={"Salary"}>Salary</option>
                <option value={"Supplies"}>Supplies</option>
                <option value={"Ingredients"}>Ingredients</option>
                <option value={"Equipment"}>Equipment</option>
                <option value={"Marketing"}>Marketing</option>
                <option value={"Bank"}>Bank Loan</option>
                <option value={"Shopee"}>Shopee Loan</option>
                <option value={"Taxes"}>Taxes</option>
                <option value={"Miscellaneous"}>Miscellaneous</option>
                <option value={"Ice Supply"}>Ice Supply</option>
                <option value={"Stocks"}>Stocks</option>
                <option value={"Shipping"}>Shipping</option>
                <option value={"Another Business"}>Another Business</option>
              </select>
            </div>
          </div>

          {/* FOOTER */}

          <div className="modal-footer">
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseReportModal;
