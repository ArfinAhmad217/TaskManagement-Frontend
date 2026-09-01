import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./TaskDetail.css";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/Tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load task.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments/task/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.patch(`/Tasks/${id}/status`, { status: newStatus });
      await fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update status.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      await axiosInstance.post(`/comments/task/${id}`, {
        content: newComment,
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to post comment.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="task-detail-loading">Loading...</div>;
  if (error) return <div className="task-detail-error">{error}</div>;
  if (!task) return null;

  return (
    <div className="task-detail-page">
      <button className="back-btn" onClick={() => navigate("/tasks")}>
        ← Back to Tasks
      </button>

      <div className="task-detail-card">
        <div className="task-detail-header">
          <h1>{task.title}</h1>
          <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        {task.description && <p className="task-detail-description">{task.description}</p>}

        <div className="task-detail-meta">
          <div>
            <label>Status</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="ToDo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label>Deadline</label>
            <p>{task.deadline ? new Date(task.deadline).toLocaleString() : "-"}</p>
          </div>

          <div>
            <label>Team</label>
            <p>{task.teamName || "-"}</p>
          </div>

          <div>
            <label>Assigned To</label>
            <p>{task.assignedToUserName || "Unassigned"}</p>
          </div>

          <div>
            <label>Created By</label>
            <p>{task.createdByUserName || "-"}</p>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>

        <form className="comment-form" onSubmit={handleAddComment}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" disabled={posting}>
            {posting ? "Posting..." : "Post"}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-user">{c.userName}</div>
                <div className="comment-content">{c.content}</div>
                <div className="comment-date">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}