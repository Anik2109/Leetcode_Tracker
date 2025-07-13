import { useEffect, useState } from "react";
import authService from "../services/Auth";
import Dashboard from "../components/Dashboard/Dashboard";
import StudyPlans from "../components/StudyPlans/StudyPlans";

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

  if (!user){
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f0f1c] text-white space-y-4">
      {/* Bouncing dots */}
      <div className="flex space-x-3">
        <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-5 w-5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-5 w-5 bg-purple-500 rounded-full animate-bounce"></div>
      </div>

      {/* Funny DSA comment */}
      <p className="text-lg text-white">
        "Generating testcases... Verifying against hidden inputs... 🙃"
      </p>
    </div>
  );
}

  return (
    <>
      <Dashboard />
      <StudyPlans />

    </>
  );
}