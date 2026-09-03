import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Formulas from "./pages/Formulas";
import Items from "./pages/Items";
import Categories from "./pages/Categories";
import Bussiness from "./pages/Bussiness";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Stocks from "./pages/Stocks";
import CurrentStocks from "./pages/Stocks/CurrentStocks";
import POS from "./pages/Pos";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex">
        <Sidebar />

        <div className="content">
          <Navbar />

          <div className="p-4">
            <Routes>
              <Route path="/" element={<Bussiness />} />
              <Route path="/formulas" element={<Formulas />} />
              <Route path="/items" element={<Items />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/stocks/current" element={<CurrentStocks />} />
              <Route path="/pos" element={<POS />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
