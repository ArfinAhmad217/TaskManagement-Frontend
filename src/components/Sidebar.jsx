import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: "📋",
    },
    {
      name: "Teams",
      path: "/teams",
      icon: "👥",
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: "🔔",
    },

    // Admin + Manager only
    ...(user?.role === "Admin" || user?.role === "Manager"
      ? [
          {
            name: "Users",
            path: "/users",
            icon: "👤",
          },
        ]
      : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TASK</h2>
        <span>MANAGEMENT</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          onClick={logout}
          className="sidebar-logout"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}