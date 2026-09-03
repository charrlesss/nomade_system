import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { formatMoney } from "../../lib/formatMoney";
import ReusableTable from "../../components/ReusableTable";

const inventoryColumns = [
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
    minWidth: "200px",
    render: (row) => <strong>{row.stock_name}</strong>,
  },

  {
    key: "current_stock",
    label: "Current Stock",
    minWidth: "130px",
    align: "right",
    render: (row) => Number(row.current_stock || 0).toLocaleString(),
  },

  {
    key: "unit",
    label: "Unit",
    width: "80px",
    align: "center",
  },

  {
    key: "purchase_cost",
    label: "Cost / Unit",
    minWidth: "130px",
    align: "right",
    render: (row) =>
      `₱${Number(row.purchase_cost || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  },

  {
    key: "stock_value",
    label: "Stock Value",
    minWidth: "140px",
    align: "right",
    render: (row) => {
      const value =
        Number(row.current_stock || 0) * Number(row.purchase_cost || 0);

      return (
        <strong>
          ₱
          {value.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>
      );
    },
  },

  {
    key: "status",
    label: "Status",
    width: "140px",
    align: "center",
    render: (row) => {
      const current = Number(row.current_stock || 0);

      const reorder = Number(row.reorder_level || 0);

      if (current <= 0) {
        return <span className="badge bg-danger">OUT OF STOCK</span>;
      }

      if (current <= reorder) {
        return <span className="badge bg-warning text-dark">LOW STOCK</span>;
      }

      return <span className="badge bg-success">NORMAL</span>;
    },
  },
];

function CurrentStocks() {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStocks(business);
  }, [business]);

  const loadStocks = async (business) => {
    try {
      setLoading(true);

      const res = await api.get(`/stocks/${business}`, {
        params: {
          search: search.trim(),
        },
      });

      setStocks(res.data.stocks || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search product..."
          style={{
            height: "22px",
            width: "500px",
            fontSize: "13px",
          }}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key !== "Enter") return;

            try {
              const res = await api.get(`/stocks/${business}`, {
                params: {
                  search: search.trim(),
                },
              });

              setStocks(res.data.stocks || []);
            } catch (err) {
              console.log(err);
            }
          }}
        />
      </div>

      {/* Current Stocks Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <ReusableTable
            columns={inventoryColumns}
            data={stocks}
            rowKey="stock_id"
            height="500px"
            emptyMessage="No inventory found."
          />
        </div>
      </div>
    </div>
  );
}

export default CurrentStocks;
