import { useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaUsers, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const iconMap = {
  Home: <FaHome size="20" />,
  Profile: <FaUser size="20" />,
  Groups: <FaUsers size="20" />,
  Friends: <FaUserFriends size="20" />,
};

const links = [
  { name: "Home", path: "/" },
  { name: "Friends", path: "/friends" },
  { name: "Profile", path: "/profile" },
  { name: "Groups", path: "/groups" },
];

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigation = (page, path) => {
    setActivePage(page);
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-between w-20 py-8 dark:bg-indigo-800 rounded-2xl h-full"
    >
      {/* Navigation */}
      <nav className="flex flex-col items-center space-y-8">
        {links.map((link, index) => (
          <SidebarIcon
            key={link.name}
            icon={iconMap[link.name]}
            label={link.name}
            active={activePage.toLowerCase() === link.name.toLowerCase()}
            onClick={() => handleNavigation(link.name.toLowerCase(), link.path)}
            index={index}
          />
        ))}
      </nav>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-auto"
      >
        <SidebarIcon
          icon={<FaSignOutAlt size="20" />}
          label="Logout"
          active={false}
          onClick={onLogout}
          className="text-white"
        />
      </motion.div>
    </motion.div>
  );
};

const SidebarIcon = ({ icon, label, active, onClick, className = "", index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex flex-col items-center"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full text-white hover:bg-blue-400 transition-all duration-200 ${
            active ? "bg-blue-400" : ""
          } ${className}`}
          onClick={onClick}
        >
          {icon}
        </Button>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-white mt-1"
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

export default Sidebar;
