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
  return !loading ? (
    <div className="min-h-screen flex flex-wrap content-between">
      <div className="w-full block">
        {!hideHeader &&(<Header />)}
        <main className="bg-base-200 min-h-screen">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  ) : (
    <div className="flex justify-center content-center h-screen">
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
}

export default App;