function ReusableTable({
  columns = [],
  data = [],
  rowKey,
  height = "400px",
  emptyMessage = "No data found.",
  onRowClick,
}) {
  return (
    <div
      className="table-responsive"
      style={{
        height,
        overflowY: "auto",
        overflowX: "auto",
        fontSize: "13px",
      }}
    >
      <table
        className="table table-bordered table-hover mb-0"
        style={{
          tableLayout: "auto",
          width: "100%",
        }}
      >

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <thead
          className="table-dark"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            fontSize: "12px",
          }}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                  padding: "6px 8px",
                  whiteSpace: "nowrap",
                  textAlign:
                    column.align || "left",
                  fontWeight: 600,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ========================= */}
        {/* BODY */}
        {/* ========================= */}

        <tbody>
          {data.length === 0 ? (

            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-muted"
                style={{
                  height: "80px",
                  padding: "8px",
                  verticalAlign: "middle",
                }}
              >
                {emptyMessage}
              </td>
            </tr>

          ) : (

            data.map((row, index) => (

              <tr
                key={
                  rowKey
                    ? row[rowKey]
                    : index
                }
                onClick={() =>
                  onRowClick &&
                  onRowClick(row)
                }
                style={{
                  cursor: onRowClick
                    ? "pointer"
                    : "default",
                }}
              >

                {columns.map((column) => {

                  let value;

                  if (column.render) {

                    value = column.render(
                      row,
                      index
                    );

                  } else {

                    value =
                      row[column.key];

                  }

                  return (
                    <td
                      key={column.key}
                      style={{
                        padding: "5px 8px",
                        verticalAlign:
                          "middle",
                        textAlign:
                          column.align ||
                          "left",
                        whiteSpace:
                          column.nowrap
                            ? "nowrap"
                            : "normal",
                        lineHeight: "1.2",
                      }}
                    >
                      {value ?? "-"}
                    </td>
                  );

                })}

              </tr>

            ))

          )}
        </tbody>

      </table>
    </div>
  );
}

export default ReusableTable;