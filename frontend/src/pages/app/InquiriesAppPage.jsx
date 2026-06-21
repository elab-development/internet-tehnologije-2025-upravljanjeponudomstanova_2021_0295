import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import { getRole } from "../../auth/authService";
import ApiState from "../../components/ApiState";
import DataTable from "../../components/DataTable";

const INQUIRY_STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function statusLabel(status) {
  if (status === "NEW")       return "Nov";
  if (status === "CONTACTED") return "Kontaktiran";
  if (status === "CLOSED")    return "Zatvoren";
  return status || "—";
}

function statusBadgeClass(status) {
  if (status === "NEW")       return "badge badge--ok";
  if (status === "CONTACTED") return "badge badge--warn";
  if (status === "CLOSED")    return "badge";
  return "badge";
}

function endpointForRole(role) {
  if (role === "ADMIN")    return "/admin/inquiries";
  if (role === "EMPLOYEE") return "/employee/inquiries";
  return null;
}

function formatDateOnly(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("sr-RS");
}

export default function InquiriesAppPage() {
  const role = getRole();
  const endpoint = endpointForRole(role);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!endpoint) {
      setError("Nedozvoljen pristup.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get(endpoint)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.message || "Greška pri učitavanju upita"))
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(inquiry, newStatus) {
    try {
      await api.patch(`${endpoint}/${inquiry.id}/status`, { status: newStatus });
      load();
    } catch (err) {
      alert(err?.message || "Greška pri izmeni statusa");
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name",    header: "Ime" },
      { key: "email",   header: "Email" },
      { key: "phone",   header: "Telefon", render: (r) => r.phone || "—" },
      { key: "message", header: "Poruka" },
      {
        key: "stan",
        header: "Stan",
        render: (r) => {
          if (!r.apartment) return r.apartmentId ? `ID ${r.apartmentId}` : "—";
          const num = r.apartment.number ? `#${r.apartment.number}` : "";
          const bld = r.apartment.building?.name ? ` (${r.apartment.building.name})` : "";
          return `${num}${bld}` || `ID ${r.apartmentId}`;
        },
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span>
        ),
      },
      {
        key: "statusChange",
        header: "Izmeni status",
        render: (r) => (
          <select
            className="select"
            value={r.status || ""}
            onChange={(e) => changeStatus(r, e.target.value)}
            style={{ minWidth: 130 }}
          >
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        ),
      },
      {
        key: "createdAt",
        header: "Kreirano",
        render: (r) => formatDateOnly(r.createdAt),
      },
    ],
    [changeStatus]
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">Upiti</h2>
          <p className="page-sub">Pregled i upravljanje upitima.</p>
        </div>
      </div>

      <ApiState
        loading={loading}
        error={error}
        empty={rows.length === 0}
        emptyText="Nema upita."
      >
        <DataTable columns={columns} rows={rows} />
      </ApiState>
    </div>
  );
}
