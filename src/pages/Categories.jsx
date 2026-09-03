import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import CategoryModal from "../components/CategoryModal";

function Categories() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const business = searchParams.get("business");

  useEffect(() => {
    loadCategories(business);
  }, [business]);

  // ==========================
  // LOAD
  // ==========================

  const loadCategories = async (business_id) => {
    try {
      const res = await api.get(`/categories/${business_id}`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // ADD
  // ==========================

  const addCategory = () => {
    setEditingCategory(null);

    setShowModal(true);
  };

  // ==========================
  // EDIT
  // ==========================

  const editCategory = (category) => {
    setEditingCategory(category);

    setShowModal(true);
  };

  // ==========================
  // DELETE
  // ==========================

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/categories/${id}`);
      alert(res.data.message);
      loadCategories(business);
    } catch (err) {
      console.log(err);

      alert("Unable to delete category.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categories</h3>

        <button className="btn btn-primary" onClick={addCategory}>
          + Add Category
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Category Name</th>
            <th width="180">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                No Category Found
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.category_id}>
                <td>{category.category_name}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editCategory(category)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCategory(category.category_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <CategoryModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadCategories}
        editingCategory={editingCategory}
        business={business}
      />
    </div>
  );
}

export default Categories;
