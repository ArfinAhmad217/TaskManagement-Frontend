import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import "./Teams.css";

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [saving, setSaving] = useState(false);

  const [addMemberTeamId, setAddMemberTeamId] = useState(null);
  const [memberUserId, setMemberUserId] = useState("");

  const isAdmin = user?.role === "Admin";
  const canManageMembers = user?.role === "Admin" || user?.role === "Manager";

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Team");
      setTeams(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await axiosInstance.post("/Team", {
        name,
        managerId: managerId ? Number(managerId) : null,
      });
      setShowModal(false);
      setName("");
      setManagerId("");
      await fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create team.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (teamId) => {
    if (!memberUserId) return;
    try {
      await axiosInstance.post(`/Team/${teamId}/members`, {
        userId: Number(memberUserId),
      });
      setMemberUserId("");
      setAddMemberTeamId(null);
      await fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to add member.");
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    const confirmed = window.confirm("Remove this member from the team?");
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/Team/${teamId}/members/${userId}`);
      await fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to remove member.");
    }
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div>
          <h1>Teams</h1>
          <p>Manage teams and members</p>
        </div>

        {isAdmin && (
          <button className="create-team-btn" onClick={() => setShowModal(true)}>
            + Create Team
          </button>
        )}
      </div>

      {error && <div className="teams-error">{error}</div>}

      {loading ? (
        <div className="teams-loading">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="empty-teams">No teams found.</div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="manager-tag">
                  Manager: {team.managerName || "Unassigned"}
                </span>
              </div>

              <div className="team-members">
                <label>Members ({team.members.length})</label>
                {team.members.length === 0 ? (
                  <p className="no-members">No members yet.</p>
                ) : (
                  <ul>
                    {team.members.map((m) => (
                      <li key={m.userId}>
                        <span>{m.fullName} ({m.role})</span>
                        {canManageMembers && (
                          <button
                            className="remove-member-btn"
                            onClick={() => handleRemoveMember(team.id, m.userId)}
                          >
                            ×
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canManageMembers && (
                <div className="add-member-row">
                  {addMemberTeamId === team.id ? (
                    <>
                      <input
                        type="number"
                        placeholder="User ID"
                        value={memberUserId}
                        onChange={(e) => setMemberUserId(e.target.value)}
                      />
                      <button onClick={() => handleAddMember(team.id)}>Add</button>
                      <button
                        className="cancel-add-btn"
                        onClick={() => {
                          setAddMemberTeamId(null);
                          setMemberUserId("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="add-member-btn"
                      onClick={() => setAddMemberTeamId(team.id)}
                    >
                      + Add Member
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="team-modal">
            <div className="modal-header">
              <h2>Create Team</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateTeam} className="team-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Manager User ID</label>
                <input
                  type="number"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}