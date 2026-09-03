import { useEffect, useState } from "react";
import api from "../services/api";

function BussinessModal({
  show,
  onClose,
  onSaved,
  editingBussiness,
}) {
  const emptyForm = {
    business_name: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingBussiness) {
      setForm({
        business_name: editingBussiness.business_name,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingBussiness]);

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const save = async () => {
    if (form.business_name.trim() === "") {
      alert("Bussiness Name is required.");

      return;
    }

    try {
      if (editingBussiness) {
        await api.put(
          `/business/${editingBussiness.business_id}`,
          form,
        );
      } else {
        await api.post("/business", form);
      }

      onSaved();

      onClose();

      setForm(emptyForm);
    } catch (err) {
      console.log(err);

      alert("Unable to save business.");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingBussiness ? "Edit Bussiness" : "Add Bussiness"}
            </h5>

            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Bussiness Name</label>

              <input
                type="text"
                className="form-control"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                placeholder="Enter Bussiness Name"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={save}>
              {editingBussiness ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BussinessModal;
