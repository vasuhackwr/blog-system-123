import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Flash from "./components/Flash";
import UsersIndex from "./pages/UsersIndex";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostShow from "./pages/PostShow";
import PostsIndex from "./pages/PostsIndex";
import PostCreate from "./pages/PostCreate";
import PostEdit from "./pages/PostEdit";
import AdminPosts from "./pages/AdminPosts";
import AdminUsers from "./pages/AdminUsers";
import NotificationTest from "./components/NotificationTest";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  const messages = { success: [], error: [] };
  const [user, setUser] = useState(null);

  // Fetch user info on mount (for Google OAuth and session persistence)
  useEffect(() => {
    fetch("/auth/user", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) setUser(data.user);
        else setUser(null); // Ensure user is cleared if not logged in
      });
  }, []);

  return (
    <Router>
      {/* Pass onLogout to Navbar so it can clear user on logout */}
      <Navbar user={user} onLogout={() => setUser(null)} />
      <NotificationTest />
      <div className="container mt-5 pt-4">
        {/* <Flash messages={messages} /> */}
        <Routes>
          <Route path="/" element={<Login onLogin={setUser} />} />
          <Route path="/auth/login" element={<Login onLogin={setUser} />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/posts" element={<PostsIndex user={user} />} />
          <Route path="/posts/create" element={<PostCreate />} />
          <Route path="/posts/:id/edit" element={<PostEdit />} />
          <Route path="/posts/:id" element={<PostShow user={user} />} />
          <Route path="/users" element={<UsersIndex />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;