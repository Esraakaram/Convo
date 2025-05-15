import { useState, useEffect } from "react";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (

     <header className="fixed top-0 left-0 right-0 flex justify-between items-center   pr-4 pl-4 pt-2 pb-2 bg-white dark:bg-slate-800 shadow-md z-10 animate-fade-in w-screen ">
            <div className="flex items-center">
            <img src="https://img.icons8.com/?size=100&id=hCvhdugyicF1&format=png&color=000000" width={"50px"}  height={"10px"} alt="logo" ></img>

              <h1 className="text-2xl font-bold ml-2 text-black dark:text-gray-50 font-englebert ">
                Convo
              </h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="relative p-2 rounded-full overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
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
          </header>
    
)}