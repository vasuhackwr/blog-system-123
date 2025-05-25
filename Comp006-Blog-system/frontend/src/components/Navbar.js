import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Nav } from "react-bootstrap";

function Navbar({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = () => {
    setShowDropdown(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch("/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (onLogout) onLogout();
      navigate("/auth/login");
    } catch {
      navigate("/auth/login");
    }
  };

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5050", {
      query: { userId: user._id },
      transports: ["websocket"],
    });

    socket.on("new_post", (data) => {
      setNotifications((prev) => [{ ...data, seen: false }, ...prev]);
    });

    fetch("/notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map((n) => ({
          postId: n.postId._id || n.postId,
          title: n.postId.title || n.title,
          author: n.postId.author?.username || n.author || "Author",
          createdAt: n.createdAt,
          seen: n.seen,
        }));
        setNotifications(mapped);
      });

    return () => socket.disconnect();
  }, [user]);

  const handleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      fetch("/notifications/mark-seen", {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, seen: true }))
      );
    }
  };

  const unseenCount = notifications.filter((n) => !n.seen).length;

  function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.round((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Blog System
        </Link>
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
          {user && (
            <li className="nav-item position-relative">
              <span
                className="nav-link"
                style={{ cursor: "pointer", position: "relative" }}
                onClick={handleDropdown}
              >
                <i className="bi bi-bell" style={{ fontSize: "1.5rem" }}></i>
                {unseenCount > 0 && (
                  <span
                    className="badge bg-danger"
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      fontSize: "0.75rem",
                    }}
                  >
                    {unseenCount}
                  </span>
                )}
              </span>
              {showDropdown && (
                <div
                  className="dropdown-menu show"
                  style={{
                    right: 0,
                    left: "auto",
                    maxHeight: "350px",
                    overflowY: "auto",
                  }}
                >
                  {notifications.length === 0 && (
                    <span className="dropdown-item text-muted">
                      No notifications
                    </span>
                  )}
                  {notifications.map((n, i) => (
                    <Link
                      key={i}
                      className="dropdown-item"
                      to={`/posts/${n.postId}`}
                      onClick={() => setShowDropdown(false)}
                    >
                      <b>{n.title}</b>
                      <br />
                      <small>
                        by {n.author} &middot; {timeAgo(n.createdAt)}
                      </small>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          )}
          {user && (
            <li className="nav-item ms-3">
              <span className="nav-link">
                {user.profileImage && (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginRight: 8,
                    }}
                  />
                )}
              </span>
            </li>
          )}
          <li className="nav-item ms-3">
            <Nav className="align-items-center">
              {user ? (
                <>
                  <Nav.Link disabled>Hello, {user.username}!</Nav.Link>
                  <Nav.Link
                    href="/auth/logout"
                    onClick={(e) => {
                      handleLogout(e);
                      handleNavClick();
                    }}
                  >
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/auth/login"
                    onClick={handleNavClick}
                  >
                    Login
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/auth/register"
                    onClick={handleNavClick}
                  >
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
