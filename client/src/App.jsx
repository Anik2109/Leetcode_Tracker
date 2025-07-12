import { useDispatch, useSelector } from "react-redux";
import Header from "./components/Header/Header.jsx";
import { useEffect, useState } from "react";
import authService from "./services/Auth.js";
import { login, logout } from "./app/authslice";
import { Outlet ,useLocation} from "react-router-dom";
import API from "./api/axios.js";

function App() {
  const [loading, setLoading] = useState();
  const dispatch = useDispatch();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.authStatus);
  const hideHeader = location.pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      authService
        .getCurrentUser()
        .then((userData) => {
          if (userData) dispatch(login(userData));
          else {
            dispatch(logout());
            localStorage.removeItem("accessToken");
          }
        })
        .catch(() => {
          dispatch(logout());
          localStorage.removeItem("accessToken");
        })
        .finally(() => setLoading(false));
    } else {
      dispatch(logout());
      setLoading(false);
    }
  }, [dispatch]);
  if (loading) {
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
  return !loading ? (
    <div className="flex flex-wrap content-between bg-[#1e1e2f]">
      <div className="w-full block">
        {!hideHeader &&(<Header />)}
        <main className="bg-[#1e1e2f]">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  ) : (
    <div className=" bg-[#1e1e2f] flex justify-center content-center">
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
}

export default App;