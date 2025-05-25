import React, { useEffect } from "react";
import { io } from "socket.io-client";

function NotificationTest() {
  useEffect(() => {
    const socket = io("http://localhost:5050", { withCredentials: true });
    socket.on("notification", (data) => {
      alert("Notification received: " + data.message);
    });
    return () => socket.disconnect();
  }, []);
  return null;
}

export default NotificationTest;