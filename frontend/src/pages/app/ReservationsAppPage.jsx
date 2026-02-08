import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import { getRole } from "../../auth/authService";
import DataTable from "../../components/DataTable";
import EntityForm from "../../components/EntityForm";

function endpointForRole(role) {
  if (role === "admin") return "/admin/reservations";
  if (role === "owner") return "/owner/reservations";
  return null;
}

function badgeClassForReservationStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("active")) return "badge badge--ok";
  if (s.includes("expired")) return "badge badge--warn";
  if (s.includes("canceled")) return "badge badge--bad";
  return "badge";
}

function normalizeNullableText(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export default function ReservationsAppPage() {
  const role = getRole();
  const listEndpoint = useMemo(() => endpointForRole(role), [role]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("list"); // list | create | edit
  const [selected, setSelected] = useState(null);

  const reset = useCallback(() => {
    setSelected(null);
    setMode("list");
  }, []);

  const load = useCallback(async () => {
    if (!listEndpoint) {
      setError("Nedozvoljen pristup.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.get(listEndpoint);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Greška pri učitavanju rezervacija");
    } finally {
      setLoading(false);
    }
  }, [listEndpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "apartmentInfo",
        header: "Stan",
        render: (r) => {
          const aptId = r.apartmentId ?? r.apartment?.id ?? "-";
          const aptNo = r.apartment?.number != null ? `#${r.apartment.number}` : "";
          const bName = r.apartment?.building?.name ? ` (${r.apartment.building.name})` : "";
          return `${aptId}${aptNo}${bName}`;
        },
      },
      { key: "startDate", header: "Od" },
      { key: "endDate", header: "Do" },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className={badgeClassForReservationStatus(r.status)}>{r.status || "N/A"}</span>
        ),
      },
      { key: "createdAt", header: "Kreirano" },
    ],
    []
  );

  const actions = useMemo(() => {
    if (role !== "admin") return [];

    return [
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
          if (!window.confirm(`Obrisati rezervaciju #${r.id}?`)) return;
          try {
            await api.del(`/admin/reservations/${r.id}`);
            await load();
          } catch (err) {
            alert(err?.message || "Greška pri brisanju rezervacije");
          }
        },
      },
    ];
  }, [role, load]);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "— (null)" },
      { value: "active", label: "active" },
      { value: "canceled", label: "canceled" },
      { value: "expired", label: "expired" },
    ],
    []
  );

  const createFields = useMemo(
    () => [
      { name: "apartmentId", label: "Stan ID", type: "number" },
      { name: "startDate", label: "Datum od (YYYY-MM-DD)", type: "text", placeholder: "2026-02-08" },
      { name: "endDate", label: "Datum do (YYYY-MM-DD)", type: "text", placeholder: "2026-02-10" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
    [statusOptions]
  );

  const editFields = useMemo(
    () => [
      { name: "startDate", label: "Datum od (YYYY-MM-DD)", type: "text" },
      { name: "endDate", label: "Datum do (YYYY-MM-DD)", type: "text" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
    [statusOptions]
  );

  const create = useCallback(
    async (values) => {
      const apartmentId = Number(values.apartmentId);
      if (!apartmentId || Number.isNaN(apartmentId)) {
        throw new Error("apartmentId je obavezan i mora biti broj.");
      }

      await api.post("/admin/reservations", {
        apartmentId,
        startDate: normalizeNullableText(values.startDate),
        endDate: normalizeNullableText(values.endDate),
        status: normalizeNullableText(values.status), // active/canceled/expired ili null
      });

      await load();
      reset();
    },
    [load, reset]
  );

  const update = useCallback(
    async (values) => {
      if (!selected?.id) throw new Error("Nema selektovane rezervacije.");

      // backend PUT ne prima apartmentId, samo startDate/endDate/status
      await api.put(`/admin/reservations/${selected.id}`, {
        startDate: normalizeNullableText(values.startDate),
        endDate: normalizeNullableText(values.endDate),
        status: normalizeNullableText(values.status),
      });

      await load();
      reset();
    },
    [selected, load, reset]
  );

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Rezervacije</h2>
          <p className="page-sub">Admin: CRUD. Owner: pregled.</p>
        </div>

        {role === "admin" && mode === "list" ? (
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            Nova rezervacija
          </button>
        ) : null}
      </div>

      {mode === "list" ? (
        <DataTable columns={columns} rows={rows} actions={actions} />
      ) : mode === "create" ? (
        <EntityForm
          title="Nova rezervacija"
          fields={createFields}
          initialValues={{
            apartmentId: "",
            startDate: "",
            endDate: "",
            status: "active",
          }}
          onSubmit={create}
          onCancel={reset}
          submitLabel="Kreiraj"
        />
      ) : (
        <EntityForm
          title={`Izmena rezervacije #${selected?.id}`}
          fields={editFields}
          initialValues={{
            startDate: selected?.startDate ?? "",
            endDate: selected?.endDate ?? "",
            status: selected?.status ?? "",
          }}
          onSubmit={update}
          onCancel={reset}
          submitLabel="Sačuvaj"
        />
      )}
    </div>
  );
}
