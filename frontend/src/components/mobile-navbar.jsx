
import { useNavigate } from "react-router-dom"
import { FaHome, FaUser, FaUsers, FaSignOutAlt } from "react-icons/fa"

const MobileNav = ({ activePage, setActivePage, onLogout }) => {
  const navigate = useNavigate()

  const handleNavigation = (page) => {
    setActivePage(page)

    switch (page) {
      case "home":
        navigate("/")
        break
      case "profile":
        navigate("/profile")
        break
      case "groups":
        navigate("/groups")
        break
      default:
        navigate("/")
    }
  }

  return (
    <div className="relative left-0 right-0 flex justify-around items-center py-3 px-2 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-10">
      <NavItem
        icon={<FaHome size="20" />}
        label="Home"
        active={activePage === "home"}
        onClick={() => handleNavigation("home")}
      />
      <NavItem
        icon={<FaUser size="20" />}
        label="Profile"
        active={activePage === "profile"}
        onClick={() => handleNavigation("profile")}
      />
      <NavItem
        icon={<FaUsers size="20" />}
        label="Groups"
        active={activePage === "groups"}
        onClick={() => handleNavigation("groups")}
      />
      <NavItem
        icon={<FaSignOutAlt size="20" />}
        label="Logout"
        active={false}
        onClick={onLogout}
      
      />
    </div>
  )
}

const NavItem = ({ icon, label, active, onClick, className = "" }) => {
  return (
    <button className="flex flex-col items-center justify-center w-16" onClick={onClick}>
      <div
        className={`relative flex items-center justify-center ${active ? "text-blue-500" : `text-gray-500 dark:text-gray-400 ${className}`}`}
      >
        {icon}
        {active && <div className="absolute -top-1 w-2 h-2 bg-blue-500 rounded-full" />}
      </div>
      <span className={`text-xs mt-1 ${active ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
    </button>
  )
}

export default MobileNav

