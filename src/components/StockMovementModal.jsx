import { useEffect, useState } from "react";
import api from "../services/api";

function StockMovementModal({
  show,
  onClose,
  onSaved,
  stock,
  type = "IN",
  business,
}) {
  const emptyForm = {
    quantity: "",
    unit_cost: "",
    transaction_date: "",
    supplier_name: "",
    reference_type: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const isStockIn = type === "IN";

  // =====================================
  // LOAD FORM
  // =====================================

  useEffect(() => {
    if (!show) return;

    if (stock) {
      setForm({
        quantity: "",
        unit_cost: isStockIn ? stock.purchase_cost || "" : "",
        transaction_date: new Date().toISOString().split("T")[0],
        supplier_name: stock.supplier_name || "",
        reference_type: isStockIn ? "PURCHASE" : "USAGE",
        notes: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [show, stock, type]);

  // =====================================
  // CHANGE
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // SAVE
  // =====================================

  const save = async () => {
    if (!stock) {
      alert("Stock is required.");
      return;
    }

    if (form.quantity === "" || Number(form.quantity) <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    if (!form.transaction_date) {
      alert("Date is required.");
      return;
    }

    // ============================
    // STOCK IN VALIDATION
    // ============================

    if (isStockIn) {
      if (form.unit_cost === "" || Number(form.unit_cost) < 0) {
        alert("Purchase cost is required.");
        return;
      }

      if (!form.supplier_name.trim()) {
        alert("Supplier is required.");
        return;
      }
    }

    // ============================
    // STOCK OUT VALIDATION
    // ============================

    if (!isStockIn) {
      const currentStock = Number(stock.current_stock || 0);

      const quantity = Number(form.quantity);

      if (quantity > currentStock) {
        alert(
          `Insufficient stock.\n\nCurrent stock: ${currentStock} ${stock.unit}`,
        );

        return;
      }

      if (!form.reference_type) {
        alert("Please select a reason.");
        return;
      }
    }

    try {
      const endpoint = isStockIn
        ? "/stocks/transaction/in"
        : "/stocks/transaction/out";

      const payload = {
        stock_id: stock.stock_id,

        quantity: Number(form.quantity),

        transaction_date: form.transaction_date,

        reference_type: form.reference_type,

        notes: form.notes.trim() || null,
      };

      // ============================
      // STOCK IN DATA
      // ============================

      if (isStockIn) {
        payload.unit_cost = Number(form.unit_cost);

        payload.supplier_name = form.supplier_name.trim();
      }

      await api.post(endpoint, payload);

      onSaved(business);

      onClose();

      setForm(emptyForm);
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          `Unable to ${isStockIn ? "add stock" : "deduct stock"}.`,
      );
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
  // CALCULATIONS
  // =====================================

  const currentStock = Number(stock?.current_stock || 0);

  const quantity = Number(form.quantity || 0);

  const unitCost = Number(form.unit_cost || 0);

  const newStock = isStockIn
    ? currentStock + quantity
    : currentStock - quantity;

  const totalCost = quantity * unitCost;

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
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="modal-header">
            <h5 className="modal-title">
              {isStockIn ? "Stock In" : "Stock Out"}
            </h5>

            <button type="button" className="btn-close" onClick={closeModal} />
          </div>

          {/* ================================= */}
          {/* BODY */}
          {/* ================================= */}

          <div className="modal-body">
            {/* PRODUCT */}

            <div className="mb-3">
              <label className="form-label">Product</label>

              <input
                type="text"
                className="form-control"
                value={stock?.stock_name || ""}
                readOnly
              />
            </div>

            {/* CURRENT STOCK */}

            <div className="mb-3">
              <label className="form-label">Current Stock</label>

              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={currentStock}
                  readOnly
                />

                <span className="input-group-text">{stock?.unit}</span>
              </div>
            </div>

            {/* QUANTITY */}

            <div className="mb-3">
              <label className="form-label">
                {isStockIn ? "Quantity Purchased" : "Quantity Used"}
              </label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  placeholder="Enter quantity"
                  autoFocus
                />

                <span className="input-group-text">{stock?.unit}</span>
              </div>
            </div>

            {/* ================================= */}
            {/* STOCK IN ONLY */}
            {/* ================================= */}

            {isStockIn && (
              <>
                {/* UNIT COST */}

                <div className="mb-3">
                  <label className="form-label">Purchase Cost / Unit</label>

                  <div className="input-group">
                    <span className="input-group-text">₱</span>

                    <input
                      type="number"
                      className="form-control"
                      name="unit_cost"
                      value={form.unit_cost}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* TOTAL COST */}

                <div className="mb-3">
                  <label className="form-label">Total Purchase Cost</label>

                  <div className="form-control bg-light">
                    ₱
                    {totalCost.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
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
                    placeholder="Enter supplier"
                  />
                </div>
              </>
            )}

            {/* ================================= */}
            {/* STOCK OUT ONLY */}
            {/* ================================= */}

            {!isStockIn && (
              <div className="mb-3">
                <label className="form-label">Reason</label>

                <select
                  className="form-select"
                  name="reference_type"
                  value={form.reference_type}
                  onChange={handleChange}
                >
                  <option value="">Select Reason</option>

                  <option value="USAGE">Production / Usage</option>

                  <option value="WASTE">Waste</option>

                  <option value="DAMAGED">Damaged</option>

                  <option value="PERSONAL">Personal Use</option>

                  <option value="ADJUSTMENT">Inventory Adjustment</option>

                  <option value="OTHER">Other</option>
                </select>
              </div>
            )}

            {/* DATE */}

            <div className="mb-3">
              <label className="form-label">Date</label>

              <input
                type="date"
                className="form-control"
                name="transaction_date"
                value={form.transaction_date}
                onChange={handleChange}
              />
            </div>

            {/* NEW STOCK PREVIEW */}

            <div className="mb-3">
              <label className="form-label">New Stock</label>

              <div
                className={`form-control ${
                  newStock < 0 ? "text-danger" : "bg-light"
                }`}
              >
                {newStock.toLocaleString()} {stock?.unit}
              </div>
            </div>

            {/* NOTES */}

            <div className="mb-3">
              <label className="form-label">Notes</label>

              <textarea
                className="form-control"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Optional notes"
              />
            </div>
          </div>

          {/* ================================= */}
          {/* FOOTER */}
          {/* ================================= */}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className={isStockIn ? "btn btn-success" : "btn btn-danger"}
              onClick={save}
            >
              {isStockIn ? "Stock In" : "Stock Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockMovementModal;
