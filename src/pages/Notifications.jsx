import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get(
        "/Notifications"
      );

      setNotifications(res.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =====================================================
  // MARK AS READ
  // =====================================================

  const markAsRead = async (id) => {
    try {
      const res = await axiosInstance.patch(
        `/Notifications/${id}/read`
      );

      // API updated notification return kar rahi hai
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? res.data
            : notification
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    }
  };

  // =====================================================
  // MARK ALL READ
  // =====================================================

  const markAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) =>
          !notification.isRead
      );

    try {
      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            axiosInstance.patch(
              `/Notifications/${notification.id}/read`
            )
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(err);

      alert(
        "Unable to mark all notifications as read."
      );

      fetchNotifications();
    }
  };

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatDate = (date) => {
    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now - notificationDate;

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getIcon = (message) => {
    if (
      message
        ?.toLowerCase()
        .includes("assigned")
    ) {
      return "📋";
    }

    if (
      message
        ?.toLowerCase()
        .includes("status")
    ) {
      return "🔄";
    }

    return "🔔";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="notifications-page">

      {/* ================= HEADER ================= */}

      <div className="notifications-header">

        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with your task activity
          </p>
        </div>

        <div className="notification-header-actions">

          {unreadCount > 0 && (
            <span className="unread-count">
              {unreadCount} Unread
            </span>
          )}

          {unreadCount > 0 && (
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="notifications-error">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (

        <div className="notifications-loading">
          Loading notifications...
        </div>

      ) : notifications.length === 0 ? (

        /* ================= EMPTY ================= */

        <div className="empty-notifications">

          <div className="empty-notification-icon">
            🔔
          </div>

          <h3>
            No notifications
          </h3>

          <p>
            You're all caught up!
          </p>

        </div>

      ) : (

        /* ================= LIST ================= */

        <div className="notifications-list">

          {notifications.map(
            (notification) => (

              <div
                key={notification.id}
                className={`notification-card ${
                  !notification.isRead
                    ? "unread"
                    : "read"
                }`}
              >

                {/* ICON */}

                <div className="notification-icon">
                  {getIcon(
                    notification.message
                  )}
                </div>

                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top">

                    <div>

                      <h3>
                        {notification.message
                          ?.toLowerCase()
                          .includes(
                            "assigned"
                          )
                          ? "New Task Assigned"
                          : notification.message
                              ?.toLowerCase()
                              .includes(
                                "status"
                              )
                          ? "Task Status Updated"
                          : "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span className="new-badge">
                          NEW
                        </span>
                      )}

                    </div>

                    <span className="notification-time">
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <div className="notification-bottom">

                    <Link
                      to={`/tasks/${notification.taskItemId}`}
                      className="task-link"
                    >
                      View Task:{" "}
                      {notification.taskTitle}
                    </Link>

                    {!notification.isRead && (
                      <button
                        className="mark-read-btn"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >
                        ✓ Mark as read
                      </button>
                    )}

                    {notification.isRead && (
                      <span className="read-label">
                        ✓ Read
                      </span>
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}