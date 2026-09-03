import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useSearchParams } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import api from "../services/api";
function SalesTracking() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(false);

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

  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    sales_date: new Date().toISOString().split("T")[0],
    gross_sales: "0.00",
    cash_sales: "0.00",
    gcash_sales: "0.00",
    other_sales: "0.00",
    cups: "0",
    notes: "",
  });

  const emptyForm = {
    sales_date: new Date().toISOString().split("T")[0],
    gross_sales: "0.00",
    cash_sales: "0.00",
    gcash_sales: "0.00",
    other_sales: "0.00",
    cups: "0",
    notes: "",
  };

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

    if (prevYear) prevYear.title = "Previous Year";
    if (prevMonth) prevMonth.title = "Previous Month";
    if (nextMonth) nextMonth.title = "Next Month";
    if (nextYear) nextYear.title = "Next Year";
  }, []);

  useEffect(() => {
    loadSales(business, activeStartDate);
  }, [business, activeStartDate]);

  const loadSales = async (business, activeStartDate) => {
    setLoading(true);
    const res = await api.get(`/sales/${business}/${activeStartDate}`);

    console.log(res.data)
    setSales(res.data.sales);
    setSalesAnalytics(res.data.analytics[0]);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => {
      // 1. Kunin ang pinakabagong state at i-update ang binagong field
      const updatedForm = {
        ...prevForm,
        [name]: value,
      };

      // 2. I-compute ang bagong sum kung ang binagong field ay isa sa mga sales fields
      if (
        name === "cash_sales" ||
        name === "gcash_sales" ||
        name === "other_sales"
      ) {
        // Gumamit ng parseFloat para maging numero, gawing 0 kung walang laman (NaN)
        const cash = parseFloat(updatedForm.cash_sales) || 0;
        const gcash = parseFloat(updatedForm.gcash_sales) || 0;
        const other = parseFloat(updatedForm.other_sales) || 0;

        // I-format ang sum para laging may dalawang decimal places (.toFixed(2))
        updatedForm.gross_sales = (cash + gcash + other).toFixed(2);
      }

      return updatedForm;
    });
  };

  const handleCalendarChange = (date) => {

    setSelectedDate(date);
    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    // later
    loadSaleByDate(date, formatted);
  };

  const loadSaleByDate = async (date, formatted) => {
    const dateSaleIsFind = sales.some(
      (item) =>
        new Date(item.sales_date).getTime() === new Date(date).getTime(),
    );

    if (dateSaleIsFind) {
      const data = sales.filter(
        (item) =>
          new Date(item.sales_date).getTime() === new Date(date).getTime(),
      );
      setEditing(true);
      setCurrentId(data[0].daily_sales_id);
      setForm({ ...data[0], sales_date: formatted });
    } else {
      setForm({
        ...emptyForm,
        sales_date: formatted,
      });

      setEditing(false);
      setCurrentId(null);
    }
  };

  const saveSales = async () => {
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

    loadSales(business, activeStartDate);
  };

  const deleteSales = async () => {
    if (!window.confirm("Delete this sales record?")) return;

    try {
      const res = await api.delete(`/sales/${currentId}`);
      alert(res.data.message);

      setForm(emptyForm);
      setEditing(false);
      setCurrentId(null);

      loadSales(business, activeStartDate);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid">
      {/* <h3 className="mb-4">Sales Tracking</h3> */}

      <div className="row">
        {/* Calendar */}

        <div className="col-lg-6 mb-4 flex-fill">
          <div className="card-body d-flex justify-content-center align-items-center">
            <Calendar
              value={selectedDate}
              onChange={handleCalendarChange}
              tileContent={({ date, view }) => {
                const dateSaleIsFind = sales.some(
                  (item) =>
                    new Date(item.sales_date).getTime() ===
                    new Date(date).getTime(),
                );


                if (view === "month" && dateSaleIsFind) {
                  const data = sales.filter(
                    (item) =>
                      new Date(item.sales_date).getTime() ===
                      new Date(date).getTime(),
                  );
                  const saleObj = data[0];
                  return (
                    <>
                      {saleObj.notes !== "" && (
                        <div className="notes-sign"></div>
                      )}
                      <div className="calendar-tile-content">
                        <p>₱{formatCurrency(saleObj.gross_sales)}</p>
                        <p>☕︎ {saleObj.cups}</p>
                      </div>
                    </>
                  );
                }

                return null;
              }}
              onActiveStartDateChange={({ activeStartDate }) => {
                console.log(activeStartDate)
                setActiveStartDate(activeStartDate);
              }}
              showFixedNumberOfWeeks
            />
          </div>
        </div>

        {/* Today Sales */}

        <div className="col-lg-6 mb-2 " style={{ width: "250px" }}>
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">Today Sales</div>

            <div className="card-body">
              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Selected Date
                </label>

                <input
                  className="form-control"
                  value={formatDisplayDate(form.sales_date)}
                  readOnly
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Cash Sales
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="cash_sales"
                  value={form.cash_sales}
                  onChange={handleChange}
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  GCash Sales
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="gcash_sales"
                  value={form.gcash_sales}
                  onChange={handleChange}
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Maya / Others
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="other_sales"
                  value={form.other_sales}
                  onChange={handleChange}
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Gross Sales
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="gross_sales"
                  value={form.gross_sales}
                  onChange={handleChange}
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-1">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Cups
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="cups"
                  value={form.cups}
                  onChange={handleChange}
                  style={{
                    height: "23px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div className="mb-3">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Notes
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex flex-row justify-content-between">
                <button
                  className={`btn ${editing ? "btn-warning" : "btn-success"}`}
                  onClick={saveSales}
                >
                  {editing ? "Update" : "Save Sales"}
                </button>
                {editing && (
                  <button className="btn btn-danger ms-2" onClick={deleteSales}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          Total Sales This Month
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Gross Sales</h6>
                <h4>₱{formatCurrency(salesAnalytics.gross_sales)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Cash Sales</h6>
                <h4>₱{formatCurrency(salesAnalytics.cash_sales)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>GCash Sales</h6>
                <h4>₱{formatCurrency(salesAnalytics.gcash_sales)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Other Payment Sales</h6>
                <h4>₱{formatCurrency(salesAnalytics.other_sales)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Cups</h6>
                <h4>{salesAnalytics.cups}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Average / Day</h6>
                <h4>₱{formatCurrency(salesAnalytics.average_day)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Average / Cups</h6>
                <h4>{formatCurrency(salesAnalytics.average_cups_day)}</h4>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="border rounded p-3 text-center">
                <h6>Lowest Sales</h6>
                <h4>₱{formatCurrency(salesAnalytics.lowest_sales)}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${month}/${day}/${year}`;
};

const formatCurrency = (val) => {
  const num = Number.parseFloat(val) || 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default SalesTracking;
