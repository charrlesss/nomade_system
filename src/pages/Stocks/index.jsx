import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import StocksModal from "../../components/StocksModal";
import StockMovementModal from "../../components/StockMovementModal";
import StockAlertModal from "../../components/StockAlertModal";
import { formatMoney } from "../../lib/formatMoney";

function Stocks() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  const [stocks, setStocks] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editingStock, setEditingStock] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showMovementModal, setShowMovementModal] = useState(false);

  const [selectedStock, setSelectedStock] = useState(null);

  const [movementType, setMovementType] = useState("IN");

  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  const [showStockDetails, setShowStockDetails] = useState(false);
  const [stockDetailsType, setStockDetailsType] = useState("");

  useEffect(() => {
    loadStocks(business);
    loadStockAlerts(business);
  }, [business]);

  // =====================================
  // LOAD STOCKS
  // =====================================

  const loadStocks = async (business) => {
    try {
      setLoading(true);

      const res = await api.get(`/stocks/${business}`, {
        params: {
          search: "",
        },
      });

      console.log(res)

      setStocks(res.data.stocks || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD LOW STOCK / OUT OF STOCK
  // =====================================

  const loadStockAlerts = async (business) => {
    try {
      const res = await api.get(
        `/stocks/stocks/low-stock-out-of-stock/${business}`,
      );

      console.log(res.data);
      setLowStock(res.data.lowStock || []);

      setLowStockCount(res.data.lowStockCount || 0);
      setOutOfStockCount(res.data.outOfStockCount || 0);

      setOutOfStock(res.data.outOfStock || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================
  // STOCK IN
  // =====================================

  const stockIn = (stock) => {
    setSelectedStock(stock);
    setMovementType("IN");
    setShowMovementModal(true);
  };

  // =====================================
  // STOCK OUT
  // =====================================

  const stockOut = (stock) => {
    setSelectedStock(stock);
    setMovementType("OUT");
    setShowMovementModal(true);
  };

  // =====================================
  // ADD
  // =====================================

  const addStock = () => {
    setEditingStock(null);

    setShowModal(true);
  };

  // =====================================
  // EDIT
  // =====================================

  const editStock = (stock) => {
    setEditingStock(stock);

    setShowModal(true);
  };

  // =====================================
  // DELETE
  // =====================================

  const deleteStock = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stock?",
    );

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/stocks/${id}`);
      alert(res.data.message);
      loadStocks(business);
    } catch (err) {
      console.log(err);

      alert("Unable to delete stock.");
    }
  };

  // =====================================
  // ANALYTICS
  // =====================================

  const totalItems = stocks.length;

  const stockValue = stocks.reduce((total, stock) => {
    return (
      total +
      Number(stock.current_stock || 0) * Number(stock.purchase_cost || 0)
    );
  }, 0);

  const openStockDetails = (type) => {
    setStockDetailsType(type);
    setShowStockDetails(true);
  };

  const closeStockDetails = () => {
    setShowStockDetails(false);
    setStockDetailsType("");
  };

  // =====================================
  // CURRENCY
  // =====================================

  return (
    <div className="container-fluid">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Stocks</h3>

        <button className="btn btn-primary" onClick={addStock}>
          + Add Stock
        </button>
      </div>

      {/* ================================= */}
      {/* SUMMARY */}
      {/* ================================= */}

      <div className="row g-3 mb-4">
        {/* TOTAL ITEMS */}

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small fw-bold">CURRENT INVENTORY</div>
              <div className="d-flex gap-2 align-items-center">
                <h3 className="mb-0">{totalItems}</h3>
                <button
                  className="btn btn-sm btn-outline-primary border-0 p-0 "
                  onClick={() => window.open("/stocks/current", "_blank")}
                  style={{
                    height: "20px",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STOCK VALUE */}

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">STOCK VALUE</div>

              <h3 className="mb-0">₱{formatMoney(stockValue)}</h3>
            </div>
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">LOW STOCK</div>
              <div className="d-flex gap-2 align-items-center">
                <h3 className="mb-2 text-warning">{lowStockCount}</h3>
                <button
                  className="btn btn-sm btn-outline-warning border-0 p-0 "
                  onClick={() => openStockDetails("LOW")}
                  style={{
                    height: "20px",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* OUT OF STOCK */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">OUT OF STOCK</div>
              <div className="d-flex gap-2 align-items-center">
                <h3 className="mb-2 text-danger">{outOfStockCount}</h3>
                <button
                  className="btn btn-sm btn-outline-danger border-0 p-0"
                  onClick={() => openStockDetails("OUT")}
                  style={{
                    height: "20px",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* INVENTORY + FAST MOVING */}
      {/* ================================= */}

      <div className="row g-3 mb-4">
        {/* FAST MOVING */}

        <div className="col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-header fw-bold">FAST MOVING STOCKS</div>

            <div className="card-body">
              <div className="text-muted text-center py-4">
                No stock movement data yet.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* INVENTORY TABLE */}
      {/* ================================= */}

      <div className="card shadow-sm">
        <div className="card-header fw-bold">INVENTORY</div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>STOCK NAME</th>

                  <th>UNIT</th>

                  <th>CURRENT STOCK</th>

                  <th>REORDER LEVEL</th>

                  <th>COST / UNIT</th>

                  <th>STOCK VALUE</th>

                  <th width="180">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No Stock Found
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock) => {
                    const current = Number(stock.current_stock || 0);

                    const reorder = Number(stock.reorder_level || 0);

                    const value = current * Number(stock.purchase_cost || 0);

                    return (
                      <tr key={stock.stock_id}>
                        <td>{stock.stock_name}</td>

                        <td>{stock.unit}</td>

                        <td>
                          <span
                            className={
                              current <= 0
                                ? "text-danger fw-bold"
                                : current <= reorder
                                  ? "text-warning fw-bold"
                                  : ""
                            }
                          >
                            {current.toLocaleString()}
                          </span>
                        </td>

                        <td>{reorder.toLocaleString()}</td>

                        <td>₱{formatMoney(stock.purchase_cost)}</td>

                        <td>₱{formatMoney(value)}</td>

                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => stockIn(stock)}
                          >
                            Stock In
                          </button>

                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => stockOut(stock)}
                          >
                            Stock Out
                          </button>

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => editStock(stock)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteStock(stock.stock_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* MODAL */}
      {/* ================================= */}

      <StocksModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadStocks}
        editingStock={editingStock}
        business={business}
      />

      <StockMovementModal
        show={showMovementModal}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedStock(null);
        }}
        onSaved={loadStocks}
        stock={selectedStock}
        type={movementType}
        business={business}
      />

      <StockAlertModal
        show={showStockDetails}
        onClose={closeStockDetails}
        type={stockDetailsType}
        stocks={stockDetailsType === "LOW" ? lowStock : outOfStock}
      />
    </div>
  );
}

export default Stocks;
