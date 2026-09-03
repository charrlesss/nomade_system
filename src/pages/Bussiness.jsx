import { useEffect, useState } from "react";
import api from "../services/api";
import BussinessModal from "../components/BussinessModal";

function Business() {
  const [business, setBusiness] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editingBusiness, setEditingBusiness] = useState(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  // ==========================
  // LOAD
  // ==========================

  const loadBusiness = async () => {
    try {
      const res = await api.get("/business");
      setBusiness(res.data.businesses);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // ADD
  // ==========================

  const addBusiness = () => {
    setEditingBusiness(null);

    setShowModal(true);
  };

  // ==========================
  // EDIT
  // ==========================

  const editBusiness = (business) => {
    setEditingBusiness(business);

    setShowModal(true);
  };

  // ==========================
  // DELETE
  // ==========================

  const deleteBusiness = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this business?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/business/${id}`);

      loadBusiness();
    } catch (err) {
      console.log(err);

      alert("Unable to delete business.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Bussiness</h3>

        <button className="btn btn-primary" onClick={addBusiness}>
          + Add Bussiness
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Bussiness Name</th>

            <th width="180">Action</th>
          </tr>
        </thead>

        <tbody>
          {business.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                No Bussiness Found
              </td>
            </tr>
          ) : (
            business.map((business) => (
              <tr key={business.business_id}>
                <td>{business.business_name}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editBusiness(business)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteBusiness(business.business_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <BussinessModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadBusiness}
        editingBussiness={editingBusiness}
      />
    </div>
  );
}

export default Business;
