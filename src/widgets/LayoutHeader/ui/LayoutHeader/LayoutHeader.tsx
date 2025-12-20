import { FC } from "react";
// import { Logo } from "@/widgets"; // Tạm thời không dùng Component Logo vì nó hardcode 'navbar-center'
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { LogOut, User, Settings } from "lucide-react";

const LayoutHeader: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header>
      <nav className="navbar border-b border-gray-200 bg-base-100 px-4">
        {/* 1. Navbar Start: Đặt Logo ở đây để nằm hẳn về bên trái */}
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl normal-case">
            Lab Platform
          </Link>
        </div>

        {/* 2. Navbar Center: Để trống (hoặc ẩn đi) để không chiếm chỗ ở giữa */}
        <div className="navbar-center hidden lg:flex"></div>

        {/* 3. Navbar End: Chứa các menu item và profile, nằm hẳn về bên phải */}
        <div className="navbar-end gap-2">
          {/* Nhóm các link điều hướng */}
          <div className="flex gap-1">
            <Link
              to="/"
              className="btn btn-ghost text-sm font-normal normal-case"
            >
              Trang chủ
            </Link>
            <Link
              to="/subject"
              className="btn btn-ghost text-sm font-normal normal-case"
            >
              Môn học
            </Link>
            <Link
              to="/history"
              className="btn btn-ghost text-sm font-normal normal-case"
            >
              Lịch sử
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end ml-2">
            <label
              tabIndex={0}
              className="avatar placeholder btn btn-circle btn-ghost"
            >
              <div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
                <span className="text-xl">
                  {user?.ten ? user.ten.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content rounded-box menu-sm z-[1] mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li className="menu-title px-4 py-2">
                <span>Xin chào, {user?.ten || "User"}</span>
              </li>
              <li>
                <a className="justify-between">
                  <User size={16} /> Profile
                  <span className="badge badge-primary">New</span>
                </a>
              </li>
              <li>
                <a>
                  <Settings size={16} /> Settings
                </a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default LayoutHeader;
