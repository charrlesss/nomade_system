import CustomSelection from "./CustomSelection";
function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4 ">
      <div className="container-fluid">
        <h4 className="m-0 fw-bold text-primary">Costing Management</h4>
        <CustomSelection label={"Active Business"} url={"/business"} />
      </div>
    </nav>
  );
}

export default Navbar;
