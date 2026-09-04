import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/sidebar.css";

function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const business = searchParams.get("business");

  const [costingOpen, setCostingOpen] = useState(true);

  const withBusiness = (path) => {
    if (!business) return path;

    return `${path}?business=${encodeURIComponent(business)}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("business", String(6));

    setSearchParams(params, {
      replace: true,
    });
  }, []);

  // =================================
  // CLOSE MOBILE SIDEBAR
  // =================================

  const closeMobileSidebar = () => {
    const sidebar = document.getElementById("toggle-sidebar");
    if (!sidebar) return;

    sidebar.click();
  };

  return (
    <>
      {/* =========================
          MOBILE NAVBAR
      ========================== */}

      <nav
        className="navbar navbar-dark bg-dark d-lg-none p-0 m-0"
        style={{ height: "50px" }}
      >
        <div className="container-fluid  ">
          <button
            id="toggle-sidebar"
            className="navbar-toggler btn-sm"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
            aria-controls="mobileSidebar"
            style={{
              fontSize: "12px",
            }}
          >
            <span className="navbar-toggler-icon "></span>
          </button>
        </div>
      </nav>

      {/* =========================
          MOBILE OFFCANVAS
      ========================== */}

      <div
        className="offcanvas offcanvas-start bg-dark text-white"
        tabIndex="-1"
        id="mobileSidebar"
        aria-labelledby="mobileSidebarLabel"
      >
        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close btn-close-white btn-sm"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <SidebarLinks
            withBusiness={withBusiness}
            costingOpen={costingOpen}
            setCostingOpen={setCostingOpen}
            closeMobileSidebar={closeMobileSidebar}
          />
        </div>
      </div>

      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}

      <aside className="sidebar-desktop bg-dark text-white">
        <div className="sidebar-content">
          <SidebarLinks
            withBusiness={withBusiness}
            costingOpen={costingOpen}
            setCostingOpen={setCostingOpen}
          />
        </div>
      </aside>
    </>
  );
}

/* =================================
   SIDEBAR LINKS
================================= */

function SidebarLinks({
  withBusiness,
  costingOpen,
  setCostingOpen,
  closeMobileSidebar,
}) {
  // =================================
  // HANDLE LINK CLICK
  // =================================

  const handleLinkClick = () => {
    if (closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  return (
    <div className="sidebar-links">
      {/* =========================
          SALES
      ========================== */}

      <Link
        className="sidebar-link"
        to={withBusiness("/")}
        onClick={handleLinkClick}
      >
        <span>📊</span>
        <span>Sales</span>
      </Link>

      {/* =========================
          STOCKS
      ========================== */}

      <Link
        className="sidebar-link"
        to={withBusiness("/stocks")}
        onClick={handleLinkClick}
      >
        <span>📦</span>
        <span>Stocks</span>
      </Link>

      {/* =========================
          EXPENSES
      ========================== */}

      <Link
        className="sidebar-link"
        to={withBusiness("/expenses")}
        onClick={handleLinkClick}
      >
        <span>💰</span>
        <span>Expenses</span>
      </Link>

      {/* =========================
          COSTING
      ========================== */}

      <button
        type="button"
        className="sidebar-link sidebar-button"
        onClick={() => setCostingOpen(!costingOpen)}
      >
        <span>🧮</span>

        <span className="flex-grow-1 text-start">Costing</span>

        <span>{costingOpen ? "▾" : "▸"}</span>
      </button>

      {/* =========================
          COSTING SUB MENU
      ========================== */}

      {costingOpen && (
        <div className="costing-submenu">
          {/* FORMULAS */}

          <Link
            className="sidebar-sublink"
            to={withBusiness("/costing/formulas")}
            onClick={handleLinkClick}
          >
            <span>•</span>
            <span>Formulas</span>
          </Link>

          {/* ITEMS */}

          <Link
            className="sidebar-sublink"
            to={withBusiness("/costing/items")}
            onClick={handleLinkClick}
          >
            <span>•</span>
            <span>Items</span>
          </Link>

          {/* CATEGORIES */}

          <Link
            className="sidebar-sublink"
            to={withBusiness("/costing/categories")}
            onClick={handleLinkClick}
          >
            <span>•</span>
            <span>Categories</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
