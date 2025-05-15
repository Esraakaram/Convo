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

  // دالة تسجيل الخروج مع إعادة التوجيه
  const handleLogout = () => {
    onLogout();
    navigate("/signin");
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 shadow-md z-10 animate-fade-in"
      >
        <div className="flex justify-between items-center pr-4 pl-4 pt-2 pb-2 ">
          {isMobile ? (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full mr-2"
            >
              <FaBars className="text-gray-600 dark:text-gray-300" />
            </button>
          ) : null}

          <div className="flex items-center">
            <img
              src="https://img.icons8.com/?size=100&id=hCvhdugyicF1&format=png&color=000000"
              width={"50px"}
              height={"10px"}
              alt="logo"
            ></img>

            <h1 className="text-2xl font-bold ml-2 text-black dark:text-gray-50 font-englebert">
              Convo
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full  transition-all duration-300 shadow-md hover:shadow-lg"
            style={{
              backgroundColor: darkMode ? "#0f172a" : "#f0f9ff",
              width: "48px",
              height: "48px",
              transform: darkMode ? "rotate(180deg)" : "rotate(0deg)",
              transition: "background-color 0.5s, transform 0.5s",
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: darkMode ? 0 : 1,
                transition: "opacity 0.5s",
                transform: darkMode ? "scale(0.5)" : "scale(1)",
              }}
            >
              <div className="relative">
                <FaMoon style={{ color: "#334155", fontSize: "20px" }} />
                <div
                  className="absolute top-0 right-0 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "#94a3b8",
                    transform: "translate(25%, -25%)",
                  }}
                />
              </div>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: darkMode ? 1 : 0,
                transition: "opacity 0.5s",
                transform: darkMode ? "scale(1)" : "scale(0.5)",
              }}
            >
              <div className="relative">
                <FaSun style={{ color: "#fbbf24", fontSize: "22px" }} />
                <div
                  className="absolute top-0 left-0 w-1 h-1 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "#fef3c7",
                    boxShadow: "0 0 8px 2px rgba(251, 191, 36, 0.6)",
                  }}
                />
              </div>
            </div>

            <div
              className="absolute inset-0 bg-gradient-to-br"
              style={{
                opacity: 0.1,
                background: darkMode
                  ? "radial-gradient(circle at 70% 70%, #60a5fa, transparent 50%)"
                  : "radial-gradient(circle at 30% 30%, #fbbf24, transparent 50%)",
              }}
            />
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
              onLogout={handleLogout}
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
            onLogout={handleLogout}
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