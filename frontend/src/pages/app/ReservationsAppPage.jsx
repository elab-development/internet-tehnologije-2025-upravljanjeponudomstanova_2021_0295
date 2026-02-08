import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";
import { getRole } from "../../auth/authService";
import DataTable from "../../components/DataTable";

function endpointForRole(role) {
  if (role === "admin") return "/admin/reservations";
  if (role === "owner") return "/owner/reservations";
  return null;
}

export default function ReservationsAppPage() {
  const role = getRole();
  const endpoint = endpointForRole(role);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
      .catch((err) => setError(err?.message || "Greška pri učitavanju rezervacija"))
      .finally(() => setLoading(false));
  }, [endpoint]);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "apartmentId", header: "StanID" },
      { key: "startDate", header: "Od" },
      { key: "endDate", header: "Do" },
      { key: "status", header: "Status" },
      { key: "createdAt", header: "Kreirano" },
    ],
    []
  );

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Rezervacije</h2>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
