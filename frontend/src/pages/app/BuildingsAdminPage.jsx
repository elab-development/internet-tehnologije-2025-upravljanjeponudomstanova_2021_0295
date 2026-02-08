import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import DataTable from "../../components/DataTable";
import EntityForm from "../../components/EntityForm";

export default function BuildingsAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
  const [selected, setSelected] = useState(null);

  function resetForm() {
    setSelected(null);
    setMode("list");
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/admin/buildings");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Greška pri učitavanju zgrada");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Naziv" },
      { key: "address", header: "Adresa" },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Izmeni",
        onClick: (r) => {
          setSelected(r);
          setMode("edit");
        },
      },
      {
        label: "Obriši",
        onClick: async (r) => {
          if (!window.confirm(`Obrisati zgradu "${r.name}"?`)) return;
          try {
            await api.del(`/admin/buildings/${r.id}`);
            await load();
          } catch (err) {
            alert(err?.message || "Greška pri brisanju");
          }
        },
      },
    ],
    []
  );

  const fields = useMemo(
    () => [
      { name: "name", label: "Naziv", type: "text", required: true },
      { name: "address", label: "Adresa", type: "text", required: true },
    ],
    []
  );

  async function create(values) {
    await api.post("/admin/buildings", values);
    await load();
    resetForm();
  }

  async function update(values) {
    await api.put(`/admin/buildings/${selected.id}`, values);
    await load();
    resetForm();
  }

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Zgrade (Admin)</h2>
          <p className="page-sub">CRUD operacije nad zgradama.</p>
        </div>

        {mode === "list" ? (
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            Nova zgrada
          </button>
        ) : null}
      </div>

      {mode === "list" ? (
        <DataTable columns={columns} rows={rows} actions={actions} />
      ) : mode === "create" ? (
        <EntityForm
          title="Nova zgrada"
          fields={fields}
          initialValues={{ name: "", address: "" }}
          onSubmit={create}
          onCancel={resetForm}
          submitLabel="Kreiraj"
        />
      ) : (
        <EntityForm
          title={`Izmena zgrade #${selected?.id}`}
          fields={fields}
          initialValues={{
            name: selected?.name || "",
            address: selected?.address || "",
          }}
          onSubmit={update}
          onCancel={resetForm}
          submitLabel="Sačuvaj"
        />
      )}
    </div>
  );
}
