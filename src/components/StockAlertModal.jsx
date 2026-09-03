import ReusableTable from "./ReusableTable";
function StockAlertModal({ show, onClose, type, stocks }) {
  if (!show) return null;

  const lowStockColumns = [
    {
      key: "number",
      label: "#",
      width: "60px",
      align: "center",
      render: (row, index) => index + 1,
    },

    {
      key: "stock_name",
      label: "Stock",
      minWidth: "180px",
      render: (row) => <strong>{row.stock_name}</strong>,
    },

    {
      key: "current_stock",
      label: "Current Stock",
      minWidth: "130px",
      render: (row) => (
        <span className="text-warning fw-bold">
          {Number(row.current_stock || 0).toLocaleString()}
        </span>
      ),
    },

    {
      key: "reorder_level",
      label: "Reorder Level",
      minWidth: "130px",
      render: (row) => Number(row.reorder_level || 0).toLocaleString(),
    },

    {
      key: "unit",
      label: "Unit",
      width: "80px",
    },

    {
      key: "supplier_name",
      label: "Supplier",
      minWidth: "180px",
    },
  ];

  const outOfStockColumns = [
    {
      key: "number",
      label: "#",
      width: "60px",
      align: "center",
      render: (row, index) => index + 1,
    },

    {
      key: "stock_name",
      label: "Stock",
      minWidth: "180px",
      render: (row) => <strong>{row.stock_name}</strong>,
    },

    {
      key: "current_stock",
      label: "Current Stock",
      minWidth: "130px",
      align: "center",
      render: () => <span className="text-danger fw-bold">OUT OF STOCK</span>,
    },

    {
      key: "unit",
      label: "Unit",
      width: "80px",
    },

    {
      key: "supplier_name",
      label: "Supplier",
      minWidth: "180px",
    },
  ];

  const isLowStock = type === "LOW";

  const title = isLowStock ? "Low Stock" : "Out of Stock";

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          {/* BODY */}
          <div className="modal-body">
            {stocks.length === 0 ? (
              <div className="text-center text-muted py-4">
                No {isLowStock ? "low stock" : "out of stock"} items.
              </div>
            ) : (
              <div className="table-responsive">
                {isLowStock ? (
                  <ReusableTable
                    columns={lowStockColumns}
                    data={stocks}
                    rowKey="stock_id"
                    height="400px"
                    emptyMessage="No low stock items found."
                  />
                ) : (
                  <ReusableTable
                    columns={outOfStockColumns}
                    data={stocks}
                    rowKey="stock_id"
                    height="400px"
                    emptyMessage="No out of stock items found."
                  />
                )}
              </div>
            )}
          </div>
          {/* FOOTER */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockAlertModal;
