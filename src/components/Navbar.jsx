import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h3>Task Management</h3>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="navbar-user-info">
          <strong>{user?.fullName || "User"}</strong>
          <span>{user?.role || "User"}</span>
        </div>
      </div>
    </header>
  );
}