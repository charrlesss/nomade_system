import { Link, useSearchParams } from "react-router-dom";

function Sidebar() {
  const [searchParams] = useSearchParams();

  const business = searchParams.get("business");

  const withBusiness = (path) => {
    if (!business) return path;

    return `${path}?business=${business}`;
  };

  return (
    <div
      className="bg-dark text-white p-3"
      style={{
        width: 220,
        minHeight: "100vh",
      }}
    >
      <h3>Costing App</h3>

      <hr />

      <Link className="btn btn-outline-light w-100 mb-2" to={withBusiness("/")}>
        Business
      </Link>

      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/formulas")}
      >
        Formulas
      </Link>

      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/items")}
      >
        Items
      </Link>

      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/categories")}
      >
        Categories
      </Link>
      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/expenses")}
      >
        Expenses
      </Link>
      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/sales")}
      >
        Sales
      </Link>
      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/stocks")}
      >
        Stocks
      </Link>
      <Link
        className="btn btn-outline-light w-100 mb-2"
        to={withBusiness("/pos")}
      >
        POS
      </Link>
    </div>
  );
}

export default Sidebar;
