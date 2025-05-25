import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Navbar as RBNavbar, Nav, Container, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const navbarRef = useRef();

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

  // Collapse navbar after click (for mobile/tablet)
  const handleNavClick = () => {
    setShowDropdown(false);
    if (navbarRef.current && window.innerWidth < 992) {
      navbarRef.current.classList.remove("show");
    }
  };

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5050", {
      query: { userId: user._id },
      transports: ["websocket"],
      withCredentials: true,
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
    <RBNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <RBNavbar.Brand as={Link} to="/">Blog System</RBNavbar.Brand>
        <RBNavbar.Toggle aria-controls="navbarNav" />
        <RBNavbar.Collapse id="navbarNav" ref={navbarRef}>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/posts" onClick={handleNavClick}>All Posts</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/posts/create" onClick={handleNavClick}>Create Post</Nav.Link>
                {user.isAdmin && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/admin/users" onClick={handleNavClick}>Users</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/posts" onClick={handleNavClick}>All Posts</NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user && (
              <Nav.Item className="position-relative me-3">
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
              </Nav.Item>
            )}
            {user && user.profileImage && (
              <Nav.Item className="ms-2">
                <span className="nav-link">
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
                </span>
              </Nav.Item>
            )}
            {user ? (
              <>
                <Nav.Link disabled>Hello, {user.username}!</Nav.Link>
                <Nav.Link href="/auth/logout" onClick={(e) => { handleLogout(e); handleNavClick(); }}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/auth/login" onClick={handleNavClick}>Login</Nav.Link>
                <Nav.Link as={Link} to="/auth/register" onClick={handleNavClick}>Register</Nav.Link>
              </>
            )}
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
}

export default Navbar;