import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import authService from "../services/Auth";
import { useDispatch } from "react-redux";
import { login as authLogin } from "../app/authslice";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await authService.login(username, password);
      if (user) dispatch(authLogin(user));
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="bg-[#1a1a2e]/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg w-full max-w-md border border-[#2d2d44] transition-all duration-300">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/leetcode.svg"
            alt="LeetCode Logo"
            className="w-14 h-14 mb-4 drop-shadow-md"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            LeetCode Tracker
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Track your coding progress</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              placeholder="Enter your password"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md shadow-md hover:shadow-orange-700/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition duration-200 font-semibold tracking-wide"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}