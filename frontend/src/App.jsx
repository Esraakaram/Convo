import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Groups from "./pages/groups";
import "./index.css";
import EditProfile from "./pages/EditProfile";
import Friends from "./pages/Friends";
import GroupChatPage from "./pages/GroupChatPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      // Only set as authenticated if the user is not marked as logged out
      if (!userData.isLoggedOut) {
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
    }

    // Check dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // This function toggles the dark mode on and off.
  // It updates the 'darkMode' state by flipping its current value,
  // saves the new preference in localStorage for persistence across sessions,
  // and adds or removes the 'dark' class on the <html> element to enable or disable Tailwind CSS dark styling.
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // When the user logs in, their data is saved and their status is updated.
  const handleLogin = (userData) => {
    // Check if we have existing user data in localStorage
    const existingUserData = localStorage.getItem("user");
    let finalUserData = userData;
    
    if (existingUserData) {
      const existingUser = JSON.parse(existingUserData);
      // If we have existing data, merge it with the new login data
      // This preserves profile picture and other settings
      finalUserData = {
        ...userData,
        profileImage: existingUser.profileImage || userData.profileImage,
        // Add any other fields you want to preserve
      };
    }
    
    setCurrentUser(finalUserData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(finalUserData));
  };
  // same for logout
  const handleLogout = () => {
    // Remove tokens and cookies
    localStorage.removeItem('token');
    
    // Make a logout request to invalidate the server-side cookie
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(err => console.error('Logout error:', err));
    
    // Update user data in localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      // Keep the user data but mark as logged out
      localStorage.setItem("user", JSON.stringify({...user, isLoggedOut: true}));
    }
    
    // Update app state
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div
        className={`h-screen w-screen ${
          darkMode ? "dark" : ""
        }`}
      >
        <Routes>
          <Route
            path="/signin"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Signin
                  onLogin={handleLogin}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              )
            }
          />
          <Route
           path="/signup" element={  
                <Signup
                  onLogin={handleLogin}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Home
                  user={currentUser}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/signin" /> // هيوديه للساين ان
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile
                  user={currentUser}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          
          <Route
            path="/groups"
            element={
              isAuthenticated ? (
                <Groups
                  user={currentUser}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />

          <Route
            path="/edit-profile"
            element={
              isAuthenticated ? (
                <EditProfile
                  user={currentUser}
                  setUser={setCurrentUser}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />

          <Route
            path="/friends"
            element={
              <Friends
                user={currentUser}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />

          <Route
            path="/groups/:groupId"
            element={
              isAuthenticated ? (
                <GroupChatPage
                  user={currentUser}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/signin"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

