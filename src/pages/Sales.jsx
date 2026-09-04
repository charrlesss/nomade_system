import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useSearchParams } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import api from "../services/api";
import "../styles/sales.css";
import "../styles/stock.css";
import SalesReportModal from "../components/SalesReportModal";
// ========================================
// DATE HELPERS
// ========================================

const getLocalDateString = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const formatApiDate = (date) => {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};

const getDateOnly = (date) => {
  const d = new Date(date);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const getTodayDate = () => {
  const date = new Date();

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

function SalesTracking() {
  const [searchParams] = useSearchParams();

  const business = searchParams.get("business");

  // ========================================
  // CALENDAR
  // ========================================

  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(new Date());

  // ========================================
  // LOADING
  // ========================================

  const [loading, setLoading] = useState(false);

  // ========================================
  // SALES
  // ========================================

  const [sales, setSales] = useState([]);

  const [salesAnalytics, setSalesAnalytics] = useState({
    gross_sales: "0.00",
    cash_sales: "0.00",
    gcash_sales: "0.00",
    other_sales: "0.00",
    cups: "0",
    average_day: "0.00",
    highest_sales: "0.00",
    lowest_sales: "0.00",
  });

  // ========================================
  // EDITING
  // ========================================

  const [editing, setEditing] = useState(false);

  const [currentId, setCurrentId] = useState(null);

  // ========================================
  // MOBILE / TABLET MODAL
  // ========================================

  const [showSalesModal, setShowSalesModal] = useState(false);

  const [showReport, setShowReport] = useState(false);

  // ========================================
  // FORM
  // ========================================

  const emptyForm = {
    sales_date: getTodayDate(),
    gross_sales: "0.00",
    cash_sales: "0.00",
    gcash_sales: "0.00",
    other_sales: "0.00",
    cups: "0",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  // ========================================
  // CALENDAR BUTTON TITLES
  // ========================================

  useEffect(() => {
    const prevYear = document.querySelector(
      ".react-calendar__navigation__prev2-button",
    );

    const prevMonth = document.querySelector(
      ".react-calendar__navigation__prev-button",
    );

    const nextMonth = document.querySelector(
      ".react-calendar__navigation__next-button",
    );

    const nextYear = document.querySelector(
      ".react-calendar__navigation__next2-button",
    );

    if (prevYear) {
      prevYear.title = "Previous Year";
    }

    if (prevMonth) {
      prevMonth.title = "Previous Month";
    }

    if (nextMonth) {
      nextMonth.title = "Next Month";
    }

    if (nextYear) {
      nextYear.title = "Next Year";
    }
  }, []);

  // ========================================
  // LOAD SALES WHEN BUSINESS / MONTH CHANGES
  // ========================================

  useEffect(() => {
    loadSales(business, activeStartDate);
  }, [business, activeStartDate]);

  // ========================================
  // LOAD SALES
  // ========================================

  const loadSales = async (business, activeStartDate) => {
    setLoading(true);

    try {
      const formattedDate = formatApiDate(activeStartDate);

      console.log("Loading sales:", {
        business,
        activeStartDate,
        formattedDate,
      });

      const res = await api.get(`/sales/${business}/${formattedDate}`);

      console.log("SALES RESPONSE:", res.data);

      setSales(res.data.sales || []);

      setSalesAnalytics(
        res.data.analytics?.[0] || {
          gross_sales: "0.00",
          cash_sales: "0.00",
          gcash_sales: "0.00",
          other_sales: "0.00",
          cups: "0",
          average_day: "0.00",
          highest_sales: "0.00",
          lowest_sales: "0.00",
        },
      );
    } catch (err) {
      console.error("LOAD SALES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      const updatedForm = {
        ...prevForm,
        [name]: value,
      };

      // Automatically calculate Gross Sales
      if (
        name === "cash_sales" ||
        name === "gcash_sales" ||
        name === "other_sales"
      ) {
        const cash = parseFloat(updatedForm.cash_sales) || 0;

        const gcash = parseFloat(updatedForm.gcash_sales) || 0;

        const other = parseFloat(updatedForm.other_sales) || 0;

        updatedForm.gross_sales = (cash + gcash + other).toFixed(2);
      }

      return updatedForm;
    });
  };

  // ========================================
  // CALENDAR DATE CHANGE
  // ========================================

  const handleCalendarChange = (date) => {
    setSelectedDate(date);

    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    loadSaleByDate(date, formatted);
  };

  // ========================================
  // LOAD SALE BY DATE
  // ========================================

  const loadSaleByDate = async (date, formatted) => {
    const selectedDateString = getLocalDateString(date);

    const dateSaleIsFind = sales.some(
      (item) => getLocalDateString(item.sales_date) === selectedDateString,
    );

    if (dateSaleIsFind) {
      const data = sales.filter(
        (item) => getLocalDateString(item.sales_date) === selectedDateString,
      );

      setEditing(true);

      setCurrentId(data[0].daily_sales_id);

      setForm({
        ...data[0],
        sales_date: formatted,
      });
    } else {
      setForm({
        ...emptyForm,
        sales_date: formatted,
      });

      setEditing(false);

      setCurrentId(null);
    }

    // Open modal for tablet and mobile
    if (window.innerWidth < 1200) {
      setShowSalesModal(true);
    }
  };

  // ========================================
  // SAVE SALES
  // ========================================

  const saveSales = async () => {
    try {
      const newForm = {
        ...form,
        business_id: business,
      };

      if (editing) {
        const res = await api.put(`/sales/${currentId}`, newForm);

        alert(res.data.message);
      } else {
        const res = await api.post("/sales", newForm);

        alert(res.data.message);
      }

      setForm(emptyForm);

      setEditing(false);

      setCurrentId(null);

      // Close mobile/tablet modal
      setShowSalesModal(false);

      loadSales(business, activeStartDate);
    } catch (err) {
      console.error("SAVE SALES ERROR:", err);

      alert("Failed to save sales.");
    }
  };

  // ========================================
  // DELETE SALES
  // ========================================

  const deleteSales = async () => {
    if (!window.confirm("Delete this sales record?")) {
      return;
    }

    try {
      const res = await api.delete(`/sales/${currentId}`);

      alert(res.data.message);

      setForm(emptyForm);

      setEditing(false);

      setCurrentId(null);

      setShowSalesModal(false);

      loadSales(business, activeStartDate);
    } catch (err) {
      console.log(err);

      alert("Failed to delete sales.");
    }
  };

  // ========================================
  // CLOSE MODAL
  // ========================================

  const closeSalesModal = () => {
    setShowSalesModal(false);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="position-relative">
      {/* ====================================
          LOADING OVERLAY
      ===================================== */}

      {loading && (
        <div className="sales-loading-overlay">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <div className="mt-2 fw-semibold">Loading sales...</div>
        </div>
      )}

      <div className="sale-main-content">
        {/* ====================================
            MONTHLY SUMMARY
        ===================================== */}

        <div className="row g-3 mb-3">
          {/* GROSS */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Gross Sales</div>

                <h6 className="mb-0 mt-1">
                  ₱{formatCurrency(salesAnalytics.gross_sales)}
                </h6>
              </div>
            </div>
          </div>

          {/* AVERAGE DAY */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Average / Day</div>

                <h6 className="mb-0 mt-1">
                  ₱{formatCurrency(salesAnalytics.average_day)}
                </h6>
              </div>
            </div>
          </div>

          {/* AVERAGE CUPS */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">Average / Cups</div>

                <h6 className="mb-0 mt-1">
                  ₱{formatCurrency(salesAnalytics.average_cups_day)}
                </h6>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid sales-page">
          <div className="mb-2  d-flex gap-2">
            <button
              className={`btn  btn-secondary btn-sm`}
              onClick={() => setShowReport(true)}
              style={{ fontSize: "12px" }}
            >
              Generate Report
            </button>
            <button
              className={`btn btn-sm ${editing ? "btn-warning" : "btn-success"}`}
              onClick={() => setShowSalesModal(true)}
              style={{ fontSize: "12px" }}
            >
              {editing ? "Edit Sales" : "Add Sales"}
            </button>
          </div>

          {/* ==================================
              CALENDAR
          ================================== */}

          <div className="container-fluid p-0">
            <div className="calendar-wrapper">
              <Calendar
                value={selectedDate}
                onChange={handleCalendarChange}
                tileContent={({ date, view }) => {
                  if (view !== "month") {
                    return null;
                  }

                  const calendarDate = getDateOnly(date);

                  const sale = sales.find(
                    (item) => getDateOnly(item.sales_date) === calendarDate,
                  );

                  if (!sale) {
                    return null;
                  }

                  return (
                    <>
                      {sale.notes !== "" && <div className="notes-sign"></div>}

                      <div className="calendar-tile-content">
                        <p>₱{formatCurrency(sale.gross_sales)}</p>

                        <p>☕︎ {sale.cups}</p>
                      </div>
                    </>
                  );
                }}
                onActiveStartDateChange={({ activeStartDate }) => {
                  setActiveStartDate(activeStartDate);
                }}
                showFixedNumberOfWeeks
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================
            TABLET / MOBILE MODAL
        ===================================== */}
      {showSalesModal && (
        <div
          className="sales-modal-backdrop stock-modal-main"
          onClick={closeSalesModal}
        >
          <div className="sales-modal" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}

            <div className="sales-modal-header  ">
              <h5 className="mb-0 fw-bold">
                {editing ? "Edit Sales" : "Add Sales"}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={closeSalesModal}
              ></button>
            </div>

            {/* MODAL BODY */}

            <div className="sales-modal-body py-2">
              <SalesForm
                form={form}
                editing={editing}
                handleChange={handleChange}
                saveSales={saveSales}
                deleteSales={deleteSales}
                formatDisplayDate={formatDisplayDate}
              />
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <SalesReportModal
          businessId={business}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

// ========================================
// SALES FORM COMPONENT
// ========================================

function SalesForm({
  form,
  editing,
  handleChange,
  saveSales,
  deleteSales,
  formatDisplayDate,
}) {
  return (
    <div className=" shadow-sm sales-form-card">
      {/* HEADER */}

      {/* BODY */}

      {/* ==================================
            DATE
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold">Selected Date</label>

        <input
          className="form-control stock-modal-field"
          value={formatDisplayDate(form.sales_date)}
          readOnly
        />
      </div>

      {/* ==================================
            CASH
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold">Cash Sales</label>

        <input
          type="number"
          className="form-control stock-modal-field"
          name="cash_sales"
          value={form.cash_sales}
          onChange={handleChange}
          step="0.01"
        />
      </div>

      {/* ==================================
            GCASH
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold">GCash Sales</label>

        <input
          type="number"
          className="form-control stock-modal-field"
          name="gcash_sales"
          value={form.gcash_sales}
          onChange={handleChange}
          step="0.01"
        />
      </div>

      {/* ==================================
            MAYA / OTHERS
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold">Maya / Others</label>

        <input
          type="number"
          className="form-control stock-modal-field"
          name="other_sales"
          value={form.other_sales}
          onChange={handleChange}
          step="0.01"
        />
      </div>

      {/* ==================================
            GROSS SALES
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold">Gross Sales</label>

        <input
          type="number"
          className="form-control stock-modal-field"
          name="gross_sales"
          value={form.gross_sales}
          onChange={handleChange}
          step="0.01"
        />
      </div>

      {/* ==================================
            CUPS
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold stock-modal-field">Cups</label>

        <input
          type="number"
          className="form-control"
          name="cups"
          value={form.cups}
          onChange={handleChange}
        />
      </div>

      {/* ==================================
            NOTES
        ================================== */}

      <div className="mb-1">
        <label className="form-label fw-bold stock-modal-field">Notes</label>

        <textarea
          className="form-control"
          rows="2"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      {/* ==================================
            BUTTONS
        ================================== */}

      <div className="d-flex gap-2">
        <button
          className={`btn ${
            editing ? "btn-warning btn-sm" : "btn-success btn-sm"
          } flex-grow-1`}
          onClick={saveSales}
        >
          {editing ? "Update" : "Save Sales"}
        </button>

        {editing && (
          <button className="btn btn-danger" onClick={deleteSales}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ========================================
// DATE DISPLAY
// ========================================

const formatDisplayDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");

  return `${month}/${day}/${year}`;
};

// ========================================
// CURRENCY
// ========================================

const formatCurrency = (val) => {
  const num = Number.parseFloat(val) || 0;

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default SalesTracking;
