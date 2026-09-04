import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

import StocksModal from "../../components/StocksModal";
import StockMovementModal from "../../components/StockMovementModal";
import StockAlertModal from "../../components/StockAlertModal";

import { formatMoney } from "../../lib/formatMoney";

import "../../styles/stock.css";

function Stocks() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  // =====================================
  // STATES
  // =====================================

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

  // =====================================
  // SEARCH
  // =====================================

  const [search, setSearch] = useState("");

  // =====================================
  // PAGINATION
  // =====================================

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const LIMIT = 15;

  // =====================================
  // LOAD DATA
  // =====================================

  useEffect(() => {
    if (!business) return;

    loadStocks(business, page, search);
  }, [business, page]);

  // =====================================
  // LOAD STOCKS
  // =====================================

  const loadStocks = async (
    businessParam = business,
    pageParam = page,
    searchParam = search,
  ) => {
    if (!businessParam) return;

    try {
      setLoading(true);

      const res = await api.get(`/stocks/${businessParam}`, {
        params: {
          search: searchParam,
          page: pageParam,
          limit: LIMIT,
        },
      });

      console.log("Stocks:", res.data);

      setStocks(res.data.stocks || []);

      // =====================================
      // PAGINATION RESPONSE
      // =====================================

      if (res.data.pagination) {
        setPagination({
          total: res.data.pagination.total || 0,
          page: res.data.pagination.page || pageParam,
          limit: res.data.pagination.limit || LIMIT,
          totalPages: res.data.pagination.totalPages || 1,
        });
      } else {
        // fallback in case backend doesn't have
        // pagination yet
        setPagination({
          total: res.data.total || 0,
          page: pageParam,
          limit: LIMIT,
          totalPages: Math.ceil((res.data.total || 0) / LIMIT) || 1,
        });
      }
    } catch (err) {
      console.log("Load stocks error:", err);

      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD STOCK ALERTS
  // =====================================

  const loadStockAlerts = async (businessParam = business) => {
    if (!businessParam) return;

    try {
      const res = await api.get(
        `/stocks/stocks/low-stock-out-of-stock/${businessParam}`,
      );

      console.log("Stock alerts:", res.data);

      setLowStock(res.data.lowStock || []);
      setLowStockCount(res.data.lowStockCount || 0);

      setOutOfStock(res.data.outOfStock || []);
      setOutOfStockCount(res.data.outOfStockCount || 0);
    } catch (err) {
      console.log("Load stock alerts error:", err);
    }
  };

  // =====================================
  // INITIAL ALERT LOAD
  // =====================================

  useEffect(() => {
    if (!business) return;

    loadStockAlerts(business);
  }, [business]);

  // =====================================
  // RELOAD EVERYTHING
  // =====================================

  const reloadStocks = async () => {
    await Promise.all([
      loadStocks(business, page, search),
      loadStockAlerts(business),
    ]);
  };

  // =====================================
  // SEARCH
  // =====================================

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    // Go back to first page
    // when searching
    setPage(1);

    // Immediately request the API
    loadStocks(business, 1, value);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);

    loadStocks(business, 1, "");
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
  // ADD STOCK
  // =====================================

  const addStock = () => {
    setEditingStock(null);
    setShowModal(true);
  };

  // =====================================
  // EDIT STOCK
  // =====================================

  const editStock = (stock) => {
    setEditingStock(stock);
    setShowModal(true);
  };

  // =====================================
  // DELETE STOCK
  // =====================================

  const deleteStock = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stock?",
    );

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/stocks/${id}`);

      alert(res.data.message);

      await reloadStocks();
    } catch (err) {
      console.log("Delete stock error:", err);

      alert("Unable to delete stock.");
    }
  };

  // =====================================
  // ANALYTICS
  // =====================================

  const stockValue = stocks.reduce((total, stock) => {
    return (
      total +
      Number(stock.current_stock || 0) * Number(stock.purchase_cost || 0)
    );
  }, 0);

  // =====================================
  // STOCK DETAILS
  // =====================================

  const openStockDetails = (type) => {
    setStockDetailsType(type);
    setShowStockDetails(true);
  };

  const closeStockDetails = () => {
    setShowStockDetails(false);
    setStockDetailsType("");
  };

  // =====================================
  // PAGINATION FUNCTIONS
  // =====================================

  const goToPage = (newPage) => {
    if (newPage < 1) return;

    if (newPage > pagination.totalPages) return;

    setPage(newPage);
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  // =====================================
  // PAGINATION DISPLAY
  // =====================================

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  // =====================================
  // TABLE RANGE
  // =====================================

  const startItem = pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;

  const endItem = Math.min(page * LIMIT, pagination.total);

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="container-fluid p-0 stock-main-content">
      {/* ================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================= */}

      <div className="row g-3 mb-2">
        {/* STOCK VALUE */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small fw-bold">STOCK VALUE</div>

              <h3 className="mb-0">₱{formatMoney(stockValue)}</h3>
            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small fw-bold">LOW STOCK</div>

              <div className="d-flex gap-2 align-items-center">
                <h3 className="mb-0 text-warning">{lowStockCount}</h3>

                <button
                  className="btn btn-sm btn-outline-warning border-0 p-0"
                  onClick={() => openStockDetails("LOW")}
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
              <div className="text-muted small fw-bold">OUT OF STOCK</div>

              <div className="d-flex gap-2 align-items-center">
                <h3 className="mb-0 text-danger">{outOfStockCount}</h3>

                <button
                  className="btn btn-sm btn-outline-danger border-0 p-0"
                  onClick={() => openStockDetails("OUT")}
                >
                  See Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAST MOVING */}
        <div className="col-md-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small fw-bold">FAST MOVING STOCKS</div>

              <h3 className="mb-0">—</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* SEARCH + ADD */}
      {/* ================================= */}
      <div className="container-fluid p-0">
        <div className="d-flex gap-2 align-items-center mb-2">
          {/* SEARCH */}
          <div className="input-group ">
            <span
              className="input-group-text"
              style={{ height: "24px", fontSize: "13px" }}
            >
              🔍
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search stock..."
              style={{
                height: "24px",
                fontSize: "14px",
                textWrap: "nowrap",
              }}
              value={search}
              onChange={handleSearch}
            />

            {search && (
              <button
                className="btn btn-outline-secondary btn-sm"
                style={{
                  height: "24px",
                  padding: "0px 4px",
                  boxSizing: "border-box",
                }}
                type="button"
                onClick={clearSearch}
              >
                ×
              </button>
            )}
          </div>

          {/* ADD STOCK */}
          <button
            className="btn btn-primary btn-sm "
            onClick={addStock}
            style={{
              fontSize: "12px",
              flex: "0 0 85px",
            }}
          >
            + Add Stock
          </button>
        </div>

        {/* ================================= */}
        {/* INVENTORY */}
        {/* ================================= */}

        <div className="card shadow-sm">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center">
            <span>INVENTORY</span>

            <small className="text-muted fw-normal">
              {pagination.total > 0
                ? `Showing ${startItem}-${endItem} of ${pagination.total}`
                : "No stocks"}
            </small>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table
                className="table table-bordered table-hover mb-0"
                style={{
                  fontSize: "13px",
                }}
              >
                <thead className="table-dark">
                  <tr>
                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      STOCK NAME
                    </th>

                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      UNIT
                    </th>
                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      PACKAGE SIZE
                    </th>

                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      CURRENT STOCK
                    </th>

                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      REORDER LEVEL
                    </th>

                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      COST / UNIT
                    </th>

                    <th
                      style={{
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      STOCK VALUE
                    </th>

                    <th
                      style={{
                        minWidth: "350px",
                        padding: "7px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* LOADING */}
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center"
                        style={{
                          padding: "12px",
                        }}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : stocks.length === 0 ? (
                    /* EMPTY */
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-muted"
                        style={{
                          padding: "12px",
                        }}
                      >
                        {search
                          ? "No stock found matching your search."
                          : "No Stock Found"}
                      </td>
                    </tr>
                  ) : (
                    stocks.map((stock) => {
                      const current = Number(stock.current_stock || 0);

                      const reorder = Number(stock.reorder_level || 0);

                      const purchaseCost = Number(stock.purchase_cost || 0);

                      const value = current * purchaseCost;

                      return (
                        <tr key={stock.stock_id}>
                          {/* STOCK NAME */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            {stock.stock_name}
                          </td>

                          {/* UNIT */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            {stock.unit}
                          </td>

                          {/* PACKAGE SIZE */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            {stock.package_size}
                          </td>

                          {/* CURRENT STOCK */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
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

                          {/* REORDER */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            {reorder.toLocaleString()}
                          </td>

                          {/* COST */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            ₱{formatMoney(purchaseCost)}
                          </td>

                          {/* VALUE */}
                          <td
                            style={{
                              padding: "2px 10px",
                              verticalAlign: "middle",
                            }}
                          >
                            ₱{formatMoney(value)}
                          </td>

                          {/* ACTION */}
                          <td
                            style={{
                              padding: "2px 8px",
                              verticalAlign: "middle",
                            }}
                          >
                            <div className="d-flex flex-wrap gap-1">
                              <button
                                className="btn btn-success btn-sm"
                                style={{
                                  fontSize: "10px",
                                }}
                                onClick={() => stockIn(stock)}
                              >
                                Stock In
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                style={{
                                  fontSize: "10px",
                                }}
                                onClick={() => stockOut(stock)}
                              >
                                Stock Out
                              </button>

                              <button
                                className="btn btn-warning btn-sm"
                                style={{
                                  fontSize: "10px",
                                }}
                                onClick={() => editStock(stock)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                style={{
                                  fontSize: "10px",
                                }}
                                onClick={() => deleteStock(stock.stock_id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================= */}
          {/* PAGINATION */}
          {/* ================================= */}

          {pagination.totalPages > 1 && (
            <div className="card-footer">
              <div className="d-flex justify-content-between align-items-center">
                {/* RESULT COUNT */}
                <small className="text-muted">
                  Showing {startItem}-{endItem} of {pagination.total}
                </small>

                {/* PAGINATION */}
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    {/* PREVIOUS */}
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={previousPage}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {/* PAGE NUMBERS */}
                    {getPageNumbers().map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          page === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    {/* NEXT */}
                    <li
                      className={`page-item ${
                        page === pagination.totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={nextPage}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* STOCK MODAL */}
      {/* ================================= */}

      <StocksModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStock(null);
        }}
        onSaved={reloadStocks}
        editingStock={editingStock}
        business={business}
      />

      {/* ================================= */}
      {/* STOCK MOVEMENT MODAL */}
      {/* ================================= */}

      <StockMovementModal
        show={showMovementModal}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedStock(null);
        }}
        onSaved={reloadStocks}
        stock={selectedStock}
        type={movementType}
        business={business}
      />

      {/* ================================= */}
      {/* STOCK ALERT MODAL */}
      {/* ================================= */}

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
