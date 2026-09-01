import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/Dashboard/summary");
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="dashboard-page">

      {/* Header
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.fullName || "User"} 👋</p>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header> */}

      {/* Error */}
      {error && <div className="dashboard-error">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <>
          <div className="summary-grid">

            <div className="summary-card">
              <div className="card-icon">📋</div>
              <div>
                <p>Total Tasks</p>
                <h2>{summary.totalTasks}</h2>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📝</div>
              <div>
                <p>To Do</p>
                <h2>{summary.toDoCount}</h2>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏳</div>
              <div>
                <p>In Progress</p>
                <h2>{summary.inProgressCount}</h2>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div>
                <p>Completed</p>
                <h2>{summary.doneCount}</h2>
              </div>
            </div>

            <div className="summary-card overdue-card">
              <div className="card-icon">⚠️</div>
              <div>
                <p>Overdue</p>
                <h2>{summary.overdueCount}</h2>
              </div>
            </div>

          </div>

          {/* Overview */}
          <section className="overview-section">
            <div className="overview-card">
              <h2>Task Overview</h2>
              <p>Current status of your tasks</p>

              <div className="overview-row">
                <span>To Do</span>
                <strong>{summary.toDoCount}</strong>
              </div>

              <div className="overview-row">
                <span>In Progress</span>
                <strong>{summary.inProgressCount}</strong>
              </div>

              <div className="overview-row">
                <span>Completed</span>
                <strong>{summary.doneCount}</strong>
              </div>

              <div className="overview-row">
                <span>Overdue</span>
                <strong>{summary.overdueCount}</strong>
              </div>
            </div>

            <div className="overview-card welcome-card">
              <h2>Task Management</h2>
              <p>
                Keep track of your work, manage your tasks and stay productive.
              </p>

              <button
                className="tasks-btn"
                onClick={() => (window.location.href = "/tasks")}
              >
                View Tasks
              </button>
            </div>
          </section>
        </>
      )}

    </div>
  );
}

