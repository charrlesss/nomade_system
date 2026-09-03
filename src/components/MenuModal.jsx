import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function MenuModal({
  show,
  onClose,
  onSaved,
  business,
  setOpen,
  ingredientRef,
  cap12ozRef,
  recipeForm,
  setRecipeForm,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const tableRef = useRef(null);
  const cap16ozRef = useRef(null);
  const cap22ozRef = useRef(null);
  const profitMarginQty12Ref = useRef(null);
  const profitMarginQty16Ref = useRef(null);
  const profitMarginQty22Ref = useRef(null);
  const buttonSaveRef = useRef(null);
  const [editIndex, setEditIndex] = useState(-1);

  // ==========================
  // MENU FORM
  // ==========================
  const [form, setForm] = useState({
    menu_name: "",
    category_id: "",
  });

  // ==========================
  // DROPDOWNS
  // ==========================
  const [categories, setCategories] = useState([]);

  // ==========================
  // RECIPE TABLE
  // ==========================
  const [recipe, setRecipe] = useState([]);

  // ==========================
  // RECIPE FORM
  // ==========================

  useEffect(() => {
    if (show) {
      loadCatigories(business);
    }
  }, [show, business]);

  const total12 = recipe.reduce((sum, item) => sum + item.cost12, 0);

  const total16 = recipe.reduce((sum, item) => sum + item.cost16, 0);

  const total22 = recipe.reduce((sum, item) => sum + item.cost22, 0);

  // ==========================
  // LOAD FORMULA
  // ==========================

  // ==========================
  // LOAD INGREDIENTS
  // ==========================
  const loadCatigories = async () => {
    try {
      const res = await api.get(`/categories/${business}`);
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // MENU CHANGE
  // ==========================
  const handleMenuChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const addIngredient = () => {
    const data = {
      ingredient: recipeForm.ingredient,

      qty12: Number(recipeForm.qty12),

      qty16: Number(recipeForm.qty16),

      qty22: Number(recipeForm.qty22),

      cost12: Number(recipeForm.cost12),

      cost16: Number(recipeForm.cost16),

      cost22: Number(recipeForm.cost22),

      unit: recipeForm.unit,

      cost_per_unit: Number(recipeForm.cost_per_unit),
    };
    if (editIndex >= 0) {
      const temp = [...recipe];

      temp[editIndex] = data;

      setRecipe(temp);

      setEditIndex(-1);
    } else {
      setRecipe([...recipe, data]);
    }
    setShowModal(false);
    setRecipeForm({
      ingredient: "",

      qty12: "",

      qty16: "",

      qty22: "",

      cost12: 0,

      cost16: 0,

      cost22: 0,

      unit: "",

      cost_per_unit: 0,
    });

    ingredientRef.current.focus();
  };

  const editIngredient = (index) => {

    const item = recipe[index];

    setRecipeForm({
      ...item,
    });

    setEditIndex(index);
     setShowModal(true);
  };

  const deleteIngredient = (index) => {
    if (!window.confirm("Delete this ingredient?")) {
      return;
    }

    const temp = recipe.filter((_, i) => i !== index);

    setRecipe(temp);
  };

  const handleRecipeChange = (e) => {
    const { name, value } = e.target;

    const temp = {
      ...recipeForm,

      [name]: value,
    };

    temp.cost12 = Number(temp.qty12 || 0) * Number(temp.cost_per_unit || 0);

    temp.cost16 = Number(temp.qty16 || 0) * Number(temp.cost_per_unit || 0);

    temp.cost22 = Number(temp.qty22 || 0) * Number(temp.cost_per_unit || 0);

    setRecipeForm(temp);
  };

  const handleMenuSave = async () => {
    const rows = [...tableRef.current.rows];
    rows.shift();
    const headerKeys = [
      "ingredient",
      "cup_12oz",
      "cup_16oz",
      "cup_22oz",
      "cost_12oz",
      "cost_16oz",
      "cost_22oz",
      "unit",
      "cost_unit",
      "action",
    ];

    const data = rows.map((cell) => {
      const tds = [...cell.children];
      tds.pop();
      const tdText = tds.map((td) => {
        return td.textContent;
      });
      const obj = { ...tdText };
      Object.assign({}, tdText);

      return obj;
    });
    console.log(data);

    await api.post("/items", data);
  };

  // ======================
  // ADD MENU
  // ======================

  const addRecipe = () => {
    setEditingRecipe(null);

    setShowModal(true);
  };

  // ======================
  // EDIT MENU
  // ======================

  const editRecipe = (menu) => {
    setEditingRecipe(menu);
    setShowModal(true);
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h4>Add Menu</h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* MENU INFORMATION */}

            <div className="d-flex flex-row align-items-end gap-2 w-full ">
              <div className="">
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Menu Name
                </label>
                <input
                  className="form-control "
                  style={{
                    width: "350px",
                    height: "23px",
                    fontSize: "14px",
                    padding: "0px 5px",
                  }}
                  name="menu_name"
                  value={form.menu_name}
                  onChange={handleMenuChange}
                />
              </div>

              <div className="">
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Category
                </label>

                <select
                  className="form-select "
                  name="category_id"
                  value={form.category_id}
                  onChange={handleMenuChange}
                  style={{
                    width: "350px",
                    height: "23px",
                    fontSize: "14px",
                    padding: "0px 5px",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="">
                <button
                  ref={buttonSaveRef}
                  className="btn btn-success"
                  onClick={addRecipe}
                  style={{
                    height: "25px",
                    padding: "0px 5px",
                    fontSize: "13px",
                  }}
                >
                  Add Recipe
                </button>
              </div>
            </div>

            <div className="mt-3">
              <table
                ref={tableRef}
                className="table table-bordered table-sm table-hover"
              >
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "300px" }}>Ingredient</th>
                    <th style={{ width: "100px" }}>12oz</th>
                    <th style={{ width: "100px" }}>16oz</th>
                    <th style={{ width: "100px" }}>22oz</th>
                    <th style={{ width: "100px" }}>Unit</th>
                    <th style={{ width: "100px" }}>Cost/Unit</th>
                    <th style={{ width: "100px" }}>Cost12</th>
                    <th style={{ width: "100px" }}>Cost16</th>
                    <th style={{ width: "100px" }}>Cost22</th>
                    <th style={{ width: "150px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {recipe.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No ingredients added.
                      </td>
                    </tr>
                  ) : (
                    recipe.map((item, index) => (
                      <tr key={index}>
                        <td>{item.ingredient}</td>
                        <td>{item.qty12}</td>
                        <td>{item.qty16}</td>
                        <td>{item.qty22}</td>
                        <td>{item.unit}</td>
                        <td>{item.cost_per_unit}</td>
                        <td>{item.cost12.toFixed(2)}</td>
                        <td>{item.cost16.toFixed(2)}</td>
                        <td>{item.cost22.toFixed(2)}</td>

                        <td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => editIngredient(index)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteIngredient(index)}
                            >
                              Delete
                            </button>
                          </td>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <div className="row">
                <div className="col">
                  <strong>Total 12oz : ₱ {total12.toFixed(2)}</strong>
                </div>

                <div className="col">
                  <strong>Total 16oz : ₱ {total16.toFixed(2)}</strong>
                </div>

                <div className="col">
                  <strong>Total 22oz : ₱ {total22.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleMenuSave}>
              Save Menu
            </button>
          </div>
        </div>
      </div>

      <RecipeEntryModal
        showModal={showModal}
        ingredientRef={ingredientRef}
        recipeForm={recipeForm}
        cap12ozRef={cap12ozRef}
        buttonSaveRef={buttonSaveRef}
        cap16ozRef={cap16ozRef}
        cap22ozRef={cap22ozRef}
        addIngredient={addIngredient}
        editIndex={editIndex}
        handleRecipeChange={handleRecipeChange}
        onClose={() => setShowModal(false)}
        setOpen={setOpen}
      />
    </div>
  );
}
const RecipeEntryModal = ({
  showModal,
  ingredientRef,
  recipeForm,
  cap12ozRef,
  buttonSaveRef,
  cap16ozRef,
  cap22ozRef,
  addIngredient,
  editIndex,
  handleRecipeChange,
  onClose,
  setOpen,
}) => {
  if (!showModal) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,.5)",
      }}
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h4>Add Recipe</h4>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <fieldset className="border rounded p-2">
            <legend className="float-none w-auto px-2 fs-6">
              Recipe Entry
            </legend>
            <div className="d-flex align-items-end gap-2 flex-nowrap">
              <div style={{ width: "300px" }}>
                <label className="form-label small mb-1">Ingredient</label>
                <input
                  ref={ingredientRef}
                  name="ingredient"
                  type="text"
                  value={recipeForm.ingredient}
                  className="form-control form-control-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                  readOnly
                />
              </div>
            </div>
            <div className="d-flex align-items-end gap-2 flex-nowrap">
              {/* Unit */}
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Unit</label>
                <input
                  className="form-control form-control-sm"
                  name="unit"
                  value={recipeForm.unit}
                  readOnly
                />
              </div>

              {/* Cost/Unit */}
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Cost/Unit</label>

                <input
                  className="form-control form-control-sm"
                  value={recipeForm.cost_per_unit}
                  readOnly
                />
              </div>
            </div>
            <div className="d-flex align-items-end gap-2 flex-nowrap">
              {/* Ingredient */}

              {/* 12oz */}

              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">12oz</label>
                <input
                  ref={cap12ozRef}
                  type="number"
                  className="form-control form-control-sm"
                  name="qty12"
                  value={recipeForm.qty12}
                  onChange={handleRecipeChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      cap16ozRef.current.focus();
                    }
                  }}
                />
              </div>

              {/* 16oz */}

              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">16oz</label>

                <input
                  ref={cap16ozRef}
                  type="number"
                  className="form-control form-control-sm"
                  name="qty16"
                  value={recipeForm.qty16}
                  onChange={handleRecipeChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      cap22ozRef.current.focus();
                    }
                  }}
                />
              </div>

              {/* 22oz */}

              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">22oz</label>

                <input
                  ref={cap22ozRef}
                  type="number"
                  className="form-control form-control-sm"
                  name="qty22"
                  value={recipeForm.qty22}
                  onChange={handleRecipeChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      profitMarginQty12Ref.current.focus();
                    }
                  }}
                />
              </div>
            </div>
            <div className="d-flex align-items-end gap-2 flex-nowrap">
              {/* Cost12 */}
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Cost 12oz</label>

                <input
                  className="form-control form-control-sm"
                  value={recipeForm.cost12.toFixed(2)}
                  readOnly
                />
              </div>

              {/* Cost16 */}
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Cost 16oz</label>

                <input
                  className="form-control form-control-sm"
                  value={recipeForm.cost16.toFixed(2)}
                  readOnly
                />
              </div>

              {/* Cost22 */}
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Cost 22oz</label>

                <input
                  className="form-control form-control-sm"
                  value={recipeForm.cost22.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
            <button
              ref={buttonSaveRef}
              className="btn btn-success"
              onClick={addIngredient}
            >
              {editIndex >= 0 ? "Update" : "Add"}
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
export default MenuModal;
