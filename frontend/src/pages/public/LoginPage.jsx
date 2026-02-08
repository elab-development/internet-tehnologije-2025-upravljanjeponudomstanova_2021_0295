import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/apiClient";
import { isLoggedIn, setAuth } from "../../auth/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) navigate("/app", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // backend: { token, user: { id, email, role } }
      const data = await api.post("/auth/login", { email, password });

      if (!data?.token || !data?.user?.role) {
        throw new Error("Login odgovor nema token/user.role");
      }

      // VAŽNO: tvoj setAuth očekuje (token, user)
      setAuth(data.token, data.user);

      const redirectTo = location.state?.from || "/app";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Neuspešan login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="page-head">
          <div>
            <h2 className="page-title">Login</h2>
            <p className="page-sub">Prijava na interni deo aplikacije.</p>
          </div>
        </div>

        <div className="card">
          {error ? (
            <div className="error" style={{ marginBottom: 10 }}>
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Email
              </label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="npr. admin@test.com"
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Prijavljivanje..." : "Prijavi se"}
            </button>
          </form>

          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Posle prijave pristup je ograničen po ulozi (admin/owner/staff).
          </div>
        </div>
      </div>
    </div>
  );
}
