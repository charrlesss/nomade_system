import { useEffect, useState } from "react";
import api from "../services/api";

function ExpensesModal({ show, onClose, onSaved, editingExpense, business }) {
  const emptyForm = {
    business_id: business,
    expense_date: new Date().toISOString().split("T")[0],
    category: "Electricity",
    expense_name: "",
    amount: "",
    payment_method: "Cash",
    is_recurring: false,
    recurring_type: "None",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        ...editingExpense,
        expense_date: formatDateInput(editingExpense.expense_date),
      });
    } else {
      setForm({
        ...emptyForm,
        business_id: business,
      });
    }
  }, [editingExpense, business]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const save = async () => {
    if (form.expense_name.trim() === "") {
      return alert("Expense name is required.");
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return alert("Please enter a valid amount.");
    }

    try {
      if (editingExpense) {
        const res = await api.put(
          `/expenses/${editingExpense.expenses_id}`,
          form,
        );
        alert(res.data.message);
      } else {
        const res = await api.post("/expenses", form);
        alert(res.data.message);
      }

      onSaved(business);
      onClose();
      setForm(emptyForm);
    } catch (err) {
      console.log(err);
      alert("Unable to save expense.");
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
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h5>

            <button className="btn-close " onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col-md-6 mb-1">
                <label className="form-label">Expense Date</label>
                <input
                  type="date"
                  className="form-control stock-modal-field"
                  name="expense_date"
                  value={form.expense_date}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-1">
                <label className="form-label">Category</label>
                <select
                  className="form-select stock-modal-field"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Business Improvement</option>
                  <option>Internet</option>
                  <option>Food</option>
                  <option>Transportation</option>
                  <option>Motorcycle Maintenance</option>
                  <option>Fuel</option>
                  <option>Rent</option>
                  <option>Salary</option>
                  <option>Supplies</option>
                  <option>Ingredients</option>
                  <option>Equipment</option>
                  <option>Marketing</option>
                  <option>Bank Loan</option>
                  <option>Shopee Loan</option>
                  <option>Taxes</option>
                  <option>Miscellaneous</option>
                  <option>Ice Supply</option>
                  <option>Stocks</option>
                  <option>Shipping</option>
                  <option>Another Business</option>
                </select>
              </div>
            </div>

            <div className="mb-1">
              <label className="form-label">Expense Name</label>

              <input
                type="text"
                className="form-control stock-modal-field"
                name="expense_name"
                value={form.expense_name}
                onChange={handleChange}
                placeholder="Example: Meralco Bill"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-1">
                <label className="form-label">Amount</label>

                <input
                  type="number"
                  className="form-control stock-modal-field"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <div className="col-md-6 mb-1">
                <label className="form-label">Payment Method</label>

                <select
                  className="form-select stock-modal-field"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>GCash</option>
                  <option>Maya</option>
                  <option>Bank Transfer</option>
                  <option>UnionBank</option>
                  <option>Credit Card</option>
                  <option>Others</option>
                </select>
              </div>
            </div>

            <div className="form-check mb-1">
              <input
                className="form-check-input "
                type="checkbox"
                name="is_recurring"
                checked={form.is_recurring}
                onChange={handleChange}
              />

              <label className="form-check-label">Recurring Expense</label>
            </div>

            {form.is_recurring && (
              <div className="mb-1">
                <label className="form-label">Recurring Type</label>

                <select
                  className="form-select stock-modal-field"
                  name="recurring_type"
                  value={form.recurring_type}
                  onChange={handleChange}
                >
                  <option>None</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
            )}

            <div className="mb-1">
              <label className="form-label">Notes</label>

              <textarea
                className="form-control stock-modal-field"
                rows="2"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional..."
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary btn-sm" onClick={save}>
              {editingExpense ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatDateInput = (date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default ExpensesModal;
