import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

function Formulas() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");

  const emptyForm = {
    ingredient: "",
    package_size: "",
    unit: "",
    purchase_cost: "",
    margin: "",
  };

  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadIngredients(business);
  }, [business]);

  const loadIngredients = async (business) => {
    const res = await api.get(`/formula/${business}`);
    console.log(res.data);
    setIngredients(res.data);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const openEdit = (item) => {
    setEditingId(item.formula_id);

    setForm({
      ingredient: item.ingredient,
      package_size: item.package_size,
      unit: item.unit,
      purchase_cost: item.purchase_cost,
      margin: item.margin,
    });
  };

  const save = async () => {
    const newForm = {
      business_id: business,
      ...form,
    };
    if (editingId) {
      const res = await api.put(`/formula/${editingId}`, newForm);
      alert(res.data.message);
    } else {
      const res = await api.post("/formula", newForm);
      alert(res.data.message);
    }

    setForm(emptyForm);
    setEditingId(null);

    loadIngredients(business);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete ingredient?")) return;

    const res = await api.delete(`/formula/${id}`);
    alert(res.data.message);
    loadIngredients(business);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between mb-3">
        <h3>Formulas</h3>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#ingredientModal"
          onClick={openAdd}
        >
          Add Formula
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Package Size</th>
            <th>Unit</th>
            <th>Purchase Cost</th>
            <th>Margin</th>
            <th>Cost/Unit</th>
            <th width="150">Action</th>
          </tr>
        </thead>

        <tbody>
          {ingredients.map((item) => (
            <tr key={item.formula_id}>
              <td>{item.ingredient}</td>
              <td>{item.package_size}</td>
              <td>{item.unit}</td>
              <td>{item.purchase_cost}</td>
              <td>{item.margin}</td>
              <td>{parseFloat(item.cost_per_unit).toFixed(4)}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#ingredientModal"
                  onClick={() => openEdit(item)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(item.formula_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" id="ingredientModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>{editingId ? "Edit Ingredient" : "Add Ingredient"}</h5>
            </div>

            <div className="modal-body">
              <input
                className="form-control mb-2"
                placeholder="Ingredient"
                name="ingredient"
                value={form.ingredient}
                onChange={handleChange}
              />

              <input
                className="form-control mb-2"
                placeholder="Package Size"
                name="package_size"
                value={form.package_size}
                onChange={handleChange}
              />

              <input
                className="form-control mb-2"
                placeholder="Unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
              />

              <input
                className="form-control mb-2"
                placeholder="Purchase Cost"
                name="purchase_cost"
                value={form.purchase_cost}
                onChange={handleChange}
              />
              <input
                className="form-control"
                placeholder="Margin"
                name="margin"
                value={form.margin}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>

              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={save}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Formulas;
