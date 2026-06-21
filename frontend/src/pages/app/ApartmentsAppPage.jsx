import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import ApiState from "../../components/ApiState";
import DataTable from "../../components/DataTable";
import EntityForm from "../../components/EntityForm";
import { getRole } from "../../auth/authService";

function statusBadgeClass(status) {
  if (status === "AVAILABLE") return "badge badge--ok";
  if (status === "RESERVED")  return "badge badge--warn";
  if (status === "SOLD")      return "badge badge--bad";
  return "badge";
}

function statusLabel(status) {
  if (status === "AVAILABLE") return "Dostupan";
  if (status === "RESERVED")  return "Rezervisan";
  if (status === "SOLD")      return "Prodat";
  return status || "—";
}

export default function ApartmentsAppPage() {
  const role = getRole();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
  const [selected, setSelected] = useState(null);

  const listEndpoint = useMemo(() => {
    if (role === "ADMIN") return "/admin/apartments";
    return "/employee/apartments";
  }, [role]);

  const resetForm = useCallback(() => {
    setSelected(null);
    setMode("list");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(listEndpoint);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Greška pri učitavanju stanova");
    } finally {
      setLoading(false);
    }
  }, [listEndpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const statusOptions = useMemo(() => [
    { value: "AVAILABLE", label: "Dostupan" },
    { value: "RESERVED",  label: "Rezervisan" },
    { value: "SOLD",      label: "Prodat" },
  ], []);

  const pricePublicOptions = useMemo(() => [
    { value: "false", label: "Ne (cena na upit)" },
    { value: "true",  label: "Da (prikaži cenu)" },
  ], []);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "building",
        header: "Zgrada",
        render: (r) => r.building?.name ?? r.buildingId ?? "—",
      },
      { key: "number", header: "Broj" },
      { key: "floor",  header: "Sprat" },
      { key: "rooms",  header: "Sobe" },
      { key: "area",   header: "m²" },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
        ),
      },
      {
        key: "price",
        header: "Cena",
        render: (r) => (
          <span className="badge">{r.price != null ? `${r.price} €` : "—"}</span>
        ),
      },
    ],
    []
  );

  const actions = useMemo(() => {
    const base = [
      {
        label: "Izmeni",
        onClick: (r) => {
          setSelected(r);
          setMode("edit");
        },
      },
    ];

    if (role === "ADMIN") {
      base.push({
        label: "Obriši",
        onClick: async (r) => {
          if (!window.confirm(`Obrisati stan #${r.number ?? r.id}?`)) return;
          try {
            await api.del(`/admin/apartments/${r.id}`);
            await load();
          } catch (err) {
            alert(err?.message || "Greška pri brisanju");
          }
        },
      });
    }

    return base;
  }, [role, load]);

  const fields = useMemo(
    () => [
      { name: "buildingId", label: "Zgrada ID",     type: "number" },
      { name: "number",     label: "Broj stana",    type: "text" },
      { name: "floor",      label: "Sprat",         type: "number" },
      { name: "rooms",      label: "Broj soba",     type: "number" },
      { name: "area",       label: "Površina (m²)", type: "number" },
      { name: "price",      label: "Cena (€)",      type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        name: "isPricePublic",
        label: "Prikaži cenu javno",
        type: "select",
        options: pricePublicOptions,
      },
    ],
    [statusOptions, pricePublicOptions]
  );

  const create = useCallback(
    async (values) => {
      await api.post("/admin/apartments", {
        ...values,
        isPricePublic: values.isPricePublic === "true",
      });
      await load();
      resetForm();
    },
    [load, resetForm]
  );

  const update = useCallback(
    async (values) => {
      const endpoint =
        role === "ADMIN"
          ? `/admin/apartments/${selected.id}`
          : `/employee/apartments/${selected.id}`;
      await api.put(endpoint, {
        ...values,
        isPricePublic: values.isPricePublic === "true",
      });
      await load();
      resetForm();
    },
    [role, selected, load, resetForm]
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Stanovi</h2>
          <p className="page-sub">
            {role === "ADMIN" ? "Admin upravljanje stanovima." : "Pregled i izmena stanova."}
          </p>
        </div>

        {mode === "list" && role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            Novi stan
          </button>
        )}
      </div>

      <ApiState
        loading={loading}
        error={error}
        empty={mode === "list" && rows.length === 0}
        emptyText="Nema stanova."
      >
        {mode === "list" ? (
          <DataTable columns={columns} rows={rows} actions={actions} />
        ) : mode === "create" ? (
          <EntityForm
            title="Novi stan"
            fields={fields}
            initialValues={{
              buildingId:    "",
              number:        "",
              floor:         "",
              rooms:         "",
              area:          "",
              price:         "",
              status:        "AVAILABLE",
              isPricePublic: "false",
            }}
            onSubmit={create}
            onCancel={resetForm}
            submitLabel="Kreiraj"
          />
        ) : (
          <EntityForm
            title={`Izmena stana #${selected?.id}`}
            fields={fields}
            initialValues={{
              buildingId:    selected?.buildingId    ?? "",
              number:        selected?.number        ?? "",
              floor:         selected?.floor         ?? "",
              rooms:         selected?.rooms         ?? "",
              area:          selected?.area          ?? "",
              price:         selected?.price         ?? "",
              status:        selected?.status        ?? "AVAILABLE",
              isPricePublic: selected?.isPricePublic ? "true" : "false",
            }}
            onSubmit={update}
            onCancel={resetForm}
            submitLabel="Sačuvaj"
          />
        )}
      </ApiState>
    </div>
  );
}
