import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getRole, getUser } from "../auth/authService";

export default function AppLayout() {
  const navigate = useNavigate();
  const role = getRole();
  const user = getUser();

  function logout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  return (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-title">Interni deo</div>
      <div className="sidebar-sub">
        {user?.email || ""} {role ? `(${role})` : ""}
      </div>

      <nav className="sidebar-nav">
        {role === "admin" && (
          <NavLink to="/app/buildings" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
            Zgrade
          </NavLink>
        )}

        {(role === "admin" || role === "owner") && (
          <NavLink to="/app/apartments" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
            Stanovi
          </NavLink>
        )}

        {(role === "admin" || role === "owner" || role === "staff") && (
          <NavLink to="/app/inquiries" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
            Upiti
          </NavLink>
        )}

        {(role === "admin" || role === "owner") && (
          <NavLink to="/app/reservations" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
            Rezervacije
          </NavLink>
        )}


        <button onClick={logout} className="btn" style={{ textAlign: "left", marginTop: 10 }}>
          Logout
        </button>
      </nav>
    </aside>

    <main className="main">
      <Outlet />
    </main>
  </div>
);
}
