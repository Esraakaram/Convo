import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaMoon, FaSun, FaUserFriends } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import MobileNavbar from "../components/mobile-navbar";
import FriendManagement from "../components/FriendManagement";

const Friends = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("friends");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-md z-10"
      >
        <div className="flex justify-between items-center px-4 py-2">
          {isMobile ? (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full"
            >
              <FaBars className="text-gray-600 dark:text-gray-300" />
            </button>
          ) : null}

          <div className="flex items-center">
            <FaUserFriends className="text-indigo-600 dark:text-indigo-400 text-2xl mr-2" />
            <h1 className="text-2xl font-bold text-black dark:text-gray-50">
              Friends
            </h1>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-700"
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-700" />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-md z-10"
          >
            <MobileNavbar
              activePage={activePage}
              setActivePage={(page) => {
                setActivePage(page);
                navigate(page === "home" ? "/" : `/${page}`);
              }}
              user={user}
              onLogout={onLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block md:w-20 flex-shrink-0 bg-indigo-800 rounded-2xl dark:bg-indigo-800 m-1 border-r border-gray-200 dark:border-slate-700"
        >
          <Sidebar
            activePage={activePage}
            setActivePage={(page) => {
              setActivePage(page);
              navigate(page === "home" ? "/" : `/${page}`);
            }}
            user={user}
            onLogout={onLogout}
          />
        </motion.div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="w-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-auto">
            <FriendManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends; 