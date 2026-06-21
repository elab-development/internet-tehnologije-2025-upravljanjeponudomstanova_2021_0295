import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import { getRole } from "../../auth/authService";
import ApiState from "../../components/ApiState";
import DataTable from "../../components/DataTable";
import EntityForm from "../../components/EntityForm";

function baseEndpoint(role) {
  if (role === "ADMIN") return "/admin/reservations";
  if (role === "EMPLOYEE") return "/employee/reservations";
  return null;
}

function statusLabel(status) {
  if (status === "ACTIVE") return "Aktivna";
  if (status === "CANCELLED") return "Otkazana";
  if (status === "COMPLETED") return "Završena";
  return status || "—";
}

function statusBadgeClass(status) {
  if (status === "ACTIVE") return "badge badge--ok";
  if (status === "CANCELLED") return "badge badge--bad";
  if (status === "COMPLETED") return "badge badge--warn";
  return "badge";
}

export default function ReservationsAppPage() {
  const role = getRole();
  const endpoint = useMemo(() => baseEndpoint(role), [role]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("list"); // "list" | "create"

  const load = useCallback(async () => {
    if (!endpoint) {
      setError("Nedozvoljen pristup.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.get(endpoint);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Greška pri učitavanju rezervacija");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(r) {
    if (!window.confirm(`Otkazati rezervaciju #${r.id}?`)) return;
    try {
      await api.patch(`${endpoint}/${r.id}/cancel`);
      await load();
    } catch (err) {
      alert(err?.message || "Greška pri otkazivanju");
    }
  }

  async function complete(r) {
    if (!window.confirm(`Označiti rezervaciju #${r.id} kao završenu? Stan će biti označen kao PRODAT.`)) return;
    try {
      await api.patch(`${endpoint}/${r.id}/complete`);
      await load();
    } catch (err) {
      alert(err?.message || "Greška pri završavanju");
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "stan",
        header: "Stan",
        render: (r) => {
          const num = r.apartment?.number ? `#${r.apartment.number}` : `ID ${r.apartmentId}`;
          const bld = r.apartment?.building?.name ? ` (${r.apartment.building.name})` : "";
          return `${num}${bld}`;
        },
      },
      { key: "customerName",  header: "Ime klijenta",   render: (r) => r.customerName  || "—" },
      { key: "customerEmail", header: "Email klijenta",  render: (r) => r.customerEmail || "—" },
      { key: "customerPhone", header: "Telefon",         render: (r) => r.customerPhone || "—" },
      {
        key: "agreedPrice",
        header: "Dogovorena cena",
        render: (r) => (r.agreedPrice != null ? `${r.agreedPrice} €` : "—"),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
        ),
      },
      {
        key: "createdBy",
        header: "Kreirao",
        render: (r) => r.createdBy?.fullName || r.createdBy?.email || "—",
      },
      {
        key: "akcije",
        header: "Akcije",
        render: (r) => {
          if (r.status !== "ACTIVE") return null;
          return (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => cancel(r)}>Otkaži</button>
              <button className="btn" onClick={() => complete(r)}>Završi</button>
            </div>
          );
        },
      },
    ],
    [cancel, complete]
  );

  const createFields = useMemo(
    () => [
      { name: "apartmentId",   label: "Stan ID",            type: "number" },
      { name: "customerName",  label: "Ime klijenta",       type: "text" },
      { name: "customerEmail", label: "Email klijenta",     type: "email" },
      { name: "customerPhone", label: "Telefon klijenta",   type: "text" },
      { name: "agreedPrice",   label: "Dogovorena cena (€)", type: "number" },
    ],
    []
  );

  const create = useCallback(
    async (values) => {
      const apartmentId = Number(values.apartmentId);
      if (!apartmentId || Number.isNaN(apartmentId)) {
        throw new Error("Stan ID je obavezan i mora biti broj.");
      }

      const agreedPrice = values.agreedPrice !== "" ? Number(values.agreedPrice) : null;
      if (agreedPrice !== null && (Number.isNaN(agreedPrice) || agreedPrice <= 0)) {
        throw new Error("Dogovorena cena mora biti pozitivan broj.");
      }

      await api.post(endpoint, {
        apartmentId,
        customerName:  values.customerName  || null,
        customerEmail: values.customerEmail || null,
        customerPhone: values.customerPhone || null,
        agreedPrice,
      });

      await load();
      setMode("list");
    },
    [endpoint, load]
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Rezervacije</h2>
          <p className="page-sub">Pregled i upravljanje rezervacijama.</p>
        </div>

        {mode === "list" && endpoint && (
          <button className="btn btn-primary" onClick={() => setMode("create")}>
            Nova rezervacija
          </button>
        )}
      </div>

      <ApiState
        loading={loading}
        error={error}
        empty={mode === "list" && rows.length === 0}
        emptyText="Nema rezervacija."
      >
        {mode === "list" ? (
          <DataTable columns={columns} rows={rows} />
        ) : (
          <EntityForm
            title="Nova rezervacija"
            fields={createFields}
            initialValues={{
              apartmentId:   "",
              customerName:  "",
              customerEmail: "",
              customerPhone: "",
              agreedPrice:   "",
            }}
            onSubmit={create}
            onCancel={() => setMode("list")}
            submitLabel="Kreiraj"
          />
        )}
      </ApiState>
    </div>
  );
}
