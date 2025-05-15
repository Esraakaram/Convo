import { useState, useEffect } from "react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "../api";

const AnimatedBackground = ({ darkMode }) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shapes = [];
  const shapeCount = 15;

  for (let i = 0; i < shapeCount; i++) {
    const size = Math.random() * 100 + 20;
    shapes.push({
      id: i,
      x: Math.random() * windowSize.width,
      y: Math.random() * windowSize.height,
      size: size,
      animationDuration: Math.random() * 20 + 10,
      animationDelay: Math.random() * 5,
      type: Math.random() > 0.5 ? "circle" : "square",
    });
  }

  const animationKeyframes = `
    @keyframes float {
      0% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(100px, -50px) rotate(90deg); }
      50% { transform: translate(50px, 100px) rotate(180deg); }
      75% { transform: translate(-50px, 50px) rotate(270deg); }
      100% { transform: translate(0, 0) rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.6; }
    }
  `;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute inset-0 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
            : "bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-50"
        } opacity-40`}
        style={{
          animation: "pulse 4s infinite ease-in-out",
        }}
      />
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`
            absolute opacity-10
            ${darkMode ? "bg-blue-300" : "bg-blue-600"}
            ${shape.type === "circle" ? "rounded-full" : "rounded-md"}
          `}
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            filter: "blur(2px)",
            animation: `float ${shape.animationDuration}s infinite ease-in-out`,
            animationDelay: `${shape.animationDelay}s`,
          }}
        />
      ))}
      <style jsx>{animationKeyframes}</style>
    </div>
  );
};

const Signin = ({ onLogin, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState(location.state?.password || "");
  const [showPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("All fields required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginUser({ email, password });
      
      // Ensure we have a token
      if (!response.token) {
        throw new Error("No authentication token received");
      }
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Create user data object
      const userData = {
        id: response.id,
        username: response.username || email.split('@')[0],
        email: response.email,
        profileImage: response.profileImage || "https://randomuser.me/api/portraits/women/44.jpg",
      };
      
      // Update app state
      onLogin(userData);
      
      // Navigate to home page
      navigate("/", { state: { user: userData } });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-400 overflow-hidden"
    >
      <AnimatedBackground darkMode={darkMode} />
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex-1 flex items-center justify-center px-4 mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md p-8 bg-gradient-to-br from-white via-indigo-50 to-white dark:from-slate-800 dark:via-indigo-900 dark:to-slate-800 rounded-3xl shadow-2xl backdrop-blur-md dark:shadow-indigo-800/40 border border-gray-200/50 dark:border-slate-700/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/10 via-indigo-800/10 to-indigo-800/10 dark:from-indigo-800/10 dark:via-indigo-800/10 dark:to-indigo-800/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent dark:via-white/5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent dark:via-white/5 pointer-events-none" />
          <div className="relative z-10">
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-800 to-indigo-800 dark:from-white dark:to-white bg-clip-text text-transparent"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center text-gray-600 dark:text-gray-400 mb-8"
            >
              Sign in to continue to your account
            </motion.p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-center border border-red-200 dark:border-red-800/50"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-800 dark:group-hover:text-indigo-800 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-800 dark:bg-slate-700/50 dark:text-white transition-all duration-300 group-hover:border-indigo-800 dark:group-hover:border-indigo-800"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-800 dark:group-hover:text-indigo-800 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-800 dark:bg-slate-700/50 dark:text-white transition-all duration-300 group-hover:border-indigo-800 dark:group-hover:border-indigo-800"
                    placeholder="Enter your password"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <Button
                  type="submit"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.2)",
                    background: "linear-gradient(45deg, #3730a3, #312e81, #3730a3)",
                    backgroundSize: "200% 200%",
                    animation: "gradient 3s ease infinite"
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    boxShadow: "0 5px 15px -5px rgba(79, 70, 229, 0.3)"
                  }}
                  className={`w-full py-3 px-4 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:ring-offset-2 bg-gradient-to-r from-indigo-800 via-indigo-800 to-indigo-800 hover:from-indigo-900 hover:via-indigo-900 hover:to-indigo-900 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span className="ml-2">Loading</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative overflow-hidden"
                    >
                      <motion.span
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative z-10"
                      >
                        Sign In
                      </motion.span>
                      <motion.div
                        initial={{ x: -100 }}
                        animate={{ x: 100 }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-800 dark:text-indigo-800 hover:text-indigo-900 dark:hover:text-indigo-900 font-medium transition-colors duration-300"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signin;

