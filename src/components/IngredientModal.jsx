import { useEffect, useMemo, useRef, useState } from "react";

export default function IngredientModal({
  open,
  onClose,
  onSelect,
  ingredients,
}) {
  const searchRef = useRef();
  const tableRef = useRef();
  const rowRefs = useRef([]);
  const [selectedRow, setSelectedRow] = useState(-1);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(-1);
  const [tableFocus, setTableFocus] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setSelectedRow(-1);
    setTableFocus(false);

    requestAnimationFrame(() => {
      searchRef.current?.focus();
      searchRef.current?.select(); // optional
    });
  }, [open]);

  useEffect(() => {
    if (selectedRow >= 0) {
      tableRef.current?.focus();
    } else {
      searchRef.current?.focus();
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow >= 0) {
      rowRefs.current[selectedRow]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth", // Use "auto" for instant scrolling like most POS systems
      });
    }
  }, [selectedRow]);

  useEffect(() => {
    if (selectedRow >= 0) {
      rowRefs.current[selectedRow]?.scrollIntoView({
        block: "nearest",

        inline: "nearest",

        behavior: "auto",
      });
    }
  }, [selectedRow]);

  const rows = useMemo(() => {
    return ingredients.filter((x) =>
      x.ingredient.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, ingredients]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (rows.length === 0) return;

      e.preventDefault();

      setSelectedRow((prev) => {
        if (prev === -1) return 0;

        return Math.min(prev + 1, rows.length - 1);
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setSelectedRow((prev) => {
        if (prev <= 0) return -1;

        return prev - 1;
      });
    }

    if (e.key === "Enter" && selectedRow >= 0) {
      e.preventDefault();

      onSelect(rows[selectedRow]);
    }
  };

  const handleTableKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();

        setSelectedRow((prev) => Math.min(prev + 1, rows.length - 1));

        break;

      case "ArrowUp":
        e.preventDefault();

        if (selectedRow === 0) {
          // Go back to search bar
          setSelectedRow(-1);

          searchRef.current.focus();
        } else {
          setSelectedRow((prev) => prev - 1);
        }

        break;

      case "Enter":
        if (selectedRow >= 0) {
          onSelect(rows[selectedRow]);
        }

        break;

      case "Escape":
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-table" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Ingredient</h3>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          ref={searchRef}
          placeholder="Search Ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <div
          ref={tableRef}
          className="table-container"
          tabIndex={0}
          onKeyDown={handleTableKeyDown}
        >
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Package Size</th>
                <th>Unit</th>
                <th>Purchase Cost</th>
                <th>Margin</th>
                <th>Cost/Unit</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.formula_id}
                  ref={(el) => (rowRefs.current[index] = el)}
                  className={selectedRow === index ? "selected" : ""}
                  onMouseEnter={() => {
                    setSelectedRow(index);
                  }}
                  onClick={() => {
                    onSelect(row);
                  }}
                >
                  <td>{row.ingredient}</td>
                  <td>{row.package_size}</td>
                  <td>{row.unit}</td>
                  <td>{row.purchase_cost}</td>
                  <td>{row.margin}</td>
                  <td>{parseFloat(row.cost_per_unit).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tableFocus && (
          <div
            tabIndex={0}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((prev) => Math.min(prev + 1, rows.length - 1));
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();

                if (selected === 0) {
                  searchRef.current.focus();
                  setTableFocus(false);
                  setSelected(-1);
                } else {
                  setSelected((prev) => Math.max(prev - 1, 0));
                }
              }

              if (e.key === "Enter") {
                e.preventDefault();

                if (selected >= 0) {
                  onSelect(rows[selected]);
                }
              }

              if (e.key === "Escape") {
                onClose();
              }
            }}
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />
        )}
      </div>
    </div>
  );
}
