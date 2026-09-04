import { useEffect, useState } from "react";
import api from "../services/api";
import ExpensesModal from "../components/ExpensesModal";
import { useSearchParams } from "react-router-dom";
import ExpenseReportModal from "../components/ExpenseReportModal";
import "../styles/expenses.css";
import "../styles/stock.css";

function Expenses() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  const [expenses, setExpenses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================
  // PAGINATION
  // =====================================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const ITEMS_PER_PAGE = 15;

  // =====================================
  // SUMMARY
  // =====================================

  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    if (!business) return;

    loadExpenses(business, currentPage);
  }, [business, currentPage]);

  // =====================================
  // LOAD EXPENSES
  // =====================================

  const loadExpenses = async (business, page = 1) => {
    setLoading(true);

    try {
      const res = await api.get(`/expenses/${business}`, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
        },
      });

      setExpenses(res.data.expenses || []);

      // =================================
      // PAGINATION RESPONSE
      // =================================

      if (res.data.pagination) {
        setCurrentPage(res.data.pagination.page || page);

        setTotalPages(res.data.pagination.totalPages || 1);

        setTotalExpenses(res.data.pagination.total || 0);
      }

      // =================================
      // SUMMARY
      // =================================

      if (res.data.summary) {
        setSummary({
          today: Number(res.data.summary.today || 0),
          week: Number(res.data.summary.week || 0),
          month: Number(res.data.summary.month || 0),
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // ADD
  // =====================================

  const addExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  // =====================================
  // EDIT
  // =====================================

  const editExpense = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  // =====================================
  // DELETE
  // =====================================

  const deleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/expenses/${id}`);

      loadExpenses(business, currentPage);
    } catch (err) {
      console.log(err);

      alert("Unable to delete expense.");
    }
  };

  // =====================================
  // PAGE CHANGE
  // =====================================

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  // =====================================
  // PAGINATION BUTTONS
  // =====================================

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
        <small className="text-muted">
          Showing{" "}
          {expenses.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalExpenses)} of{" "}
          {totalExpenses}
        </small>

        <nav>
          <ul className="pagination pagination-sm mb-0">
            {/* PREVIOUS */}

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {/* PAGES */}

            {pages.map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => changePage(page)}>
                  {page}
                </button>
              </li>
            ))}

            {/* NEXT */}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="position-relative" style={{ position: "relative" }}>
      {/* ===================================== */}
      {/* LOADING */}
      {/* ===================================== */}

      {loading && (
        <div className="sales-loading-overlay">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <div className="mt-2 fw-semibold">Loading expenses...</div>
        </div>
      )}

      <div className="container-fluid p-0 expenses-main-content ">
        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        {/* ===================================== */}
        {/* EXPENSE SUMMARY */}
        {/* ===================================== */}

        <div className="row g-3 mb-3">
          {/* TODAY */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">TODAY'S EXPENSES</div>

                <h6 className="mb-0 mt-1">
                  ₱
                  {summary.today.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h6>
              </div>
            </div>
          </div>

          {/* WEEK */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small fw-bold">
                  THIS WEEK'S EXPENSES
                </div>

                <h6 className="mb-0 mt-1">
                  ₱
                  {summary.week.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h6>
              </div>
            </div>
          </div>

          {/* MONTH */}

          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted xs fw-bold">
                  THIS MONTH'S EXPENSES
                </div>

                <h6 className="mb-0 mt-1">
                  ₱
                  {summary.month.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h6>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid p-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "12px" }}
                onClick={() => setShowReportModal(true)}
              >
                Create Report
              </button>

              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: "12px" }}
                onClick={addExpense}
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* ===================================== */}
          {/* TABLE */}
          {/* ===================================== */}

          <div className="expenses-table-wrapper">
            {!loading && (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover expenses-table mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Expense</th>
                        <th className="text-end">Amount</th>
                        <th>Payment</th>
                        <th>Recurring</th>
                        <th style={{ width: "170px" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-3">
                            No Expenses Found
                          </td>
                        </tr>
                      ) : (
                        expenses.map((expense) => (
                          <tr key={expense.expenses_id}>
                            <td>
                              {new Date(
                                expense.expense_date,
                              ).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>

                            <td>{expense.category}</td>

                            <td>{expense.expense_name}</td>

                            <td className="text-end fw-semibold">
                              ₱{Number(expense.amount).toFixed(2)}
                            </td>

                            <td>{expense.payment_method}</td>

                            <td>
                              {expense.is_recurring
                                ? expense.recurring_type
                                : "-"}
                            </td>

                            <td>
                              <button
                                className="btn btn-warning btn-sm me-1"
                                onClick={() => editExpense(expense)}
                                style={{ fontSize: "10px" }}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  deleteExpense(expense.expenses_id)
                                }
                                style={{ fontSize: "10px" }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ================================= */}
                {/* PAGINATION */}
                {/* ================================= */}

                {renderPagination()}
              </>
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* MODALS */}
        {/* ===================================== */}

        <ExpensesModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSaved={() => loadExpenses(business, currentPage)}
          editingExpense={editingExpense}
          business={business}
        />

        <ExpenseReportModal
          show={showReportModal}
          onClose={() => setShowReportModal(false)}
          businessId={business}
        />
      </div>
    </div>
  );
}

export default Expenses;
