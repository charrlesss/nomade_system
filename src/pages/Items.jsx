import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import MenuModal from "../components/MenuModal";
import IngredientModal from "../components/IngredientModal";
function Items() {
  const [searchParams] = useSearchParams();
  const business = searchParams.get("business");
  const [menus, setMenus] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editingMenu, setEditingMenu] = useState(null);

  const [open, setOpen] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const ingredientRef = useRef(null);

  const [recipeForm, setRecipeForm] = useState({
    ingredient: "",
    qty12: "",
    qty16: "",
    qty22: "",
    unit: "",
    cost_per_unit: 0,
    cost12: 0,
    cost16: 0,
    cost22: 0,
  });

  const cap12ozRef = useRef(null);

  useEffect(() => {
    loadMenus(business);
    loadIngredients(business);
  }, [business]);

  const loadIngredients = async (business) => {
    const res = await api.get(`/formula/${business}`);
    setIngredients(res.data);
  };

  const loadMenus = async (business) => {
    try {
      const res = await api.get(`/items/${business}`);

      setMenus(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const closeModalOnSelect = () => {
    setOpen(false);
    // Wait until modal unmounts
    setTimeout(() => {
      console.log(cap12ozRef);
      cap12ozRef.current?.focus();
    }, 100);
  };

  const closeModalOnClose = () => {
    setOpen(false);
    // Wait until modal unmounts
    setTimeout(() => {
      ingredientRef.current?.focus();
    }, 100);
  };

  // ======================
  // ADD MENU
  // ======================

  const addMenu = () => {
    setEditingMenu(null);

    setShowModal(true);
  };

  // ======================
  // EDIT MENU
  // ======================

  const editMenu = (menu) => {
    setEditingMenu(menu);

    setShowModal(true);
  };

  // ======================
  // DELETE MENU
  // ======================

  const deleteMenu = async (id) => {
    if (!window.confirm("Delete this menu?")) {
      return;
    }

    try {
      await api.delete(`/items/${id}`);

      loadMenus(business);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Menu</h3>

        <button className="btn btn-primary" onClick={addMenu}>
          + Add Menu
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Menu</th>

            <th>Category</th>

            <th>Cost (16oz)</th>

            <th>Selling Price</th>

            <th>Net Profit</th>

            <th width="220">Action</th>
          </tr>
        </thead>

        <tbody>
          {menus.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No Menu Found
              </td>
            </tr>
          ) : (
            menus.map((menu) => (
              <tr key={menu.id}>
                <td>{menu.menu_name}</td>

                <td>{menu.category_name}</td>

                <td>₱ {Number(menu.cost16).toFixed(2)}</td>

                <td>₱ {Number(menu.selling_price_16).toFixed(2)}</td>

                <td>
                  <strong>₱ {Number(menu.net16).toFixed(2)}</strong>
                </td>

                <td>
                  <button className="btn btn-info btn-sm me-2">View</button>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editMenu(menu)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteMenu(menu.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <MenuModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={loadMenus}
        editingMenu={editingMenu}
        business={business}
        setOpen={setOpen}
        ingredientRef={ingredientRef}
        cap12ozRef={cap12ozRef}
        recipeForm={recipeForm}
        setRecipeForm={setRecipeForm}
      />

      <IngredientModal
        open={open}
        onClose={() => {
          setOpen(false);
          closeModalOnClose();
        }}
        onSelect={(item) => {
          const temp = {
            ...recipeForm,
            ingredient: item.ingredient,
            unit: item.unit,
            cost_per_unit: parseFloat(item.cost_per_unit).toFixed(4),
          };

          setRecipeForm(temp);

          setOpen(false);
          closeModalOnSelect();
        }}
        ingredients={ingredients}
      />
    </div>
  );
}

export default Items;
