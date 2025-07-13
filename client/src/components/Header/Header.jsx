import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import authService from "../../services/Auth";
import { logout as authLogout } from "../../app/authslice";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const role = useSelector(state => state.role.role);

  
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isActive = (path) =>
    pathname === path ? "text-white" : "text-slate-300";

  const navItemClass =
    "hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition duration-200";
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(authLogout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-[#0f0f1c] shadow-sm border-b border-[#2d2d3f]">
      <div className=" px-1 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-1 flex items-center cursor-pointer">
            <Link to="/home" className="flex items-center">
              <img
                className="m-2"
                src="/leetcode.svg"
                width="30px"
                height="30px"
                alt="Logo"
              />
              <p className="m-2 text-xl text-white font-bold">
                LeetCode Tracker
              </p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/home" className={`${isActive("/home")} ${navItemClass}`}>
              Home
            </Link>
            <Link to="/companies" className={`${isActive("/companies")} ${navItemClass}`}>
              Companies
            </Link>
            <Link to="/topics" className={`${isActive("/topics")} ${navItemClass}`}>
              Topics
            </Link>
            <Link to="/profile" className={`${isActive("/profile")} ${navItemClass}`}>
              Profile
            </Link>
            {authService.isAdmin() && (
              <Link to="/admin" className={`${isActive("/admin")} ${navItemClass}`}>
                Admin
              </Link>
            )}
            {authStatus && (
              <button
                onClick={handleLogout}
                className="text-red-400 bg-transparent  hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile menu button (not wired yet) */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-slate-300 hover:text-amber-400 focus:outline-none focus:text-amber-400 p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-[#2d2d3f]">
            <Link
              to="/home"
              className={`${isActive("/home")} block px-3 py-2 rounded-md text-base font-medium transition duration-200`}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className={`${isActive("/profile")} block px-3 py-2 rounded-md text-base font-medium transition duration-200`}
            >
              Profile
            </Link>
            <Link
              to="/companies"
              className={`${isActive("/companies")} block px-3 py-2 rounded-md text-base font-medium transition duration-200`}
            >
              Companies
            </Link>
            <Link
              to="/topics"
              className={`${isActive("/topics")} block px-3 py-2 rounded-md text-base font-medium transition duration-200`}
            >
              Topics
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}