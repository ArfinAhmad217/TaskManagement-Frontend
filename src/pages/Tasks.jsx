import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./Tasks.css";

export default function Tasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    teamId: "",
    assignedToUserId: "",
  });

  const isAdmin = user?.role === "Admin";

  const canManage =
    user?.role === "Admin" ||
    user?.role === "Manager";

  // =====================================================
  // GET TASKS
  // =====================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status) {
        params.status = status;
      }

      if (priority) {
        params.priority = priority;
      }

      const res = await axiosInstance.get("/Tasks", {
        params,
      });

      setTasks(res.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      priority: "Medium",
      deadline: "",
      teamId: "",
      assignedToUserId: "",
    });

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",

      deadline: task.deadline
        ? task.deadline.substring(0, 16)
        : "",

      teamId: task.teamId || "",

      assignedToUserId:
        task.assignedToUserId || "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTask(null);
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // ===============================
      // UPDATE
      // PUT /api/Tasks/{id}
      // ===============================

      if (editingTask) {
        const payload = {
          title: form.title,
          description: form.description || null,
          priority: form.priority,

          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : null,

          assignedToUserId:
            form.assignedToUserId
              ? Number(form.assignedToUserId)
              : null,
        };

        await axiosInstance.put(
          `/Tasks/${editingTask.id}`,
          payload
        );
      }

      // ===============================
      // CREATE
      // POST /api/Tasks
      // ===============================

      else {
        const payload = {
          title: form.title,
          description: form.description || null,
          priority: form.priority,

          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : null,

          teamId: Number(form.teamId),

          assignedToUserId:
            form.assignedToUserId
              ? Number(form.assignedToUserId)
              : null,
        };

        await axiosInstance.post(
          "/Tasks",
          payload
        );
      }

      closeModal();

      await fetchTasks();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // PATCH /api/Tasks/{id}/status
  // =====================================================

  const updateStatus = async (
    taskId,
    newStatus
  ) => {
    try {
      await axiosInstance.patch(
        `/Tasks/${taskId}/status`,
        {
          status: newStatus,
        }
      );

      await fetchTasks();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to update task status."
      );
    }
  };

  // =====================================================
  // DELETE
  // DELETE /api/Tasks/{id}
  // =====================================================

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(
        `/Tasks/${taskId}`
      );

      setTasks((prev) =>
        prev.filter(
          (task) => task.id !== taskId
        )
      );

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to delete task."
      );
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (taskStatus) => {
    switch (
      taskStatus?.toLowerCase()
    ) {
      case "done":
      case "completed":
        return "status-done";

      case "in progress":
      case "inprogress":
        return "status-progress";

      case "to do":
      case "todo":
        return "status-todo";

      default:
        return "status-default";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (
    taskPriority
  ) => {
    switch (
      taskPriority?.toLowerCase()
    ) {
      case "high":
        return "priority-high";

      case "medium":
        return "priority-medium";

      case "low":
        return "priority-low";

      default:
        return "priority-default";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="tasks-page">

      {/* ================= HEADER ================= */}

      <div className="tasks-header">

        <div>
          <h1>Tasks</h1>

          <p>
            Manage and track your tasks
          </p>
        </div>

        {canManage && (
          <button
            className="create-task-btn"
            onClick={openCreateModal}
          >
            + Create Task
          </button>
        )}

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="tasks-error">
          {error}
        </div>
      )}

      {/* ================= FILTERS ================= */}

      <div className="task-filters">

        <div className="filter-group">

          <label>Status</label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="">
              All Status
            </option>

            <option value="ToDo">
              To Do
            </option>

            <option value="InProgress">
              In Progress
            </option>

            <option value="Done">
              Done
            </option>
          </select>

        </div>

        <div className="filter-group">

          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="">
              All Priority
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>

        <button
          className="clear-filter-btn"
          onClick={() => {
            setStatus("");
            setPriority("");
          }}
        >
          Clear Filters
        </button>

      </div>

      {/* ================= TASK LIST ================= */}

      {loading ? (

        <div className="tasks-loading">
          Loading tasks...
        </div>

      ) : tasks.length === 0 ? (

        <div className="empty-tasks">

          <div className="empty-icon">
            📋
          </div>

          <h3>
            No tasks found
          </h3>

          <p>
            Create a task or change your filters.
          </p>

        </div>

      ) : (

        <div className="tasks-table-container">

          <table className="tasks-table">

            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {tasks.map((task) => (

                <tr key={task.id}>

                  {/* TASK */}

                  <td>

                    <div className="task-title">
                      {task.title}
                    </div>

                    {task.description && (
                      <div className="task-description">
                        {task.description}
                      </div>
                    )}

                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={`status-badge ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status === "ToDo"
                        ? "To Do"
                        : task.status ===
                          "InProgress"
                        ? "In Progress"
                        : task.status}
                    </span>

                  </td>

                  {/* PRIORITY */}

                  <td>

                    <span
                      className={`priority-badge ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                  </td>

                  {/* DEADLINE */}

                  <td>

                    {task.deadline
                      ? new Date(
                          task.deadline
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="task-actions">

                      {/* VIEW */}

                      <Link
                        to={`/tasks/${task.id}`}
                        className="view-btn"
                      >
                        View
                      </Link>

                      {/* STATUS */}

                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(e) =>
                          updateStatus(
                            task.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="ToDo">
                          To Do
                        </option>

                        <option value="InProgress">
                          In Progress
                        </option>

                        <option value="Done">
                          Done
                        </option>

                      </select>

                      {/* EDIT */}

                      {canManage && (
                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditModal(task)
                          }
                        >
                          Edit
                        </button>
                      )}

                      {/* DELETE */}

                      {isAdmin && (
                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteTask(task.id)
                          }
                        >
                          Delete
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div className="modal-overlay">

          <div className="task-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>

                <p>
                  {editingTask
                    ? "Update task details"
                    : "Create a new task"}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="task-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}

              <div className="form-group">

                <label>
                  Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  maxLength={200}
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  rows="4"
                />

              </div>

              {/* PRIORITY + DEADLINE */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Priority *
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    required
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Deadline
                  </label>

                  <input
                    type="datetime-local"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* TEAM */}

              {!editingTask && (

                <div className="form-group">

                  <label>
                    Team ID *
                  </label>

                  <input
                    type="number"
                    name="teamId"
                    value={form.teamId}
                    onChange={handleChange}
                    placeholder="Enter Team ID"
                    min="1"
                    required
                  />

                </div>

              )}

              {/* ASSIGNED USER */}

              <div className="form-group">

                <label>
                  Assigned User ID
                </label>

                <input
                  type="number"
                  name="assignedToUserId"
                  value={form.assignedToUserId}
                  onChange={handleChange}
                  placeholder="Enter User ID"
                  min="1"
                />

              </div>

              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-task-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "Update Task"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}