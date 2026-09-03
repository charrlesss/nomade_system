import { useEffect, useState } from "react";
import api from "../services/api";
import ExpensesModal from "../components/ExpensesModal";
import { useSearchParams } from "react-router-dom";
import ExpenseReportModal from "../components/ExpenseReportModal";

function Expenses() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");
  const [expenses, setExpenses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    loadExpenses(business);
  }, [business]);

  // ==========================
  // LOAD
  // ==========================

  const loadExpenses = async (business) => {
    try {
      const res = await api.get(`/expenses/${business}`);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // ADD
  // ==========================

  const addExpense = () => {
    setEditingExpense(null);

    setShowModal(true);
  };

  // ==========================
  // EDIT
  // ==========================

  const editExpense = (expense) => {
    setEditingExpense(expense);

    setShowModal(true);
  };

  // ==========================
  // DELETE
  // ==========================

  const deleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/expenses/${id}`);

      loadExpenses(business);
    } catch (err) {
      console.log(err);

      alert("Unable to delete expense.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Expenses</h3>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowReportModal(true)}
          >
            Create Report
          </button>

          <button className="btn btn-primary" onClick={addExpense}>
            + Add Expense
          </button>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Date</th>

            <th>Category</th>

            <th>Expense</th>

            <th className="text-end">Amount</th>

            <th>Payment</th>

            <th>Recurring</th>

            <th width="170">Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No Expenses Found
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.expenses_id}>
                <td>
                  {new Date(expense.expense_date).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>

                <td>{expense.category}</td>

                <td>{expense.expense_name}</td>

                <td className="text-end">
                  ₱{Number(expense.amount).toFixed(2)}
                </td>

                <td>{expense.payment_method}</td>

                <td>{expense.is_recurring ? expense.recurring_type : "-"}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editExpense(expense)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteExpense(expense.expenses_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ExpensesModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadExpenses}
        editingExpense={editingExpense}
        business={business}
      />

      <ExpenseReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        businessId={business}
      />
    </div>
  );
}

export default Expenses;
