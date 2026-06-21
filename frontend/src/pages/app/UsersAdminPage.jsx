import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import ApiState from "../../components/ApiState";
import DataTable from "../../components/DataTable";
import EntityForm from "../../components/EntityForm";

function roleLabel(role) {
  if (role === "ADMIN") return "Administrator";
  if (role === "EMPLOYEE") return "Zaposleni";
  return role || "—";
}

export default function UsersAdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("list"); // "list" | "create"

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/admin/users");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Greška pri učitavanju korisnika");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(user) {
    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      await load();
    } catch (err) {
      alert(err?.message || "Greška pri izmeni statusa");
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "fullName",
        header: "Ime i prezime",
        render: (r) => r.fullName || "—",
      },
      { key: "email", header: "Email" },
      {
        key: "role",
        header: "Uloga",
        render: (r) => roleLabel(r.role),
      },
      {
        key: "isActive",
        header: "Status",
        render: (r) => (
          <span className={r.isActive ? "badge badge--ok" : "badge badge--bad"}>
            {r.isActive ? "Aktivan" : "Neaktivan"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Akcije",
        render: (r) => (
          <button
            className="btn"
            onClick={() => toggleActive(r)}
          >
            {r.isActive ? "Deaktiviraj" : "Aktiviraj"}
          </button>
        ),
      },
    ],
    [toggleActive]
  );

  const roleOptions = useMemo(
    () => [
      { value: "EMPLOYEE", label: "Zaposleni" },
      { value: "ADMIN", label: "Administrator" },
    ],
    []
  );

  const createFields = useMemo(
    () => [
      { name: "fullName", label: "Ime i prezime", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "password", label: "Lozinka", type: "password" },
      { name: "role", label: "Uloga", type: "select", options: roleOptions },
    ],
    [roleOptions]
  );

  async function createUser(values) {
    if (!values.email || !values.password || !values.role) {
      throw new Error("Email, lozinka i uloga su obavezni.");
    }
    await api.post("/auth/register", {
      fullName: values.fullName || null,
      email: values.email,
      password: values.password,
      role: values.role,
    });
    await load();
    setMode("list");
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Korisnici</h2>
          <p className="page-sub">Upravljanje internim korisnicima.</p>
        </div>

        {mode === "list" && (
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            Novi korisnik
          </button>
        )}
      </div>

      <ApiState
        loading={loading}
        error={error}
        empty={mode === "list" && rows.length === 0}
        emptyText="Nema korisnika."
      >
        {mode === "list" ? (
          <DataTable columns={columns} rows={rows} />
        ) : (
          <EntityForm
            title="Novi korisnik"
            fields={createFields}
            initialValues={{ fullName: "", email: "", password: "", role: "EMPLOYEE" }}
            onSubmit={createUser}
            onCancel={() => setMode("list")}
            submitLabel="Kreiraj"
          />
        )}
      </ApiState>
    </div>
  );
}
