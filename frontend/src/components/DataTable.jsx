import React from "react";

export default function DataTable({ columns = [], rows = [], actions = [] }) {
  const hasActions = Array.isArray(actions) && actions.length > 0;

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key}>{c.header}</th>
          ))}
          {hasActions ? <th>Akcije</th> : null}
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (hasActions ? 1 : 0)}>
              Nema podataka.
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.id ?? JSON.stringify(r)}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(r) : String(r?.[c.key] ?? "")}
                </td>
              ))}

              {hasActions ? (
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        className={`btn ${a.variant === "primary" ? "btn-primary" : ""}`}
                        onClick={() => a.onClick(r)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              ) : null}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
