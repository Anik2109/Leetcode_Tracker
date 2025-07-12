import { useEffect, useState } from "react";
import authService from "../services/Auth";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService.getCurrentUser()
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.error("❌ Auth error:", err.response?.data || err.message);
      });
  }, []);

  if (!user) return <p>🔒 Not logged in</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.fullName}</p>
      <p>Username: {user.username}</p>
    </div>
  );
}