import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./Users.css";

export default function Users() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "User",
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const canViewUsers =
    user?.role === "Admin" || user?.role === "Manager";

  const canCreateUser = user?.role === "Admin";

  // =========================
  // GET USERS
  // =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await axiosInstance.get("/User", {
        params,
      });

      setUsers(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [roleFilter, user]);

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE USER
  // =========================
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setCreateError("");
      setSuccessMessage("");

      await axiosInstance.post("/User", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "User",
      });

      setShowCreateModal(false);

      setSuccessMessage("User created successfully!");

      await fetchUsers();

       // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    } catch (err) {
      console.error(err);

      setCreateError(
        err.response?.data?.message ||
          "Unable to create user."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredUsers = users.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.fullName?.toLowerCase().includes(searchText) ||
      item.email?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // ACCESS DENIED
  // =========================
  if (!canViewUsers) {
    return (
      <div className="users-page">
        <div className="access-denied">
          <div className="access-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>
            You don't have permission to view the users page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">

        {successMessage && (
            <div className="success-toast">
                <span className="success-icon">✓</span>
                <span>{successMessage}</span>
            </div>
        )}


      {/* HEADER */}
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p>
            Manage users and their roles
          </p>
        </div>

        {canCreateUser && (
          <button
            className="create-user-btn"
            onClick={() => {
              setCreateError("");
              setShowCreateModal(true);
            }}
          >
            + Create User
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="users-toolbar">

        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="role-filter">
          <label>Role</label>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </select>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="users-error">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="users-loading">
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (

        /* EMPTY */
        <div className="empty-users">
          <div className="empty-users-icon">
            👥
          </div>

          <h3>No users found</h3>

          <p>
            No users match your search or selected role.
          </p>
        </div>

      ) : (

        /* TABLE */
        <div className="users-table-container">

          <table className="users-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((item) => (

                <tr key={item.id}>

                  <td>
                    <div className="user-info">

                      <div className="user-avatar">
                        {item.fullName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <div className="user-name">
                          {item.fullName}
                        </div>

                        <div className="user-id">
                          ID: {item.id}
                        </div>
                      </div>

                    </div>
                  </td>

                  <td>
                    {item.email}
                  </td>

                  <td>
                    <span
                      className={`role-badge role-${item.role?.toLowerCase()}`}
                    >
                      {item.role}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowCreateModal(false)
          }
        >

          <div
            className="create-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Create User</h2>
                <p>
                  Add a new user to the system
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                ×
              </button>

            </div>

            {createError && (
              <div className="create-error">
                {createError}
              </div>
            )}

            <form
              onSubmit={handleCreateUser}
            >

              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="User">
                    User
                  </option>

                  <option value="Manager">
                    Manager
                  </option>

                  <option value="Admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-user-btn"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}