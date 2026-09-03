import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Formulas from "./pages/Formulas";
import Items from "./pages/Items";
import Categories from "./pages/Categories";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Stocks from "./pages/Stocks";
import CurrentStocks from "./pages/Stocks/CurrentStocks";
// import Bussiness from "./pages/Bussiness";
// import POS from "./pages/Pos";

function App() {
  return (
    <BrowserRouter>
      <div className="main">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Sales />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/current" element={<CurrentStocks />} />
            <Route path="/costing/formulas" element={<Formulas />} />
            <Route path="/costing/items" element={<Items />} />
            <Route path="/costing/categories" element={<Categories />} />
            <Route path="/expenses" element={<Expenses />} />
            {/* <Route path="/pos" element={<POS />} /> */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
