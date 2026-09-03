import { useEffect, useState } from "react";
import api from "../services/api";

function StocksModal({ show, onClose, onSaved, editingStock, business }) {
  const emptyForm = {
    business_id: business,
    stock_name: "",
    unit: "",
    current_stock: "0",
    reorder_level: "0",
    purchase_cost: "0",
    supplier_name: "",
  };

  const [form, setForm] = useState(emptyForm);

  // =====================================
  // LOAD FORM
  // =====================================

  useEffect(() => {
    if (editingStock) {
      console.log(editingStock);
      setForm({
        business_id: business || "",

        stock_name: editingStock.stock_name || "",

        unit: editingStock.unit || "",

        current_stock: editingStock.current_stock ?? "0",

        reorder_level: editingStock.reorder_level ?? "0",

        purchase_cost: editingStock.purchase_cost ?? "0",

        supplier_name: editingStock.supplier_name || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingStock]);

  // =====================================
  // CHANGE
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,

      [name]: value,
    });
  };

  // =====================================
  // SAVE
  // =====================================

  const save = async () => {
    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (form.stock_name.trim() === "") {
      alert("Stock Name is required.");

      return;
    }

    if (form.unit.trim() === "") {
      alert("Unit is required.");

      return;
    }

    if (form.purchase_cost === "" || Number(form.purchase_cost) < 0) {
      alert("Purchase Cost is required.");

      return;
    }

    if (form.reorder_level === "" || Number(form.reorder_level) < 0) {
      alert("Reorder Level is required.");

      return;
    }

    // -----------------------------
    // SAVE
    // -----------------------------

    try {
      if (editingStock) {
        const res = await api.put(`/stocks/${editingStock.stock_id}`, form);
        alert(res.data.message);
      } else {
        const res = await api.post("/stocks", form);
        alert(res.data.message);
      }

      // Reload table

      onSaved(business);

      // Close modal

      onClose();

      // Reset

      setForm(emptyForm);
    } catch (err) {
      console.log(err);

      alert("Unable to save stock.");
    }
  };

  // =====================================
  // CLOSE
  // =====================================

  const closeModal = () => {
    setForm(emptyForm);

    onClose();
  };

  // =====================================
  // HIDDEN
  // =====================================

  if (!show) return null;

  // =====================================
  // UI
  // =====================================

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          {/* ============================= */}
          {/* HEADER */}
          {/* ============================= */}

          <div className="modal-header">
            <h5 className="modal-title">
              {editingStock ? "Edit Stock" : "Add Stock"}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
            ></button>
          </div>

          {/* ============================= */}
          {/* BODY */}
          {/* ============================= */}

          <div className="modal-body">
            {/* STOCK NAME */}

            <div className="mb-3">
              <label className="form-label">Stock Name</label>

              <input
                type="text"
                className="form-control"
                name="stock_name"
                value={form.stock_name}
                onChange={handleChange}
                placeholder="Enter stock name"
                autoFocus
              />
            </div>

            {/* UNIT */}

            <div className="mb-3">
              <label className="form-label">Unit</label>

              <select
                className="form-select"
                name="unit"
                value={form.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>

                <option value="pcs">Pieces (pcs)</option>

                <option value="kg">Kilogram (kg)</option>

                <option value="g">Gram (g)</option>

                <option value="L">Liter (L)</option>

                <option value="ml">Milliliter (ml)</option>

                <option value="box">Box</option>

                <option value="pack">Pack</option>

                <option value="bottle">Bottle</option>

                <option value="sachet">Sachet</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* PURCHASE COST */}

            <div className="mb-3">
              <label className="form-label">Purchase Cost / Unit</label>

              <div className="input-group">
                <span className="input-group-text">₱</span>

                <input
                  type="number"
                  className="form-control"
                  name="purchase_cost"
                  value={form.purchase_cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <small className="text-muted">
                Your current supplier purchase cost.
              </small>
            </div>

            {/* REORDER LEVEL */}

            <div className="mb-3">
              <label className="form-label">Reorder Level</label>

              <input
                type="number"
                className="form-control"
                name="reorder_level"
                value={form.reorder_level}
                onChange={handleChange}
                min="0"
                step="0.001"
                placeholder="0"
              />

              <small className="text-muted">
                Alert when stock reaches this level.
              </small>
            </div>

            {/* SUPPLIER */}

            <div className="mb-3">
              <label className="form-label">Supplier</label>

              <input
                type="text"
                className="form-control"
                name="supplier_name"
                value={form.supplier_name}
                onChange={handleChange}
                placeholder="Enter supplier name"
              />
            </div>

            {/* CURRENT STOCK */}

            {!editingStock && (
              <div className="mb-3">
                <label className="form-label">Initial Stock</label>

                <input
                  type="number"
                  className="form-control"
                  name="current_stock"
                  value={form.current_stock}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  placeholder="0"
                />

                <small className="text-muted">
                  You can start with zero and use Stock In later.
                </small>
              </div>
            )}
          </div>

          {/* ============================= */}
          {/* FOOTER */}
          {/* ============================= */}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button type="button" className="btn btn-primary" onClick={save}>
              {editingStock ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StocksModal;
