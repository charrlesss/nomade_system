import { useEffect, useState } from "react";
import api from "../services/api";

function CategoryModal({ show, onClose, onSaved, editingCategory, business }) {
  const emptyForm = {
    category_name: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingCategory) {
      setForm({
        category_name: editingCategory.category_name,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingCategory]);

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const save = async () => {
    if (form.category_name.trim() === "") {
      alert("Category Name is required.");

      return;
    }

    const newForm = {
      business_id: business,
      ...form,
    };

    try {
      if (editingCategory) {
        const res = await api.put(
          `/categories/${editingCategory.category_id}`,
          newForm,
        );
        alert(res.data.message);
      } else {
        const res = await api.post("/categories", newForm);
        alert(res.data.message);
      }

      onSaved(business);
      onClose();
      setForm(emptyForm);
    } catch (err) {
      console.log(err);
      alert("Unable to save category.");
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </h5>

            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Category Name</label>

              <input
                type="text"
                className="form-control"
                name="category_name"
                value={form.category_name}
                onChange={handleChange}
                placeholder="Enter Category Name"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={save}>
              {editingCategory ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;
